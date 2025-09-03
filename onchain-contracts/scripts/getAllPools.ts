import { ethers } from "hardhat";

async function getAllPools() {
  const PoolContract = "CricketPredictionPools";
  const CricketPredictionPoolsAddress =
    "0xf62F3506F0fA02be05Bb9E0DfE1b8FFBBF3362e8";
  const [signer] = await ethers.getSigners();

  const contract = await ethers.getContractAt(
    PoolContract,
    CricketPredictionPoolsAddress,
    signer
  );

  const nextPoolId = await contract.nextPoolId();
  const totalPools = Number(nextPoolId) - 1;

  console.log(`📌 Total Pools: ${totalPools}`);

  for (let i = 1; i <= totalPools; i++) {
    const pool = await contract.pools(i);
    const options = await contract.getOptions(i);

    console.log(`\n===== Pool #${i} =====`);
    console.log("Match Name:", pool.name);
    console.log("Description:", pool.desc);
    console.log("Entry Fee:", ethers.formatEther(pool.entryFee), "ETH");
    console.log("Start Time:", new Date(Number(pool.startTime) * 1000).toISOString());
    console.log("Lock Time:", new Date(Number(pool.lockTime) * 1000).toISOString());
    console.log("Entries:", pool.totalEntries.toString());
    console.log("Options:", options);
    console.log("Resolved:", pool.resolved);
    console.log("Winning Option:", pool.winnersCount);
  }
}

async function main() {
  await getAllPools();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
