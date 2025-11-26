import { keccak256, encodePacked, toHex, getAddress } from "viem"

/**
 * Generate a random secret for commit-reveal
 */
export function generateSecret(): string {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return toHex(randomBytes)
}

/**
 * Compute commit hash: keccak256(address, tournamentAddress, secret, score)
 * Matches Solidity's keccak256(abi.encodePacked(playerAddress, uint256(uint160(tournamentAddress)), secret, score))
 * 
 * CRITICAL: The contract uses uint256(uint160(address(this))), so we must convert address to uint256 properly
 * 
 * @param playerAddress - Player's wallet address
 * @param tournamentAddress - Tournament contract address (converted to uint256(uint160(...)))
 * @param secret - Random secret generated locally
 * @param score - Player's score (must be a non-negative integer)
 */
export function computeCommitHash(
  playerAddress: `0x${string}`,
  tournamentAddress: `0x${string}`,
  secret: string,
  score: bigint | string | number
): `0x${string}` {
  // Validate inputs - addresses must be valid hex strings of correct length
  // We'll use getAddress to normalize, which will throw if invalid
  let normalizedPlayerAddress: `0x${string}`
  let normalizedTournamentAddress: `0x${string}`
  
  try {
    normalizedPlayerAddress = getAddress(playerAddress)
  } catch (error) {
    throw new Error(`Invalid player address format: ${playerAddress}`)
  }
  
  try {
    normalizedTournamentAddress = getAddress(tournamentAddress)
  } catch (error) {
    throw new Error(`Invalid tournament address format: ${tournamentAddress}`)
  }
  if (!secret || typeof secret !== 'string') {
    throw new Error('Invalid secret: must be a non-empty string')
  }

  // Ensure score is a non-negative integer
  let scoreBigInt: bigint
  if (typeof score === 'number') {
    if (isNaN(score) || !isFinite(score) || score < 0) {
      throw new Error(`Invalid score: ${score} (must be a non-negative integer)`)
    }
    scoreBigInt = BigInt(Math.floor(score))
  } else if (typeof score === 'string') {
    const parsed = parseInt(score, 10)
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(`Invalid score: ${score} (must be a non-negative integer)`)
    }
    scoreBigInt = BigInt(parsed)
  } else {
    if (score < 0n) {
      throw new Error(`Invalid score: ${score} (must be non-negative)`)
    }
    scoreBigInt = score
  }

  // Addresses are already normalized above
  
  // Convert tournament address to uint256(uint160(address))
  // In Solidity: uint256(uint160(address(this)))
  // In JavaScript: BigInt(address) where address is treated as uint160, then cast to uint256
  // Since BigInt can handle the full uint256 range, we can use BigInt directly
  // But we need to ensure it's treated as uint160 first (which it is, since addresses are 20 bytes = 160 bits)
  // Use the normalized address for conversion
  const tournamentId = BigInt(normalizedTournamentAddress)
  
  // Encode packed data to match Solidity's abi.encodePacked
  // Order: address, uint256, string, uint256
  // Contract: keccak256(abi.encodePacked(msg.sender, uint256(uint160(address(this))), secret, score))
  // Note: viem's encodePacked will handle address encoding correctly
  const packed = encodePacked(
    ['address', 'uint256', 'string', 'uint256'],
    [
      normalizedPlayerAddress, // Properly normalized address
      tournamentId, // This is uint256(uint160(address)) in Solidity
      secret,
      scoreBigInt
    ]
  )
  
  // Hash the packed data
  const hash = keccak256(packed)
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Commit Hash Computation]', {
      playerAddress: normalizedPlayerAddress,
      tournamentAddress: normalizedTournamentAddress,
      tournamentId: tournamentId.toString(),
      secret: secret.substring(0, 10) + '...',
      score: scoreBigInt.toString(),
      commitHash: hash,
    })
  }
  
  return hash
}

/**
 * Verify commit hash matches the reveal data
 * Returns true if the computed hash matches the provided commit hash
 */
