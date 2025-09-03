// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CricketPredictionPools
 * @notice Simple, gas-conscious prediction market for cricket matches with fixed-entry pools.
 *         - Admin creates a pool with multiple options (e.g., Team A, Team B, Draw, etc.)
 *         - Users join once per wallet and pick one option before lockTime
 *         - Admin resolves with the winning option after the match
 *         - Winners split the pot equally after a platform fee (basis points) is taken
 *         - Claims are pull-based (no loops over users) to avoid gas blowups
 *         - Supports both native ETH and ERC20 tokens (set token = address(0) for ETH)
 */

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CricketPredictionPools is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ====== Events ======
    event PoolCreated(
        uint256 indexed poolId,
        string name,
        string desc,
        address indexed token,
        uint256 entryFee,
        uint64 startTime,
        uint64 lockTime,
        uint16 platformFeeBps,
        string[] options
    );

    event Joined(
        uint256 indexed poolId,
        address indexed player,
        uint8 optionIndex,
        uint256 paid
    );

    event Resolved(
        uint256 indexed poolId,
        uint8 winningOption,
        uint256 totalPot,
        uint256 platformFee,
        uint256 netPot,
        uint256 winnersCount
    );

    event Claimed(
        uint256 indexed poolId,
        address indexed player,
        uint256 amount
    );

    event Canceled(uint256 indexed poolId);

    // ====== Storage ======
    struct PoolInfo {
        // lifecycle
        uint64 startTime;   // when the pool is visible/joins allowed (informational)
        uint64 lockTime;    // no more joins after this time
        bool resolved;      // true once outcome is set
        bool canceled;      // true if admin cancels; participants can refund

        // economics
        address token;      // address(0) for ETH
        uint256 entryFee;   // fixed per wallet
        uint16 platformFeeBps; // fee taken on resolution (0-10000)
        uint256 totalPot;   // sum of all entries (entryFee * totalEntries)
        uint256 platformFee; // computed and locked-in at resolve time
        uint256 netPot;      // totalPot - platformFee

        // metadata
        string name;        // e.g., "IND vs AUS - Match Winner"
        string desc;        // e.g., "IND vs AUS - Match Winner"
        string[] options;   // e.g., ["IND", "AUS", "Draw"]
        uint8 winningOption; // index into options

        // accounting
        uint256 totalEntries; // total joined wallets
        uint256 winnersCount; // frozen on resolve (optionEntryCount[winning])
    }

    // poolId => PoolInfo
    mapping(uint256 => PoolInfo) public pools;

    // poolId => player => joined?
    mapping(uint256 => mapping(address => bool)) public hasJoined;

    // poolId => player => chosen option index
    mapping(uint256 => mapping(address => uint8)) public pickOf;

    // poolId => optionIndex => count of entries
    mapping(uint256 => mapping(uint8 => uint256)) public optionEntryCount;

    // poolId => player => claimed?
    mapping(uint256 => mapping(address => bool)) public claimed;

    // destination for platform fee
    address public feeRecipient;

    // running pool counter
    uint256 public nextPoolId = 1;

    // constants
    uint16 public constant MAX_BPS = 10_000; // 100%

    constructor(address _owner, address _feeRecipient) Ownable(_owner) {
        require(_feeRecipient != address(0), "feeRecipient=0");
        feeRecipient = _feeRecipient;
    }

    // ====== Admin ======

    function setFeeRecipient(address _to) external onlyOwner {
        require(_to != address(0), "feeRecipient=0");
        feeRecipient = _to;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @notice Create a new prediction pool.
     * @param name A human-readable title
        * @param desc A human-readable description
     * @param token Address of ERC20 to use; set address(0) for native ETH
     * @param entryFee Fixed entry price per wallet
     * @param startTime When pool becomes active (informational)
     * @param lockTime No more joins/picks after this timestamp
     * @param platformFeeBps Fee share in basis points (0-10000)
     * @param options Array of option strings (len >= 2)
     */
    function createPool(
        string calldata name,
        string calldata desc,
        address token,
        uint256 entryFee,
        uint64 startTime,
        uint64 lockTime,
        uint16 platformFeeBps,
        string[] calldata options
    ) external onlyOwner whenNotPaused returns (uint256 poolId) {
        require(options.length >= 2, "min 2 options");
        require(lockTime > block.timestamp, "lock in past");
        require(platformFeeBps <= MAX_BPS, "fee too high");
        require(entryFee > 0, "entryFee=0");

        poolId = nextPoolId++;
        PoolInfo storage p = pools[poolId];
        p.startTime = startTime;
        p.lockTime = lockTime;
        p.token = token;
        p.entryFee = entryFee;
        p.platformFeeBps = platformFeeBps;
        p.name = name;
        p.desc=desc;

        // copy options into storage
        for (uint256 i = 0; i < options.length; i++) {
            p.options.push(options[i]);
        }

        emit PoolCreated(poolId, name,desc, token, entryFee, startTime, lockTime, platformFeeBps, p.options);
    }

    /**
     * @notice Cancel an unresolved pool. Participants can claim refunds.
     */
    function cancelPool(uint256 poolId) external onlyOwner {
        PoolInfo storage p = pools[poolId];
        require(!p.canceled, "already canceled");
        require(!p.resolved, "already resolved");
        require(p.lockTime > 0, "pool !exist");
        p.canceled = true;
        emit Canceled(poolId);
    }

    /**
     * @notice Resolve a pool with the winning option index.
     *         Takes the platform fee immediately and freezes winners count.
     */
    function resolvePool(uint256 poolId, uint8 winningOption) external onlyOwner nonReentrant {
        PoolInfo storage p = pools[poolId];
        require(!p.resolved && !p.canceled, "done/canceled");
        require(p.lockTime > 0, "pool !exist");
        require(block.timestamp >= p.lockTime, "not locked yet");
        require(winningOption < p.options.length, "bad option");

        p.winningOption = winningOption;
        p.winnersCount = optionEntryCount[poolId][winningOption];
        p.platformFee = (p.totalPot * p.platformFeeBps) / MAX_BPS;
        p.netPot = p.totalPot - p.platformFee;
        p.resolved = true;

        // Transfer out platform fee now (pull model for winners later)
        if (p.platformFee > 0) {
            if (p.token == address(0)) {
                (bool ok, ) = payable(feeRecipient).call{value: p.platformFee}("");
                require(ok, "fee xfer failed");
            } else {
                IERC20(p.token).safeTransfer(feeRecipient, p.platformFee);
            }
        }

        emit Resolved(poolId, winningOption, p.totalPot, p.platformFee, p.netPot, p.winnersCount);
    }

    // ====== Player Actions ======

    /**
     * @notice Join a pool and pick your option. One entry per wallet.
     *         For ETH pools, send exact entryFee as msg.value.
     *         For ERC20 pools, approve this contract for entryFee first.
     */
    function joinPool(uint256 poolId, uint8 optionIndex) external payable whenNotPaused nonReentrant {
        PoolInfo storage p = pools[poolId];
        require(p.lockTime > 0, "pool !exist");
        require(block.timestamp < p.lockTime, "locked");
        require(!p.canceled && !p.resolved, "closed");
        require(optionIndex < p.options.length, "bad option");
        require(!hasJoined[poolId][msg.sender], "already joined");

        // Collect entry fee
        if (p.token == address(0)) {
            require(msg.value == p.entryFee, "wrong ETH");
        } else {
            require(msg.value == 0, "no ETH");
            IERC20(p.token).safeTransferFrom(msg.sender, address(this), p.entryFee);
        }

        // Record join
        hasJoined[poolId][msg.sender] = true;
        pickOf[poolId][msg.sender] = optionIndex;
        optionEntryCount[poolId][optionIndex] += 1;
        p.totalEntries += 1;
        p.totalPot += p.entryFee;

        emit Joined(poolId, msg.sender, optionIndex, p.entryFee);
    }

    /**
     * @notice Claim winnings after resolution, or refund after cancellation.
     */
    function claim(uint256 poolId) external nonReentrant {
        PoolInfo storage p = pools[poolId];
        require(p.lockTime > 0, "pool !exist");
        require(hasJoined[poolId][msg.sender], "not a player");
        require(!claimed[poolId][msg.sender], "claimed");

        uint256 payout;

        if (p.canceled) {
            // Refund
            payout = p.entryFee;
        } else {
            require(p.resolved, "not resolved");
            if (p.winnersCount == 0) {
                // Edge case: no winners -> allow owner to sweep later, but players get 0
                payout = 0;
            } else if (pickOf[poolId][msg.sender] == p.winningOption) {
                payout = p.netPot / p.winnersCount;
            } else {
                payout = 0;
            }
        }

        claimed[poolId][msg.sender] = true;

        if (payout > 0) {
            if (p.token == address(0)) {
                (bool ok, ) = payable(msg.sender).call{value: payout}("");
                require(ok, "pay fail");
            } else {
                IERC20(p.token).safeTransfer(msg.sender, payout);
            }
        }

        emit Claimed(poolId, msg.sender, payout);
    }

    // ====== Rescue / Admin Sweeps ======

    /**
     * @notice Sweep leftover pot if no winners (after resolution), or sweep stuck ETH/ERC20 (admin only).
     *         Only callable when there are no winners or for non-pool balances.
     */
    function sweepNoWinners(uint256 poolId, address to) external onlyOwner nonReentrant {
        require(to != address(0), "to=0");
        PoolInfo storage p = pools[poolId];
        require(p.resolved && !p.canceled, "bad state");
        require(p.winnersCount == 0, "winners exist");

        uint256 amount = p.netPot;
        p.netPot = 0; // prevent double sweep
        if (amount > 0) {
            if (p.token == address(0)) {
                (bool ok, ) = payable(to).call{value: amount}("");
                require(ok, "sweep fail");
            } else {
                IERC20(p.token).safeTransfer(to, amount);
            }
        }
    }

    // ====== Views ======

    function getOptions(uint256 poolId) external view returns (string[] memory) {
        return pools[poolId].options;
    }

    function playerInfo(uint256 poolId, address player) external view returns (
        bool _hasJoined,
        uint8 _pick,
        bool _claimed
    ) {
        _hasJoined = hasJoined[poolId][player];
        _pick = pickOf[poolId][player];
        _claimed = claimed[poolId][player];
    }

    // ====== Receive ETH ======
    receive() external payable {}
}
