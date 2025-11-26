const hre = require("hardhat");
const { formatEther, parseEther } = require("viem");

async function main() {
  console.log("🚀 Deploying LUDIMINT contracts to Celo Sepolia...\n");

  // Get deployer using viem
  const [deployer] = await hre.viem.getWalletClients();
  const deployerAddress = deployer.account.address;
  
  console.log("Deployer:", deployerAddress);
  console.log("Network: Celo Sepolia (Chain ID: 11142220)\n");

  // Check balance
  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployerAddress });
  console.log(`Balance: ${formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.log("⚠️  WARNING: Deployer has zero balance!");
    console.log("Get testnet funds from: https://faucet.celo.org/sepolia\n");
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
  console.log(`NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org`);
  console.log(`NEXT_PUBLIC_EXPLORER_URL=https://celo-sepolia.blockscout.com`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=11142220\n`);

  console.log("🔍 View on block explorer:");
  console.log(`ReputationNFT:     https://celo-sepolia.blockscout.com/address/${reputationNFT.address}`);
  console.log(`TournamentFactory: https://celo-sepolia.blockscout.com/address/${factory.address}\n`);

  // Save to file for reference
  const fs = require("fs");
  const deploymentInfo = {
    network: "celo-sepolia",
    chainId: 11142220,
    deployer: deployerAddress,
    contracts: {
      reputationNFT: reputationNFT.address,
      tournamentFactory: factory.address,
    },
    deployedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    "deployments.sepolia.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployments.sepolia.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
