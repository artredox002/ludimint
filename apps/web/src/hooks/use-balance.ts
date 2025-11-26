"use client"

import { useAccount, useBalance } from "wagmi"
import { formatUnits } from "viem"

export function useTokenBalance(tokenAddress?: `0x${string}`) {
  const { address, isConnected } = useAccount()
  
  const { data: balance, isLoading, error } = useBalance({
    address,
    token: tokenAddress,
    enabled: isConnected && !!address,
  })

  return {
    balance: balance ? formatUnits(balance.value, balance.decimals) : "0",
    formatted: balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2) : "0.00",
    isLoading,
    error,
    hasBalance: balance ? balance.value > 0n : false,
  }
}

export function useNativeBalance() {
  return useTokenBalance(undefined)
}

