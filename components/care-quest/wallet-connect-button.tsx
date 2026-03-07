"use client"

import { useConnect, useDisconnect, useAccount } from "wagmi"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface WalletConnectButtonProps {
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WalletConnectButton({ size = "sm", className }: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = useCallback(() => {
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }, [connectors, connect])

  const baseConnectedClass = "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
  const baseConnectClass = "bg-emerald-600 text-white hover:bg-emerald-500"

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => disconnect()}
        className={className ?? baseConnectedClass}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    )
  }

  return (
    <Button
      size={size}
      onClick={handleConnect}
      disabled={isPending}
      className={className ?? baseConnectClass}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isPending ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
