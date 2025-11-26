/**
 * Test suite for commit-reveal functionality
 * This verifies that the frontend commit hash computation matches the contract's expected format
 */

import { describe, it, expect } from '@jest/globals'
import { keccak256, encodePacked, getAddress } from 'viem'
import { 
  generateSecret, 
  computeCommitHash, 
  verifyCommit,
  storeCommitData,
  getCommitData,
  clearCommitData
} from '../commit-reveal'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Commit-Reveal Flow', () => {
  const playerAddress = '0xd0f017a00f362a9402deb96d1f5a44dee94d0780' as `0x${string}`
  const tournamentAddress = '0x192c540af82899a113d07b92b0dc0ffe00af6def' as `0x${string}`
  const score = 40

  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('generateSecret', () => {
    it('should generate a valid hex string', () => {
      const secret = generateSecret()
      expect(secret).toMatch(/^0x[0-9a-f]{64}$/i)
    })

    it('should generate different secrets each time', () => {
      const secret1 = generateSecret()
      const secret2 = generateSecret()
      expect(secret1).not.toBe(secret2)
    })
  })

  describe('computeCommitHash', () => {
    it('should compute a valid commit hash', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/i)
      expect(hash.length).toBe(66) // 0x + 64 hex chars
    })

    it('should produce the same hash for the same inputs', () => {
      const secret = generateSecret()
      const hash1 = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      const hash2 = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      expect(hash1.toLowerCase()).toBe(hash2.toLowerCase())
    })

    it('should match contract computation format', () => {
      const secret = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const normalizedPlayer = getAddress(playerAddress)
      const normalizedTournament = getAddress(tournamentAddress)
      const tournamentId = BigInt(normalizedTournament)
      
      // Contract format: keccak256(abi.encodePacked(msg.sender, uint256(uint160(address(this))), secret, score))
      const contractHash = keccak256(
        encodePacked(
          ['address', 'uint256', 'string', 'uint256'],
          [normalizedPlayer, tournamentId, secret, BigInt(score)]
        )
      )
      
      const frontendHash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      expect(frontendHash.toLowerCase()).toBe(contractHash.toLowerCase())
    })

    it('should handle integer scores correctly', () => {
      const secret = generateSecret()
      const hash1 = computeCommitHash(playerAddress, tournamentAddress, secret, 40)
      const hash2 = computeCommitHash(playerAddress, tournamentAddress, secret, 40.0)
      const hash3 = computeCommitHash(playerAddress, tournamentAddress, secret, BigInt(40))
      const hash4 = computeCommitHash(playerAddress, tournamentAddress, secret, '40')
      
      expect(hash1.toLowerCase()).toBe(hash2.toLowerCase())
      expect(hash1.toLowerCase()).toBe(hash3.toLowerCase())
      expect(hash1.toLowerCase()).toBe(hash4.toLowerCase())
    })

    it('should floor non-integer scores', () => {
      const secret = generateSecret()
      const hash1 = computeCommitHash(playerAddress, tournamentAddress, secret, 40.7)
      const hash2 = computeCommitHash(playerAddress, tournamentAddress, secret, 40)
      
      expect(hash1.toLowerCase()).toBe(hash2.toLowerCase())
    })

    it('should normalize addresses correctly', () => {
      const secret = generateSecret()
      const upperAddress = playerAddress.toUpperCase() as `0x${string}`
      const lowerAddress = playerAddress.toLowerCase() as `0x${string}`
      
      const hash1 = computeCommitHash(upperAddress, tournamentAddress, secret, score)
      const hash2 = computeCommitHash(lowerAddress, tournamentAddress, secret, score)
      
      expect(hash1.toLowerCase()).toBe(hash2.toLowerCase())
    })

    it('should throw error for invalid player address', () => {
      const secret = generateSecret()
      expect(() => {
        computeCommitHash('invalid' as `0x${string}`, tournamentAddress, secret, score)
      }).toThrow('Invalid player address format')
    })

    it('should throw error for invalid tournament address', () => {
      const secret = generateSecret()
      expect(() => {
        computeCommitHash(playerAddress, 'invalid' as `0x${string}`, secret, score)
      }).toThrow('Invalid tournament address format')
    })

    it('should throw error for negative score', () => {
      const secret = generateSecret()
      expect(() => {
        computeCommitHash(playerAddress, tournamentAddress, secret, -1)
      }).toThrow('must be a non-negative integer')
    })
  })

  describe('verifyCommit', () => {
    it('should verify a correct commit hash', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      const isValid = verifyCommit(hash, playerAddress, tournamentAddress, secret, score)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect secret', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      const wrongSecret = generateSecret()
      
      const isValid = verifyCommit(hash, playerAddress, tournamentAddress, wrongSecret, score)
      expect(isValid).toBe(false)
    })

    it('should reject incorrect score', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      const isValid = verifyCommit(hash, playerAddress, tournamentAddress, secret, score + 1)
      expect(isValid).toBe(false)
    })

    it('should reject incorrect address', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      const wrongAddress = '0x0000000000000000000000000000000000000001' as `0x${string}`
      
      const isValid = verifyCommit(hash, wrongAddress, tournamentAddress, secret, score)
      expect(isValid).toBe(false)
    })

    it('should handle case-insensitive hash comparison', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      const upperHash = hash.toUpperCase() as `0x${string}`
      
      const isValid = verifyCommit(upperHash, playerAddress, tournamentAddress, secret, score)
      expect(isValid).toBe(true)
    })
  })

  describe('storeCommitData and getCommitData', () => {
    it('should store and retrieve commit data', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      storeCommitData(tournamentAddress, secret, score, hash)
      const retrieved = getCommitData(tournamentAddress)
      
      expect(retrieved).not.toBeNull()
      expect(retrieved?.secret).toBe(secret)
      expect(retrieved?.score).toBe(score)
      expect(retrieved?.commitHash.toLowerCase()).toBe(hash.toLowerCase())
    })

    it('should normalize tournament address for storage key', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      const upperTournament = tournamentAddress.toUpperCase()
      
      storeCommitData(upperTournament, secret, score, hash)
      const retrieved = getCommitData(tournamentAddress.toLowerCase())
      
      expect(retrieved).not.toBeNull()
      expect(retrieved?.score).toBe(score)
    })

    it('should floor non-integer scores when storing', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, 40.7)
      
      storeCommitData(tournamentAddress, secret, 40.7, hash)
      const retrieved = getCommitData(tournamentAddress)
      
      expect(retrieved?.score).toBe(40)
    })

    it('should return null for non-existent data', () => {
      const retrieved = getCommitData(tournamentAddress)
      expect(retrieved).toBeNull()
    })

    it('should throw error for invalid inputs when storing', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      expect(() => {
        storeCommitData('invalid', secret, score, hash)
      }).toThrow('Invalid tournament address')
      
      expect(() => {
        storeCommitData(tournamentAddress, '', score, hash)
      }).toThrow('Invalid secret')
      
      expect(() => {
        storeCommitData(tournamentAddress, secret, -1, hash)
      }).toThrow('must be a non-negative integer')
      
      expect(() => {
        storeCommitData(tournamentAddress, secret, score, 'invalid')
      }).toThrow('Invalid commit hash format')
    })
  })

  describe('clearCommitData', () => {
    it('should clear stored commit data', () => {
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      storeCommitData(tournamentAddress, secret, score, hash)
      expect(getCommitData(tournamentAddress)).not.toBeNull()
      
      clearCommitData(tournamentAddress)
      expect(getCommitData(tournamentAddress)).toBeNull()
    })
  })

  describe('End-to-End Flow', () => {
    it('should complete full commit-reveal cycle', () => {
      // 1. Generate secret and compute hash
      const secret = generateSecret()
      const hash = computeCommitHash(playerAddress, tournamentAddress, secret, score)
      
      // 2. Store commit data
      storeCommitData(tournamentAddress, secret, score, hash)
      
      // 3. Retrieve commit data
      const retrieved = getCommitData(tournamentAddress)
      expect(retrieved).not.toBeNull()
      
      // 4. Verify commit hash
      const isValid = verifyCommit(
        retrieved!.commitHash as `0x${string}`,
        playerAddress,
        tournamentAddress,
        retrieved!.secret,
        retrieved!.score
      )
      expect(isValid).toBe(true)
      
      // 5. Clear data after reveal
      clearCommitData(tournamentAddress)
      expect(getCommitData(tournamentAddress)).toBeNull()
    })

    it('should handle multiple tournaments independently', () => {
      const tournament1 = '0x1111111111111111111111111111111111111111' as `0x${string}`
      const tournament2 = '0x2222222222222222222222222222222222222222' as `0x${string}`
      
      const secret1 = generateSecret()
      const secret2 = generateSecret()
      const hash1 = computeCommitHash(playerAddress, tournament1, secret1, 40)
      const hash2 = computeCommitHash(playerAddress, tournament2, secret2, 50)
      
      storeCommitData(tournament1, secret1, 40, hash1)
      storeCommitData(tournament2, secret2, 50, hash2)
      
      const retrieved1 = getCommitData(tournament1)
      const retrieved2 = getCommitData(tournament2)
      
      expect(retrieved1?.score).toBe(40)
      expect(retrieved2?.score).toBe(50)
      expect(retrieved1?.secret).not.toBe(retrieved2?.secret)
      
      clearCommitData(tournament1)
      expect(getCommitData(tournament1)).toBeNull()
      expect(getCommitData(tournament2)).not.toBeNull()
    })
  })
})