export function verifyCommit(
  commitHash: `0x${string}`,
  playerAddress: `0x${string}`,
  tournamentAddress: `0x${string}`,
  secret: string,
  score: bigint | string | number
): boolean {
  if (!commitHash || !commitHash.startsWith('0x') || commitHash.length !== 66) {
    console.error('[Commit Verification] Invalid commit hash format:', commitHash)
    return false
  }

  try {
    const computed = computeCommitHash(playerAddress, tournamentAddress, secret, score)
    const matches = computed.toLowerCase() === commitHash.toLowerCase()
    
    if (!matches && process.env.NODE_ENV === 'development') {
      console.error('[Commit Verification] Hash mismatch:', {
        provided: commitHash.toLowerCase(),
        computed: computed.toLowerCase(),
        playerAddress: playerAddress.toLowerCase(),
        tournamentAddress: tournamentAddress.toLowerCase(),
        secret: secret.substring(0, 10) + '...',
        score: typeof score === 'number' ? Math.floor(score) : score.toString(),
      })
    }
    
    return matches
  } catch (error) {
    console.error('[Commit Verification] Error computing hash:', error)
    return false
  }
}

/**
 * Store commit data in local storage
 * @param tournamentAddress - Tournament contract address (used as key)
 * @param secret - The secret used for commit-reveal
 * @param score - Player's score (must be a non-negative integer)
 * @param commitHash - The computed commit hash
 */
export function storeCommitData(
  tournamentAddress: string,
  secret: string,
  score: number,
  commitHash: string
): void {
  // Validate inputs
  if (!tournamentAddress || !tournamentAddress.startsWith('0x')) {
    throw new Error('Invalid tournament address')
  }
  if (!secret || typeof secret !== 'string') {
    throw new Error('Invalid secret')
  }
  if (typeof score !== 'number' || isNaN(score) || !isFinite(score) || score < 0) {
    throw new Error(`Invalid score: ${score} (must be a non-negative integer)`)
  }
  if (!commitHash || !commitHash.startsWith('0x') || commitHash.length !== 66) {
    throw new Error('Invalid commit hash format')
  }

  // Ensure score is an integer
  const integerScore = Math.floor(score)
  
  const key = `commit_${tournamentAddress.toLowerCase()}`
  const data = {
    secret,
    score: integerScore, // Always store as integer
    commitHash: commitHash.toLowerCase(), // Normalize hash
    timestamp: Date.now(),
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Commit Storage] Stored commit data:', {
        tournamentAddress: tournamentAddress.toLowerCase(),
        score: integerScore,
        commitHash: commitHash.toLowerCase(),
      })
    }
  } catch (error) {
    console.error('[Commit Storage] Failed to store commit data:', error)
    throw new Error('Failed to store commit data in local storage')
  }
}

/**
 * Retrieve commit data from local storage
 * @param tournamentAddress - Tournament contract address
 */
export function getCommitData(tournamentAddress: string): {
  secret: string
  score: number
  commitHash: string
  timestamp: number
} | null {
  if (!tournamentAddress || !tournamentAddress.startsWith('0x')) {
    console.error('[Commit Retrieval] Invalid tournament address:', tournamentAddress)
    return null
  }

  const key = `commit_${tournamentAddress.toLowerCase()}`
  const stored = localStorage.getItem(key)
  if (!stored) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Commit Retrieval] No commit data found for:', tournamentAddress.toLowerCase())
    }
    return null
  }
  
  try {
    const data = JSON.parse(stored)
    
    // Validate retrieved data
    if (!data.secret || typeof data.secret !== 'string') {
      console.error('[Commit Retrieval] Invalid secret in stored data')
      return null
    }
    if (typeof data.score !== 'number' || isNaN(data.score) || data.score < 0) {
      console.error('[Commit Retrieval] Invalid score in stored data:', data.score)
      return null
    }
    if (!data.commitHash || !data.commitHash.startsWith('0x') || data.commitHash.length !== 66) {
      console.error('[Commit Retrieval] Invalid commit hash in stored data')
      return null
    }
    
    // Ensure score is an integer
    data.score = Math.floor(data.score)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Commit Retrieval] Retrieved commit data:', {
        tournamentAddress: tournamentAddress.toLowerCase(),
        score: data.score,
        commitHash: data.commitHash,
      })
    }
    
    return data
  } catch (error) {
    console.error('[Commit Retrieval] Failed to parse stored data:', error)
    return null
  }
}

/**
 * Clear commit data (after successful reveal)
 */
export function clearCommitData(tournamentAddress: string): void {
  const key = `commit_${tournamentAddress.toLowerCase()}`
  localStorage.removeItem(key)
}
