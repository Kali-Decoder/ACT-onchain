import { ethers, artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function deployOnchainCricketPools() {
  const CONTRACT_NAME = "CricketPredictionPools";
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  // Deploy contract with constructor args
  const onchainCricketPools = await ethers.deployContract(CONTRACT_NAME, [
    deployer.address, // admin
    deployer.address, // treasury or verifier
  ]);

  await onchainCricketPools.waitForDeployment();
  const contractAddress = await onchainCricketPools.getAddress();

  console.log(`✅ Deployed ${CONTRACT_NAME} at: ${contractAddress}`);

  // Get ABI
  const artifact = await artifacts.readArtifact(CONTRACT_NAME);

  // Save deployment data
  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentData = {
    contractName: CONTRACT_NAME,
    address: contractAddress,
    deployer: deployer.address,
    abi: artifact.abi
  };

  const filePath = path.join(deploymentsDir, `${CONTRACT_NAME}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));

  console.log(`📂 Deployment data saved to: ${filePath}`);
}

async function main() {
  await deployOnchainCricketPools();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
