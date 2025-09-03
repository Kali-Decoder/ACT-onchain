import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CricketPredictionPools", function () {
  async function deployFixture() {
    const [owner, feeRecipient, user1, user2, user3] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("CricketPredictionPools");
    const contract = await Contract.deploy(owner.address, feeRecipient.address);

    // Dummy ERC20 token for testing
    const ERC20 = await ethers.getContractFactory("MockERC20");
    const token = await ERC20.deploy("TestToken", "TT");

    return { contract, token, owner, feeRecipient, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Sets correct owner and feeRecipient", async function () {
      const { contract, owner, feeRecipient } = await loadFixture(deployFixture);

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.feeRecipient()).to.equal(feeRecipient.address);
    });
  });

  describe("Pool Creation", function () {
    it("Creates ETH pool with options", async function () {
      const { contract } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;
      const tx = await contract.createPool(
        "Match", "Description",
        ethers.ZeroAddress, ethers.parseEther("1"),
        0, lockTime, 500,
        ["IND", "AUS"]
      );

      const pool = await contract.pools(1);
      expect(pool.entryFee).to.equal(ethers.parseEther("1"));
      expect(pool.token).to.equal(ethers.ZeroAddress);
    });

    it("Reverts if less than 2 options", async function () {
      const { contract } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;
      await expect(
        contract.createPool("Bad", "Desc", ethers.ZeroAddress, 1000, 0, lockTime, 0, ["OnlyOne"])
      ).to.be.revertedWith("min 2 options");
    });

    it("Reverts if lockTime is in past", async function () {
      const { contract } = await loadFixture(deployFixture);
      const past = (await time.latest()) - 1;
      await expect(
        contract.createPool("Bad", "Desc", ethers.ZeroAddress, 1000, 0, past, 0, ["A", "B"])
      ).to.be.revertedWith("lock in past");
    });
  });

  describe("Joining", function () {
    it("User joins ETH pool and records pick", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 0, ["IND", "AUS"]);

      await expect(contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("1") }))
        .to.emit(contract, "Joined").withArgs(1, user1.address, 0, ethers.parseEther("1"));

      const playerInfo = await contract.playerInfo(1, user1.address);
      expect(playerInfo[0]).to.equal(true); // hasJoined
      expect(playerInfo[1]).to.equal(0);   // pick
    });

    it("User joins ERC20 pool", async function () {
      const { contract, token, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;
      await contract.createPool("Match", "Desc", token.target, 100, 0, lockTime, 0, ["IND", "AUS"]);

      await token.mint(user1.address, 100);
      await token.connect(user1).approve(contract.target, 100);

      await expect(contract.connect(user1).joinPool(1, 1))
        .to.emit(contract, "Joined").withArgs(1, user1.address, 1, 100);
    });

    it("Reverts if wrong ETH amount sent", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 0, ["IND", "AUS"]);

      await expect(contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("0.5") }))
        .to.be.revertedWith("wrong ETH");
    });
  });

  describe("Resolving and Claiming", function () {
    it("Resolves pool and winners can claim", async function () {
      const { contract, owner, user1, user2, feeRecipient } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 100;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 1000, ["IND", "AUS"]);

      await contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("1") });
      await contract.connect(user2).joinPool(1, 0, { value: ethers.parseEther("1") });

      await time.increaseTo(lockTime);

      await expect(contract.connect(owner).resolvePool(1, 0))
        .to.emit(contract, "Resolved");

      const before = await ethers.provider.getBalance(user1.address);
      const tx = await contract.connect(user1).claim(1);
      const receipt = await tx.wait();
      const after = await ethers.provider.getBalance(user1.address);
      expect(after).to.be.greaterThan(before - receipt.gasUsed * receipt.gasPrice);
    });

    it("Refunds if pool is canceled", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 1000;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 0, ["IND", "AUS"]);

      await contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("1") });
      await contract.connect(owner).cancelPool(1);

      await expect(contract.connect(user1).claim(1))
        .to.emit(contract, "Claimed").withArgs(1, user1.address, ethers.parseEther("1"));
    });

    it("Non-winners get 0 payout", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 100;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 0, ["IND", "AUS"]);

      await contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("1") });
      await contract.connect(user2).joinPool(1, 1, { value: ethers.parseEther("1") });

      await time.increaseTo(lockTime);
      await contract.connect(owner).resolvePool(1, 0);

      await expect(contract.connect(user2).claim(1))
        .to.emit(contract, "Claimed").withArgs(1, user2.address, 0);
    });
  });

  describe("Sweep No Winners", function () {
    it("Owner can sweep if no winners", async function () {
      const { contract, owner, feeRecipient, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 100;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, ethers.parseEther("1"), 0, lockTime, 0, ["IND", "AUS"]);

      await contract.connect(user1).joinPool(1, 0, { value: ethers.parseEther("1") });

      await time.increaseTo(lockTime);
      await contract.connect(owner).resolvePool(1, 1); // nobody picked AUS

      await expect(contract.connect(owner).sweepNoWinners(1, feeRecipient.address))
        .not.to.be.reverted;
    });
  });

  describe("Pause/Unpause", function () {
    it("Prevents join when paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 1000;
      await contract.createPool("Match", "Desc", ethers.ZeroAddress, 1000, 0, lockTime, 0, ["A", "B"]);

      await contract.connect(owner).pause();
      await expect(contract.connect(user1).joinPool(1, 0, { value: 1000 }))
        .to.be.revertedWith("Pausable: paused");
    });
  });
});
