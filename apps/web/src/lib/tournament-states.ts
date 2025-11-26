/**
 * Tournament lifecycle states
 */
export enum TournamentPhase {
  OPEN = "open",           // Accepting joins
  COMMIT = "commit",       // Commit phase
  REVEAL = "reveal",       // Reveal phase
  FINALIZED = "finalized", // Tournament ended, winners determined
}

export interface TournamentTiming {
  startTime: number
  commitEndTime: number
  revealEndTime: number
  finalizedAt?: number
}

/**
 * Determine current tournament phase based on timing
 */
export function getTournamentPhase(timing: TournamentTiming): TournamentPhase {
  const now = Math.floor(Date.now() / 1000)
  
  if (timing.finalizedAt) {
    return TournamentPhase.FINALIZED
  }
  
  if (now < timing.startTime) {
    return TournamentPhase.OPEN
  }
  
  if (now < timing.commitEndTime) {
    return TournamentPhase.COMMIT
  }
  
  if (now < timing.revealEndTime) {
    return TournamentPhase.REVEAL
  }
  
  return TournamentPhase.FINALIZED
}

/**
 * Get time remaining until next phase
 */
export function getTimeUntilNextPhase(timing: TournamentTiming): {
  phase: TournamentPhase
  secondsRemaining: number
} | null {
  const now = Math.floor(Date.now() / 1000)
  const currentPhase = getTournamentPhase(timing)
  
  if (currentPhase === TournamentPhase.FINALIZED) {
    return null
  }
  
  if (currentPhase === TournamentPhase.OPEN) {
    return {
      phase: TournamentPhase.COMMIT,
      secondsRemaining: Math.max(0, timing.startTime - now),
    }
  }
  
  if (currentPhase === TournamentPhase.COMMIT) {
    return {
      phase: TournamentPhase.REVEAL,
      secondsRemaining: Math.max(0, timing.commitEndTime - now),
    }
  }
  
  if (currentPhase === TournamentPhase.REVEAL) {
    return {
      phase: TournamentPhase.FINALIZED,
      secondsRemaining: Math.max(0, timing.revealEndTime - now),
    }
  }
  
  return null
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Ended"
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Get phase label for display
 */
export function getPhaseLabel(phase: TournamentPhase): string {
  switch (phase) {
    case TournamentPhase.OPEN:
      return "Open"
    case TournamentPhase.COMMIT:
      return "Commit Phase"
    case TournamentPhase.REVEAL:
      return "Reveal Phase"
    case TournamentPhase.FINALIZED:
      return "Finalized"
    default:
      return "Unknown"
  }
}

