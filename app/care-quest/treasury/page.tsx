"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

export default function TreasuryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-3xl font-bold">Treasury</h1>
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Build Games Treasury
          </CardTitle>
          <CardDescription>
            Placeholder. Pledge fulfillment tracking will be added in a future phase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
