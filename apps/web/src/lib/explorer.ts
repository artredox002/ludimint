/**
 * Get block explorer URL for Celo network
 */
export function getExplorerUrl(chainId?: number): string {
  // Default to Alfajores testnet
  if (chainId === 44787 || !chainId) {
    return "https://alfajores.celoscan.io"
  }
  // Mainnet
  if (chainId === 42220) {
    return "https://celoscan.io"
  }
  return "https://alfajores.celoscan.io"
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

