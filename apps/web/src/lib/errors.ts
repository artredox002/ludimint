import { BaseError } from "viem"

const ERROR_MAPPINGS: { keywords: string[]; message: string }[] = [
  { keywords: ["user rejected", "user denied"], message: "Transaction cancelled" },
  { keywords: ["already joined", "already a player"], message: "You have already joined this tournament" },
  { keywords: ["tournament full", "tournament is full"], message: "Tournament is already full" },
  { keywords: ["commit phase ended", "commit phase has ended"], message: "Commit phase has ended. You can no longer join." },
  { keywords: ["commit phase not ended"], message: "Reveal phase has not started yet" },
  { keywords: ["reveal phase ended"], message: "Reveal phase has ended" },
  { keywords: ["already revealed"], message: "You have already revealed for this tournament" },
  { keywords: ["not a player"], message: "You are not registered in this tournament" },
  { keywords: ["commit mismatch"], message: "Commit hash does not match your reveal. Check secret and score." },
  { keywords: ["already finalized"], message: "Tournament has already been finalized" },
  { keywords: ["reveal phase not ended"], message: "Reveal phase has not ended yet" },
  { keywords: ["not finalized"], message: "Tournament has not been finalized yet" },
  { keywords: ["not a winner"], message: "You are not a winner in this tournament" },
  { keywords: ["already claimed"], message: "Prize already claimed" },
  { keywords: ["insufficient allowance", "allowance"], message: "Approve token spending before joining" },
  { keywords: ["transfer amount exceeds balance", "insufficient balance", "balance"], message: "Insufficient token balance" },
  { keywords: ["invalid token address"], message: "Invalid token address configured" },
  { keywords: ["invalid commit hash", "commit hash"], message: "Invalid commit hash" },
  { keywords: ["safeerc20", "erc20", "safetransferfrom"], message: "Token transfer failed. Please check your token balance and approve sufficient spending allowance." },
  { keywords: ["safeerc20failedoperation"], message: "Token transfer failed. Please approve token spending and ensure you have sufficient balance." },
]

function normalizeMessage(message: string | undefined): string {
  if (!message) return ""
  return message.replace(/^Error:\s*/i, "").trim()
}

function findKnownError(message: string): string | null {
  if (!message) return null
  const normalized = message.toLowerCase()

  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.keywords.some((keyword) => normalized.includes(keyword))) {
      return mapping.message
    }
  }

  return null
}

function extractMessage(error: unknown): string {
  if (!error) return ""

  if (typeof error === "string") {
    return error
  }

  if (error instanceof BaseError) {
    return (
      normalizeMessage(error.shortMessage) ||
      normalizeMessage(error.message) ||
      (error.cause instanceof Error ? normalizeMessage(error.cause.message) : "")
    )
  }

  if (error instanceof Error) {
    return normalizeMessage(error.message)
  }

  if (typeof error === "object" && "message" in (error as Record<string, unknown>)) {
    const maybeMessage = (error as Record<string, unknown>).message
    if (typeof maybeMessage === "string") {
      return normalizeMessage(maybeMessage)
    }
  }

  return ""
}

export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong") {
  const message = extractMessage(error)
  const known = findKnownError(message)
  if (known) return known

  // Attempt to extract revert reason
  if (message.includes("revert")) {
    const revertReason = message.split("revert").pop()?.replace(/^[\s:]+/, "")
    if (revertReason) {
      return revertReason
    }
  }

  return message || fallback
}

