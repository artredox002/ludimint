import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Deploy", (m) => {
  // Get the deployer account address
  // In Hardhat Ignition, we can use m.getAccount() to get the deployer
  const deployer = m.getAccount(0);
  
  // Deploy ReputationNFT with deployer as owner
  const reputationNFT = m.contract("ReputationNFT", [
    deployer,
    "LUDIMINT Reputation Badges",
    "LUDI",
    "https://ipfs.io/ipfs/"
  ]);

  // Deploy TournamentFactory with deployer as owner
  const factory = m.contract("TournamentFactory", [deployer]);

  return { reputationNFT, factory };
});
