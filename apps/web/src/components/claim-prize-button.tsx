"use client"

import { useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { TransactionStatus } from "@/components/transaction-status"
import { Trophy, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useClaimPrize } from "@/hooks/use-claim-prize"
import { formatEther } from "viem"

interface ClaimPrizeButtonProps {
  tournamentId: `0x${string}`
  prizeAmount: string
  onSuccess?: () => void
}

export function ClaimPrizeButton({
  tournamentId,
  prizeAmount,
  onSuccess,
}: ClaimPrizeButtonProps) {
  const { isConnected } = useAccount()
  const { claimPrize, isClaiming, canClaim, prizeAmount: contractPrizeAmount, txHash, isSuccess, isLoading } =
    useClaimPrize(tournamentId)

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully claimed ${contractPrizeAmount ? formatEther(contractPrizeAmount) : prizeAmount} cUSD!`)
      onSuccess?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, contractPrizeAmount, prizeAmount])

  const handleClaim = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet")
      return
    }

    if (!canClaim) {
      toast.error("You are not eligible to claim a prize")
      return
    }

    await claimPrize()
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="lg" disabled className="w-full flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking prize eligibility...
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button disabled variant="secondary" size="lg" className="w-full">
        Connect Wallet to Claim
      </Button>
    )
  }

  if (!canClaim) {
    return null
  }

  const displayPrizeAmount = contractPrizeAmount ? formatEther(contractPrizeAmount) : prizeAmount

  return (
    <div className="space-y-3">
      {txHash && (
        <TransactionStatus
          hash={txHash}
          description="Claiming prize..."
          onSuccess={() => {
            if (onSuccess) onSuccess()
          }}
        />
      )}

      <Button
        onClick={handleClaim}
        size="lg"
        variant="primary"
        disabled={isClaiming || isSuccess}
        isLoading={isClaiming}
        className="w-full"
      >
        {isSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Prize Claimed
          </>
        ) : (
          <>
            <Trophy className="w-5 h-5" />
            {isClaiming ? "Claiming..." : `Claim ${displayPrizeAmount} cUSD`}
          </>
        )}
      </Button>

      {isSuccess && (
        <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-md">
          <p className="text-sm text-success-500 text-center">
            🎉 Congratulations! Your prize has been sent to your wallet.
          </p>
        </div>
      )}
    </div>
  )
}

