"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pledge, TreasuryRecord, Team } from "@/lib/care-quest/types"
import { Wallet, CheckCircle, Clock, XCircle } from "lucide-react"

const TREASURY_ADDRESS = "0x0000000000000000000000000000000000000000"

export default function TreasuryPage() {
  const [pledges, setPledges] = useState<(Pledge & { team?: Team })[]>([])
  const [treasuryRecords, setTreasuryRecords] = useState<TreasuryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [
        { data: pledgesData },
        { data: treasuryData },
      ] = await Promise.all([
        supabase.from("pledges").select("*, team:teams(*)"),
        supabase.from("treasury_records").select("*").order("created_at", { ascending: false }),
      ])
      setPledges((pledgesData as (Pledge & { team?: Team })[]) || [])
      setTreasuryRecords((treasuryData as TreasuryRecord[]) || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const statusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case "confirmed":
      case "pending":
        return <Clock className="h-4 w-4 text-amber-400" />
      default:
        return <XCircle className="h-4 w-4 text-slate-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-3xl font-bold">Treasury Transparency</h1>

      {/* Placeholder wallet */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Treasury Wallet
          </CardTitle>
          <CardDescription>
            Placeholder address. Pledge fulfillment will be tracked here when on-chain
            integration is available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-mono text-sm text-slate-300">
            {TREASURY_ADDRESS}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Offchain coordination layer. Schema supports future tx_hash and chain_id.
          </p>
        </CardContent>
      </Card>

      {/* Pledge commitments */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Pledge Commitments</CardTitle>
          <CardDescription>
            Optional ecosystem contribution commitments from teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pledges.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No pledge commitments yet.
            </p>
          ) : (
            <div className="space-y-4">
              {pledges.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {(p.team as Team)?.name ?? "Unknown team"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {p.pledge_percentage}% · {p.pledge_status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(p.pledge_status)}
                    <span className="text-sm capitalize">{p.pledge_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fulfillment records */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Fulfillment Records</CardTitle>
          <CardDescription>
            Treasury funding and fulfillment activity (when on-chain integration is live)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treasuryRecords.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No fulfillment records yet.
            </p>
          ) : (
            <div className="space-y-4">
              {treasuryRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {r.amount} {r.asset_symbol ?? ""}
                    </p>
                    {r.tx_hash && (
                      <p className="font-mono text-xs text-slate-500 truncate max-w-xs">
                        {r.tx_hash}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(r.status)}
                    <span className="text-sm capitalize">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
