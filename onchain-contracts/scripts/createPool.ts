import { ethers } from "hardhat";
import deployments  from "../deployments/CricketPredictionPools.json";
async function createPool() {
  const PoolContract = "CricketPredictionPools";
  const CricketPredictionPoolsAddress = deployments.address;

  // signer
  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as string,
    ethers.provider
  );

  console.log("Deployer:", sender.address);

  // attach to deployed contract
  const contract = await ethers.getContractAt(
    PoolContract,
    CricketPredictionPoolsAddress,
    sender
  );

  console.log("Creating pool...");

  // prepare parameters
  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60; // start in 1 min
  const lockTime = startTime + 60 * 60*10; // lock after 4 hr
  const entryFee = ethers.parseEther("1"); // 1 ETH
  const maxParticipants = 500;

  const tx = await contract.createPool(
    "Who will score most runs",             // match name
    "Athena Cricket Tournament",        // description
    ethers.ZeroAddress,       // token (native ETH)
    entryFee,                 // entry fee
    startTime,                // start time
    lockTime,                 // lock time
    maxParticipants,          // max participants
    ["Nikku", "Harsh","Brooklyn"]            // options
  );

  console.log("⏳ Tx sent:", tx.hash);

  const receipt = await tx.wait();

  console.log("✅ Pool created in block:", receipt?.blockNumber);

  // if event exists
  if (receipt?.logs) {
    try {
      const iface = new ethers.Interface([
        "event PoolCreated(uint256 indexed poolId, string matchName)"
      ]);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "PoolCreated") {
            console.log("🎉 Pool ID:", parsed.args.poolId.toString());
          }
        } catch {}
      }
    } catch (err) {
      console.log("⚠️ Could not parse PoolCreated event:", err);
    }
  }
}

async function main() {
  await createPool();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
