"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoText } from "@/components/logo-text"
import { AnimatedHeroVisual } from "@/components/animated-hero-visual"

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  useEffect(() => {
    // Redirect if already connected
    if (isConnected) {
      router.push("/tournaments")
      return
    }
  }, [isConnected, router])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.8) {
          setStatsVisible(true)
        }
      }

      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.8) {
          setFeaturesVisible(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div style={{ backgroundColor: "#0b0f13", color: "#e6f0f6" }}>
      {/* Hero Section */}
      <section
        style={{
          padding: "clamp(32px, 8vw, 88px) clamp(16px, 4vw, 64px)",
          position: "relative",
          overflow: "hidden",
          minHeight: "clamp(580px, 100vh, 100vh)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 10% 20%, rgba(0, 209, 199, 0.08), transparent 45%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 70%, rgba(168, 112, 255, 0.08), transparent 40%)",
            opacity: 0.7,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(32px, 4vw, 64px)",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vw, 32px)" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(0, 209, 199, 0.35)",
                  backgroundColor: "rgba(0, 209, 199, 0.06)",
                  width: "fit-content",
                  animation: "pulseGlow 4s ease-in-out infinite",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#00d1c7",
                    boxShadow: "0 0 12px rgba(0, 209, 199, 0.8)",
                  }}
                />
                <span style={{ fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase", color: "#a7b8bd" }}>
                  powered by Minipay
                </span>
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "clamp(32px, 6vw, 56px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    marginBottom: "16px",
                    background: "linear-gradient(120deg, #f7fbff 0%, #00d1c7 40%, #a870ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "fadeInDown 800ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                    margin: 0,
                  }}
                >
                  Skill-Based Micro Tournaments
                </h1>
                <p
                  style={{
                    fontSize: "clamp(16px, 3vw, 20px)",
                    color: "#c8d6dd",
                    lineHeight: 1.6,
                    maxWidth: "540px",
                    animation: "fadeInUp 800ms cubic-bezier(0.2, 0.9, 0.3, 1) 160ms backwards",
                    margin: 0,
                  }}
                >
                  Play memory games in micro-tournaments on Celo with trustless payouts. MiniPay ready for instant access
                  and seamless onboarding everywhere.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  animation: "fadeInUp 800ms cubic-bezier(0.2, 0.9, 0.3, 1) 260ms backwards",
                }}
              >
                <Button asChild variant="primary" size="lg" className="shadow-lg shadow-primary-600/20">
                  <Link href="/tournaments">Browse Tournaments</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/create">Create Tournament</Link>
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >
                {[
                  { title: "MiniWallet ready", detail: "Live on Celo + MiniPay" },
                  { title: "Trustless payouts", detail: "Audited contracts" },
                  { title: "Global play", detail: "Open 24/7 tournaments" },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(15, 24, 30, 0.8)",
                      animation: `fadeInUp 700ms cubic-bezier(0.2, 0.9, 0.3, 1) ${index * 80 + 320}ms backwards`,
                    }}
                  >
                    <p style={{ color: "#e6f0f6", fontWeight: 600, margin: "0 0 6px", fontSize: "14px" }}>{item.title}</p>
                    <p style={{ color: "#93a6ad", margin: 0, fontSize: "13px" }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                position: "relative",
                minHeight: "360px",
                borderRadius: "28px",
                padding: "24px",
                background:
                  "linear-gradient(145deg, rgba(8, 20, 24, 0.95) 0%, rgba(4, 8, 12, 0.75) 100%), rgba(10, 15, 19, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.45)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "24px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <AnimatedHeroVisual />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  left: "24px",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "rgba(11, 17, 23, 0.85)",
                  border: "1px solid rgba(0, 209, 199, 0.25)",
                  color: "#e6f0f6",
                  fontSize: "14px",
                  backdropFilter: "blur(6px)",
                  animation: "floatSlow 6s ease-in-out infinite",
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#93a6ad", letterSpacing: "0.04em" }}>Prize Pool</p>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>$45,680 cUSD</p>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: "32px",
                  right: "32px",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: "rgba(20, 12, 32, 0.85)",
                  border: "1px solid rgba(168, 112, 255, 0.25)",
                  color: "#e6f0f6",
                  width: "180px",
                  backdropFilter: "blur(6px)",
                  animation: "floatSlow 5.5s ease-in-out infinite reverse",
                }}
              >
                <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#c7b9ff" }}>Live entrants</p>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, lineHeight: 1 }}>
                  8,942<span style={{ fontSize: "12px", color: "#93a6ad", marginLeft: "6px" }}>players</span>
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transform: "translate(-50%, -50%)",
                  animation: "orbit 28s linear infinite",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "clamp(16px, 3vw, 24px)",
          padding: "clamp(40px, 10vw, 64px) clamp(16px, 5vw, 32px)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {[
          { label: "Active Tournaments", value: "1,234" },
          { label: "Total Prize Pool", value: "$45,680" },
          { label: "Players", value: "8,942" },
          { label: "Games Played", value: "234,892" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#162024",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "clamp(16px, 3vw, 24px)",
              borderRadius: "8px",
              textAlign: "center",
              animation: statsVisible ? `countUp 1s cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 100}ms` : "none",
              transition: "all 300ms cubic-bezier(0.2, 0.9, 0.3, 1)",
              transform: statsVisible ? "translateY(0)" : "translateY(20px)",
              opacity: statsVisible ? 1 : 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 209, 199, 0.3)"
              e.currentTarget.style.backgroundColor = "#1a2a30"
              e.currentTarget.style.transform = "translateY(-8px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.backgroundColor = "#162024"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <div
              style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: "bold", color: "#00d1c7", marginBottom: "8px" }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "clamp(12px, 2vw, 14px)", color: "#93a6ad" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        style={{
          padding: "clamp(40px, 10vw, 64px) clamp(16px, 5vw, 32px)",
          backgroundColor: "#0f161a",
        }}
      >
        <h3
          style={{
            fontSize: "clamp(24px, 6vw, 32px)",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "clamp(32px, 8vw, 48px)",
            animation: "fadeInUp 600ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            margin: 0,
          }}
        >
          Why LUDIMINT?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "clamp(16px, 3vw, 24px)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {[
            {
              title: "Trustless Payouts",
              desc: "Smart contracts ensure fair, instant payouts on Celo blockchain",
            },
            {
              title: "Skill-Based Gaming",
              desc: "Pure memory games where your skills determine the outcome",
            },
            {
              title: "Mobile Ready",
              desc: "MiniPay integration for seamless mobile gaming experience",
            },
            {
              title: "Low Entry",
              desc: "Micro-tournaments mean affordable entry costs for everyone",
            },
            {
              title: "Real Prizes",
              desc: "Win real cUSD on Celo network, withdraw anytime",
            },
            {
              title: "Global Play",
              desc: "Compete with players worldwide in real-time tournaments",
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#162024",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "clamp(16px, 3vw, 24px)",
                borderRadius: "8px",
                animation: featuresVisible
                  ? `fadeInUp 600ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 100}ms backwards`
                  : "none",
                transition: "all 300ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                transform: featuresVisible ? "translateY(0)" : "translateY(20px)",
                opacity: featuresVisible ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 209, 199, 0.3)"
                e.currentTarget.style.backgroundColor = "#1a2a30"
                e.currentTarget.style.transform = "translateY(-8px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.backgroundColor = "#162024"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <h4
                style={{
                  fontSize: "clamp(16px, 2.5vw, 18px)",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#00d1c7",
                  margin: 0,
                }}
              >
                {feature.title}
              </h4>
              <p style={{ fontSize: "clamp(13px, 2vw, 14px)", color: "#93a6ad", lineHeight: "1.6", margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "clamp(40px, 10vw, 64px) clamp(16px, 5vw, 32px)",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(0, 209, 199, 0.05) 0%, rgba(168, 112, 255, 0.05) 100%)",
          animation: `fadeInUp 800ms cubic-bezier(0.2, 0.9, 0.3, 1)`,
        }}
      >
        <h3
          style={{
            fontSize: "clamp(24px, 6vw, 32px)",
            fontWeight: "bold",
            marginBottom: "clamp(16px, 3vw, 24px)",
            animation: "fadeInUp 600ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            margin: 0,
          }}
        >
          Ready to Play?
        </h3>
        <p
          style={{
            fontSize: "clamp(14px, 2.5vw, 16px)",
            color: "#c8d6dd",
            marginBottom: "clamp(20px, 5vw, 32px)",
            animation: "fadeInUp 600ms cubic-bezier(0.2, 0.9, 0.3, 1) 100ms backwards",
            margin: 0,
          }}
        >
          Join thousands of players competing in skill-based tournaments today
        </p>
        <Button asChild variant="primary" size="lg" className="shadow-lg shadow-primary-600/30">
          <Link href="/tournaments">Get Started Now</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "clamp(20px, 3vw, 32px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          color: "#93a6ad",
          fontSize: "clamp(12px, 2vw, 14px)",
          animation: "fadeInUp 600ms cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <LogoText size="sm" animated={false} />
        </div>
        <p style={{ margin: 0 }}>© 2025 LUDIMINT - Micro Tournaments on Celo. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(30px);
          }
        }
        @keyframes floatSlow {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -12px, 0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(0, 209, 199, 0.25);
            border-color: rgba(0, 209, 199, 0.35);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 209, 199, 0.45);
            border-color: rgba(0, 209, 199, 0.55);
          }
        }
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        html {
          scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
