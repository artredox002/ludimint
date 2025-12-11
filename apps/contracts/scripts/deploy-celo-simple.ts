import hre from "hardhat";
import { formatEther } from "viem";

async function main() {
  console.log("🚀 Deploying LUDIMINT contracts to Celo Mainnet...\n");

  // Get deployer - Hardhat will use PRIVATE_KEY from environment or hardhat.config
  const signers = await hre.viem.getWalletClients();
  const deployer = signers[0];
  const deployerAddress = deployer.account.address;
  
  console.log("Deployer:", deployerAddress);
  console.log("Network: Celo Mainnet (Chain ID: 42220)\n");

  // Check balance
  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployerAddress });
  console.log(`Balance: ${formatEther(balance)} CELO\n`);

  if (balance === 0n) {
    console.log("⚠️  WARNING: Deployer has zero balance!");
    console.log("Please ensure your wallet has sufficient CELO for deployment.\n");
    return;
  }

  console.log("📦 Deploying ReputationNFT...");
  const reputationNFT = await hre.viem.deployContract("ReputationNFT", [
    deployerAddress,
    "LUDIMINT Reputation Badges",
    "LUDI",
    "https://ipfs.io/ipfs/"
  ]);
  console.log(`✅ ReputationNFT deployed: ${reputationNFT.address}\n`);

  console.log("📦 Deploying TournamentFactory...");
  const factory = await hre.viem.deployContract("TournamentFactory", [
    deployerAddress
  ]);
  console.log(`✅ TournamentFactory deployed: ${factory.address}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("📋 Contract Addresses:");
  console.log(`ReputationNFT:     ${reputationNFT.address}`);
  console.log(`TournamentFactory: ${factory.address}\n`);

  console.log("📝 Update your frontend .env with:");
  console.log(`NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=${reputationNFT.address}`);
  console.log(`NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=${factory.address}`);
  console.log(`NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org`);
  console.log(`NEXT_PUBLIC_EXPLORER_URL=https://celoscan.io`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=42220\n`);

  console.log("🔍 View on block explorer:");
  console.log(`ReputationNFT:     https://celoscan.io/address/${reputationNFT.address}`);
  console.log(`TournamentFactory: https://celoscan.io/address/${factory.address}\n`);

  // Verify contracts if API key is provided
  if (process.env.CELOSCAN_API_KEY) {
    console.log("🔐 Verifying contracts on Celoscan...\n");
    try {
      await hre.run("verify:verify", {
        address: reputationNFT.address,
        constructorArguments: [
          deployerAddress,
          "LUDIMINT Reputation Badges",
          "LUDI",
          "https://ipfs.io/ipfs/"
        ],
      });
      console.log("✅ ReputationNFT verified\n");
    } catch (error) {
      console.log("⚠️  ReputationNFT verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: factory.address,
        constructorArguments: [deployerAddress],
      });
      console.log("✅ TournamentFactory verified\n");
    } catch (error) {
      console.log("⚠️  TournamentFactory verification failed:", error);
    }
  } else {
    console.log("ℹ️  Skipping contract verification (CELOSCAN_API_KEY not set)\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

