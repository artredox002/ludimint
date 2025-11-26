interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export function ProgressBar({ value, max = 100, className = "" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`w-full h-2 bg-[#162024] rounded-full overflow-hidden border border-white/10 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-[#00bfb6] to-[#00d1c7] rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
