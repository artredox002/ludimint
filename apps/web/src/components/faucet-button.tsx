"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Droplet } from "lucide-react"
import { getFaucetUrl } from "@/lib/minipay"
import { useAccount } from "wagmi"
import { toast } from "sonner"

interface FaucetButtonProps {
  className?: string
  variant?: "default" | "outline"
}

export function FaucetButton({ className, variant = "default" }: FaucetButtonProps) {
  const { address, isConnected } = useAccount()
  const [isOpening, setIsOpening] = useState(false)

  const handleClick = () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsOpening(true)
    const faucetUrl = getFaucetUrl()
    
    // Open faucet in new tab
    window.open(faucetUrl, "_blank", "noopener,noreferrer")
    
    toast.success("Faucet opened in new tab. After requesting tokens, wait a few seconds and refresh your balance.")
    
    setTimeout(() => setIsOpening(false), 1000)
  }

  if (!isConnected) return null

  return (
    <Button
      variant={variant === "outline" ? "secondary" : "primary"}
      size="sm"
      onClick={handleClick}
      disabled={isOpening}
      className={className}
    >
      <Droplet className="w-4 h-4" />
      <span>Get Test Tokens</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </Button>
  )
}

