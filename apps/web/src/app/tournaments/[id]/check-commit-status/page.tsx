"use client"

import { useParams } from "next/navigation"
import { useAccount, useReadContract, usePublicClient } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCommitData } from "@/lib/commit-reveal"
import { tournamentABI } from "@/lib/contracts/instances"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CheckCommitStatusPage() {
  const params = useParams()
  const id = params?.id as string
  const tournamentAddress = id as `0x${string}` | undefined
  const { address } = useAccount()
  const publicClient = usePublicClient()

  // Check on-chain status
  const { data: isPlayer, isLoading: isLoadingPlayer } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "isPlayer",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address },
  })

  // Check local storage
  const localCommitData = tournamentAddress ? getCommitData(tournamentAddress) : null

  // Check on-chain commit hash
  const { data: onChainCommitHash, isLoading: isLoadingCommit } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "commits",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address && !!isPlayer },
  })

  const status = {
    hasLocalData: !!localCommitData,
    isPlayerOnChain: Boolean(isPlayer),
    hasOnChainCommit: onChainCommitHash && onChainCommitHash !== "0x0000000000000000000000000000000000000000000000000000000000000000",
    localCommitMatchesOnChain: localCommitData && onChainCommitHash 
      ? localCommitData.commitHash.toLowerCase() === (onChainCommitHash as string).toLowerCase()
      : false,
  }

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Commit Status Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tournament Address */}
            <div>
              <div className="text-sm text-muted mb-1">Tournament Address</div>
              <code className="text-xs font-mono text-fg-100 break-all bg-bg-800 p-2 rounded">
                {tournamentAddress || "N/A"}
              </code>
            </div>

            {/* Your Address */}
            {address && (
              <div>
                <div className="text-sm text-muted mb-1">Your Address</div>
                <code className="text-xs font-mono text-fg-100 break-all bg-bg-800 p-2 rounded">
                  {address}
                </code>
              </div>
            )}

            {/* Status Checks */}
            <div className="space-y-4">
              <h3 className="font-semibold">Status Checks</h3>

              {/* Local Storage */}
              <div className="flex items-center justify-between p-3 bg-bg-800 rounded-md">
                <div className="flex items-center gap-2">
                  {status.hasLocalData ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error-500" />
                  )}
                  <span>Local Commit Data</span>
                </div>
                <span className={status.hasLocalData ? "text-success-500" : "text-error-500"}>
                  {status.hasLocalData ? "Found" : "Not Found"}
                </span>
              </div>

              {/* On-chain Player Status */}
              <div className="flex items-center justify-between p-3 bg-bg-800 rounded-md">
                <div className="flex items-center gap-2">
                  {isLoadingPlayer ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted" />
                  ) : status.isPlayerOnChain ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error-500" />
                  )}
                  <span>Joined Tournament (On-chain)</span>
                </div>
                <span className={status.isPlayerOnChain ? "text-success-500" : "text-error-500"}>
                  {isLoadingPlayer ? "Checking..." : status.isPlayerOnChain ? "Yes" : "No"}
                </span>
              </div>

              {/* On-chain Commit Hash */}
              {status.isPlayerOnChain && (
                <div className="flex items-center justify-between p-3 bg-bg-800 rounded-md">
                  <div className="flex items-center gap-2">
                    {isLoadingCommit ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted" />
                    ) : status.hasOnChainCommit ? (
                      <CheckCircle2 className="w-5 h-5 text-success-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-500" />
                    )}
                    <span>Commit Hash (On-chain)</span>
                  </div>
                  <span className={status.hasOnChainCommit ? "text-success-500" : "text-error-500"}>
                    {isLoadingCommit ? "Checking..." : status.hasOnChainCommit ? "Found" : "Not Found"}
                  </span>
                </div>
              )}

              {/* Commit Hash Match */}
              {status.isPlayerOnChain && status.hasLocalData && (
                <div className="flex items-center justify-between p-3 bg-bg-800 rounded-md">
                  <div className="flex items-center gap-2">
                    {status.localCommitMatchesOnChain ? (
                      <CheckCircle2 className="w-5 h-5 text-success-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning-500" />
                    )}
                    <span>Local & On-chain Match</span>
                  </div>
                  <span className={status.localCommitMatchesOnChain ? "text-success-500" : "text-warning-500"}>
                    {status.localCommitMatchesOnChain ? "Match" : "Mismatch"}
                  </span>
                </div>
              )}
            </div>

            {/* Local Commit Data Details */}
            {localCommitData && (
              <div className="space-y-2">
                <h3 className="font-semibold">Local Commit Data</h3>
                <div className="p-3 bg-bg-800 rounded-md space-y-2">
                  <div>
                    <div className="text-xs text-muted mb-1">Score</div>
                    <div className="text-lg font-bold">{localCommitData.score}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Commit Hash</div>
                    <code className="text-xs font-mono text-fg-100 break-all">
                      {localCommitData.commitHash}
                    </code>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Secret (first 20 chars)</div>
                    <code className="text-xs font-mono text-fg-100">
                      {localCommitData.secret.substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* On-chain Commit Hash */}
            {onChainCommitHash && onChainCommitHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
              <div className="space-y-2">
                <h3 className="font-semibold">On-chain Commit Hash</h3>
                <div className="p-3 bg-bg-800 rounded-md">
                  <code className="text-xs font-mono text-fg-100 break-all">
                    {onChainCommitHash as string}
                  </code>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-md">
              <h3 className="font-semibold mb-2">What to do next:</h3>
              <ul className="space-y-1 text-sm">
                {!status.isPlayerOnChain && status.hasLocalData && (
                  <li className="flex items-start gap-2">
                    <span className="text-warning-500">⚠️</span>
                    <span>
                      <strong>You need to join the tournament!</strong> Your commit hash is stored locally but hasn't been sent to the blockchain. 
                      Go to the <Link href={`/tournaments/${id}/play`} className="text-primary-600 underline">Play page</Link> and click "Join Tournament".
                    </span>
                  </li>
                )}
                {status.isPlayerOnChain && !status.hasLocalData && (
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✅</span>
                    <span>
                      You've joined on-chain, but local commit data is missing. You can still reveal if you have your secret.
                    </span>
                  </li>
                )}
                {status.isPlayerOnChain && status.hasLocalData && !status.localCommitMatchesOnChain && (
                  <li className="flex items-start gap-2">
                    <span className="text-warning-500">⚠️</span>
                    <span>
                      <strong>Commit hash mismatch!</strong> Your local commit hash doesn't match the on-chain one. 
                      You may have played multiple times. Use the on-chain commit hash for reveal.
                    </span>
                  </li>
                )}
                {status.isPlayerOnChain && status.hasLocalData && status.localCommitMatchesOnChain && (
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✅</span>
                    <span>
                      <strong>Everything looks good!</strong> Your commit is on-chain and matches your local data. 
                      You can proceed to <Link href={`/tournaments/${id}/reveal`} className="text-primary-600 underline">reveal</Link> when the reveal phase starts.
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button asChild variant="primary">
                <Link href={`/tournaments/${id}`}>Back to Tournament</Link>
              </Button>
              {!status.isPlayerOnChain && status.hasLocalData && (
                <Button asChild>
                  <Link href={`/tournaments/${id}/play`}>Join Tournament</Link>
                </Button>
              )}
              {status.isPlayerOnChain && (
                <Button asChild variant="secondary">
                  <Link href={`/tournaments/${id}/reveal`}>Go to Reveal</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

