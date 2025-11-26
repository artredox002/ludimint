"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, animated = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(sizes[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient definitions */}
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d1c7" />
          <stop offset="100%" stopColor="#00bfb6" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a870ff" />
          <stop offset="100%" stopColor="#945bff" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Animated background circle */}
      {animated && (
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="url(#primaryGradient)"
          opacity="0.1"
        >
          <animate
            attributeName="r"
            values="55;58;55"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.1;0.15;0.1"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main L shape (Left) */}
      <path
        d="M 30 30 L 30 70 L 50 70 L 50 50 L 40 50 L 40 60 L 30 60 Z"
        fill="url(#primaryGradient)"
        filter="url(#glow)"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="1;0.8;1"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* M shape (Middle) */}
      <path
        d="M 55 30 L 55 70 L 65 70 L 65 45 L 70 55 L 75 45 L 75 70 L 85 70 L 85 30 L 75 30 L 75 50 L 70 40 L 65 50 L 65 30 Z"
        fill="url(#accentGradient)"
        filter="url(#glow)"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="1;0.9;1"
            dur="2.5s"
            repeatCount="indefinite"
            begin="0.3s"
          />
        )}
      </path>

      {/* Trophy/Coin accent */}
      <circle
        cx="95"
        cy="35"
        r="8"
        fill="url(#primaryGradient)"
        filter="url(#glow)"
      >
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 95 35;360 95 35"
            dur="8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle
        cx="95"
        cy="35"
        r="5"
        fill="url(#accentGradient)"
      >
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="360 95 35;0 95 35"
            dur="6s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Sparkle effects */}
      {animated && (
        <>
          <circle cx="25" cy="25" r="2" fill="#00d1c7" opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="1.5;2.5;1.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="100" cy="60" r="1.5" fill="#a870ff" opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.5s"
            />
            <animate
              attributeName="r"
              values="1;2;1"
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
        </>
      )}
    </svg>
  )
}

