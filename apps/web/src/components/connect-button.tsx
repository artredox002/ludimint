"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMinipay, setIsMinipay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // @ts-ignore
    if (window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  // Don't render in MiniPay (handled automatically)
  if (isMinipay) {
    return null;
  }

  // Custom styled button for connected state
  if (mounted && isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => disconnect()}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2",
            "bg-primary-600 text-[#0b0f13]",
            "rounded-md font-semibold text-sm",
            "transition-all duration-200 ease-out",
            "hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/20",
            "active:translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0b0f13]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          style={{
            fontFamily: "Inter, sans-serif",
            transition: "all 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
          }}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-xs">{formatAddress(address)}</span>
          <LogOut className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    );
  }

  // Custom styled button for connecting state
  if (mounted && isConnecting) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2",
          "bg-primary-600/70 text-[#0b0f13]",
          "rounded-md font-semibold text-sm",
          "cursor-wait opacity-70"
        )}
        style={{
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  // Use RainbowKit's ConnectButton with custom styling
  return (
    <div className="[&_button]:!bg-primary-600 [&_button]:!text-bg-900 [&_button]:!rounded-md [&_button]:!px-4 [&_button]:!py-2 [&_button]:!font-semibold [&_button]:!text-sm [&_button]:!transition-all [&_button]:!duration-200 [&_button:hover]:!bg-primary-500 [&_button:hover]:!shadow-lg [&_button:hover]:!shadow-primary-600/20 [&_button:focus]:!outline-none [&_button:focus]:!ring-2 [&_button:focus]:!ring-primary-500 [&_button:focus]:!ring-offset-2 [&_button:focus]:!ring-offset-bg-900">
      <RainbowKitConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted: rainbowMounted,
        }) => {
          const ready = mounted && rainbowMounted;
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === "authenticated");

          if (!ready) {
            return (
              <button
                disabled
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2",
                  "bg-[#162024] text-[#e6f0f6]",
                  "rounded-md font-semibold text-sm",
                  "opacity-50 cursor-not-allowed"
                )}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </button>
            );
          }

          if (connected) {
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  type="button"
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2",
                  "bg-[#162024] text-[#e6f0f6] border border-white/10",
                  "rounded-md font-medium text-xs",
                  "hover:bg-[#0f161a] hover:border-primary-600/30",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0b0f13]"
                )}
                >
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          style={{ width: 12, height: 12 }}
                        />
                      )}
                    </div>
                  )}
                  {chain.name}
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2",
                    "bg-primary-600 text-[#0b0f13]",
                    "rounded-md font-semibold text-sm",
                    "transition-all duration-200 ease-out",
                    "hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/20",
                    "active:translate-y-0.5",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0b0f13]"
                  )}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    transition: "all 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                  }}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-xs">
                    {formatAddress(account.address)}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <button
              onClick={openConnectModal}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-primary-600 text-[#0b0f13]",
                "rounded-md font-semibold text-sm",
                "transition-all duration-200 ease-out",
                "hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/20",
                "active:translate-y-0.5",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0b0f13]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{
                fontFamily: "Inter, sans-serif",
                transition: "all 200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
              }}
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          );
        }}
      </RainbowKitConnectButton.Custom>
    </div>
  );
}
