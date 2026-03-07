"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnectButton } from "@/components/care-quest/wallet-connect-button"
import { Team, Program } from "@/lib/care-quest/types"
import { AlertCircle } from "lucide-react"

export default function PledgePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [teams, setTeams] = useState<(Team & { program: Program })[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pledgePercent, setPledgePercent] = useState(5)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!isConnected || !address) return
    const fetchTeams = async () => {
      const { data } = await supabase
        .from("teams")
        .select("*, program:programs(*)")
        .eq("wallet_address", address.toLowerCase())
      const typed = (data || []) as (Team & { program: Program })[]
      setTeams(typed)
      if (typed[0]) setSelectedTeamId(typed[0].id)
    }
    fetchTeams()
  }, [isConnected, address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      setError("Please connect your wallet first.")
      return
    }
    if (!selectedTeamId) {
      setError("No team found. Register a team first.")
      return
    }
    const team = teams.find((t) => t.id === selectedTeamId)
    if (!team) return
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: insertError } = await supabase.from("pledges").insert({
        team_id: selectedTeamId,
        program_id: team.program_id,
        pledge_percentage: pledgePercent,
        pledge_status: "draft",
        notes: notes.trim() || null,
      })
      if (insertError) throw insertError
      router.push("/care-quest/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pledge.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Wallet Required</CardTitle>
            <CardDescription>
              Connect your wallet to optionally pledge a percentage of rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Optional Ecosystem Pledge</CardTitle>
          <CardDescription>
            Pledge 1–10% of potential program rewards toward ecosystem-supporting initiatives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {teams.length > 0 && (
              <div className="space-y-2">
                <Label>Team</Label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="pledge_percent">Pledge % (1–10%)</Label>
              <Input
                id="pledge_percent"
                type="number"
                min={1}
                max={10}
                value={pledgePercent}
                onChange={(e) =>
                  setPledgePercent(
                    Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1))
                  )
                }
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this pledge..."
                rows={3}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || teams.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? "Submitting..." : "Create Pledge"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
