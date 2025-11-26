"use client"

import { useState, useEffect } from "react"
import { useWaitForTransactionReceipt } from "wagmi"
import { ExternalLink, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTransactionUrl, formatTxHash } from "@/lib/explorer"
import { cn } from "@/lib/utils"

interface TransactionStatusProps {
  hash: `0x${string}` | undefined
  chainId?: number
  description?: string
  onSuccess?: () => void
  onError?: () => void
}

export function TransactionStatus({
  hash,
  chainId,
  description,
  onSuccess,
  onError,
}: TransactionStatusProps) {
  const { data: receipt, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess()
    }
  }, [isSuccess, onSuccess])

  useEffect(() => {
    if (isError && onError) {
      onError()
    }
  }, [isError, onError])

  if (!hash) return null

  const txUrl = getTransactionUrl(hash, chainId)

  return (
    <Card className="border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isLoading && (
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            )}
            {isSuccess && (
              <CheckCircle2 className="w-5 h-5 text-success-500" />
            )}
            {isError && (
              <XCircle className="w-5 h-5 text-danger-500" />
            )}
            {!isLoading && !isSuccess && !isError && (
              <Clock className="w-5 h-5 text-muted" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {description && (
              <p className="text-sm font-medium text-fg-100 mb-1">
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono text-fg-80 bg-bg-800 px-2 py-1 rounded">
                {formatTxHash(hash)}
              </code>
              
              {isLoading && (
                <Badge variant="warning" className="text-xs">
                  Pending
                </Badge>
              )}
              {isSuccess && (
                <Badge variant="success" className="text-xs">
                  Confirmed
                </Badge>
              )}
              {isError && (
                <Badge variant="danger" className="text-xs">
                  Failed
                </Badge>
              )}
            </div>

            {isError && error && (
              <p className="text-xs text-danger-500 mt-2">
                {error.message || "Transaction failed"}
              </p>
            )}

            {receipt && (
              <p className="text-xs text-muted mt-2">
                Block: {receipt.blockNumber.toString()}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex-shrink-0"
          >
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-500"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

