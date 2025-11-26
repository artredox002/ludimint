"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  walletType: string | null
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)

  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    const savedWalletType = localStorage.getItem("walletType")
    if (savedAddress) {
      setAddress(savedAddress)
      setWalletType(savedWalletType)
      setIsConnected(true)
    }
  }, [])

  const connect = async (walletTypeParam: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
      setAddress(mockAddress)
      setWalletType(walletTypeParam)
      setIsConnected(true)
      localStorage.setItem("walletAddress", mockAddress)
      localStorage.setItem("walletType", walletTypeParam)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setWalletType(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletType")
  }

  const clearError = () => setError(null)

  return (
    <WalletContext.Provider
      value={{ address, isConnected, isLoading, error, walletType, connect, disconnect, clearError }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
