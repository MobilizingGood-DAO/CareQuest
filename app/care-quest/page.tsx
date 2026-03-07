"use client"

import { WalletConnectButton } from "@/components/care-quest/wallet-connect-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, FileCheck, BarChart3, Wallet, Trophy } from "lucide-react"

export default function CareQuestHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Hero */}
      <section className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
          <Shield className="h-4 w-4" />
          Avalanche Build Games
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          CARE QUEST
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          A coordination layer for the Avalanche Build Games incentive program.
          While builders chase the $100k grand prize and $5–40k category awards,
          CARE QUEST helps the program itself: register teams, track submissions,
          and optionally pledge a portion of rewards back to the ecosystem.
        </p>
        <div className="mt-8">
          <WalletConnectButton size="lg" className="bg-emerald-600 px-8 hover:bg-emerald-500" />
        </div>
      </section>

      {/* Program context */}
      <section>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-emerald-400" />
              Build Games on Avalanche
            </CardTitle>
            <CardDescription>
              6-week Avalanche-native program · $100k grand prize · $5–40k category prizes.
              CARE QUEST adds participation tracking and optional ecosystem contribution on top.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <FileCheck className="mb-2 h-10 w-10 text-emerald-400" />
              <CardTitle className="text-lg">Register & Submit</CardTitle>
              <CardDescription>
                Register your team for the program round and submit project updates
                (idea, MVP, GTM, final).
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <BarChart3 className="mb-2 h-10 w-10 text-emerald-400" />
              <CardTitle className="text-lg">Transparency</CardTitle>
              <CardDescription>
                Participation metrics and optional pledges are shown on the public
                dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <Wallet className="mb-2 h-10 w-10 text-emerald-400" />
              <CardTitle className="text-lg">Ecosystem Pledges</CardTitle>
              <CardDescription>
                Optionally pledge 1–10% of potential rewards toward ecosystem initiatives.
                Track commitments and fulfillment on the treasury page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
          <Link href="/care-quest/register">Register Team</Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
          <Link href="/care-quest/dashboard">View Dashboard</Link>
        </Button>
      </section>
    </div>
  )
}
