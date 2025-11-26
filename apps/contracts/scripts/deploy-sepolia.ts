import { deploy } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying LUDIMINT contracts to Celo Sepolia...\n");

  // Get deployer address
  const [deployer] = await hre.viem.getWalletClients();
  const deployerAddress = deployer.account.address;
  
  console.log("Deployer address:", deployerAddress);
  console.log("Network: Celo Sepolia (Chain ID: 11142220)\n");

  // Deploy contracts
  const { reputationNFT, factory } = await deploy("Deploy", {
    parameters: {
      Deploy: {
        owner: deployerAddress,
      },
    },
  });

  console.log("\n✅ Deployment Complete!\n");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`ReputationNFT: ${reputationNFT.address}`);
  console.log(`TournamentFactory: ${factory.address}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📝 Update your frontend .env with:");
  console.log(`NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=${reputationNFT.address}`);
  console.log(`NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=${factory.address}\n`);

  console.log("🔍 Verify contracts on:");
  console.log(`https://celo-sepolia.blockscout.com/address/${reputationNFT.address}`);
  console.log(`https://celo-sepolia.blockscout.com/address/${factory.address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

