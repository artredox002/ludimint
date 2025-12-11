/**
 * Get block explorer URL for Celo network
 */
export function getExplorerUrl(chainId?: number): string {
  // Default to Mainnet
  if (chainId === 42220 || !chainId) {
    return "https://celoscan.io"
  }
  // Alfajores testnet
  if (chainId === 44787) {
    return "https://alfajores.celoscan.io"
  }
  // Sepolia testnet
  if (chainId === 11142220) {
    return "https://celo-sepolia.blockscout.com"
  }
  return "https://celoscan.io"
}

/**
 * Get transaction URL
 */
export function getTransactionUrl(txHash: string, chainId?: number): string {
  const baseUrl = getExplorerUrl(chainId)
  return `${baseUrl}/tx/${txHash}`
}

/**
 * Get address URL
 */
export function getAddressUrl(address: string, chainId?: number): string {
  const baseUrl = getExplorerUrl(chainId)
  return `${baseUrl}/address/${address}`
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(txHash: string): string {
  if (!txHash) return ""
  if (txHash.length < 10) return txHash
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
}

