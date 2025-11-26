"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"

export function WalletButton() {
  const { address, isConnected, isLoading, connect, disconnect } = useWallet()
  const [showWallets, setShowWallets] = useState(false)

  const handleConnectWallet = async (walletType: string) => {
    await connect(walletType)
    setShowWallets(false)
  }

  return (
    <div style={{ position: "relative" }}>
      {isConnected ? (
        <button
          onClick={() => setShowWallets(!showWallets)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#00bfb6",
            color: "#0b0f13",
            border: "none",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "clamp(12px, 2vw, 14px)",
            transition: "all 220ms cubic-bezier(0.2, 0.9, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 191, 182, 0.2)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {address}
        </button>
      ) : (
        <button
          onClick={() => setShowWallets(!showWallets)}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#a870ff",
            color: "#e6f0f6",
            border: "none",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            cursor: isLoading ? "wait" : "pointer",
            fontSize: "clamp(12px, 2vw, 14px)",
            transition: "all 220ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(168, 112, 255, 0.2)"
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      {showWallets && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            backgroundColor: "#162024",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            minWidth: "200px",
            zIndex: 1000,
            animation: "slideDown 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {isConnected ? (
            <button
              onClick={disconnect}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "transparent",
                color: "#ff6b6b",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 107, 107, 0.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              Disconnect Wallet
            </button>
          ) : (
            <>
              {["MetaMask", "MiniPay", "Ledger", "WalletConnect"].map((wallet, idx) => (
                <button
                  key={wallet}
                  onClick={() => handleConnectWallet(wallet)}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "transparent",
                    color: "#e6f0f6",
                    border: "none",
                    borderBottom: idx < 3 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    textAlign: "left",
                    cursor: isLoading ? "wait" : "pointer",
                    fontSize: "14px",
                    transition: "all 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                    opacity: isLoading ? 0.6 : 1,
                    animation: `slideDown 200ms cubic-bezier(0.2, 0.9, 0.3, 1) ${idx * 50}ms backwards`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = "rgba(0, 209, 199, 0.1)"
                      e.currentTarget.style.paddingLeft = "20px"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.paddingLeft = "16px"
                  }}
                >
                  {wallet}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  )
}
