"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/lib/care-quest/wagmi-config"
import { CareQuestNav } from "@/components/care-quest/care-quest-nav"

const queryClient = new QueryClient()

export default function CareQuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <CareQuestNav />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
