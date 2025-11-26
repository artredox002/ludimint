import hre from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const deployerAddress = deployer.account.address;

  console.log("🚀 Deploying ERC20Mock to", hre.network.name);
  console.log("Deployer:", deployerAddress);

  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployerAddress });
  console.log("Deployer balance:", formatEther(balance), "\n");

  const name = process.env.MOCK_TOKEN_NAME || "Ludimint Stable";
  const symbol = process.env.MOCK_TOKEN_SYMBOL || "LSTBL";
  const supply = parseEther(process.env.MOCK_TOKEN_SUPPLY || "1000000");

  console.log(`📦 Deploying token (${name} - ${symbol}) with supply ${formatEther(supply)}...`);
  const token = await hre.viem.deployContract("ERC20Mock", [name, symbol, supply]);

  console.log("\n✅ Deployment complete!");
  console.log("Token address:", token.address);
  console.log("\n👉 Update NEXT_PUBLIC_CUSD_ADDRESS with this address so the frontend uses the correct ERC20.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

