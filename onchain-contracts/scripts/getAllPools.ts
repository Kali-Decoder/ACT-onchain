import { ethers } from "hardhat";
import deployments from "../deployments/CricketPredictionPools.json";
async function getAllPools() {
  const PoolContract = "CricketPredictionPools";
  const CricketPredictionPoolsAddress = deployments.address;
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
    const pool = await contract.getPool(i); // this already includes options
    // pool is Result(10) like you logged

    console.log(`\n===== Pool #${i} =====`);
    console.log("Match Name:", pool[0]); // name
    console.log("Description:", pool[1]); // desc
    console.log("Token Address:", pool[2]);
    console.log("Entry Fee:", ethers.formatEther(pool[3]), "ETH");
    console.log("Start Time:", new Date(Number(pool[4]) * 1000).toISOString());
    console.log("Lock Time:", new Date(Number(pool[5]) * 1000).toISOString());
    console.log("Platform Fee (bps):", pool[6].toString());
    console.log("Options:", pool[7]); // already array
    console.log("Resolved:", pool[8]);
    console.log("Winners Count:", pool[9].toString());
  }

}

async function main() {
  await getAllPools();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
