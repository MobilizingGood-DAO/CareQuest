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
import { SubmissionStage } from "@/lib/care-quest/types"
import { AlertCircle } from "lucide-react"

const STAGES: { value: SubmissionStage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "gtm", label: "GTM" },
  { value: "final", label: "Final" },
]

export default function SubmitUpdatePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [teams, setTeams] = useState<(Team & { program: Program })[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    stage: "idea" as SubmissionStage,
    repo_url: "",
    demo_url: "",
    description: "",
  })

  useEffect(() => {
    if (!isConnected || !address) return
    const fetchTeams = async () => {
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*, program:programs(*)")
        .eq("wallet_address", address.toLowerCase())
      const typed = (teamsData || []) as (Team & { program: Program })[]
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
      const { error: insertError } = await supabase.from("submissions").insert({
        team_id: selectedTeamId,
        program_id: team.program_id,
        stage: form.stage,
        repo_url: form.repo_url.trim() || null,
        demo_url: form.demo_url.trim() || null,
        description: form.description.trim() || null,
      })
      if (insertError) throw insertError
      router.push("/care-quest/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit update.")
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
              Connect your wallet to submit project updates.
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
          <CardTitle>Submit Project Update</CardTitle>
          <CardDescription>
            Submit a progress update or deliverable for your team.
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
              <Label>Stage</Label>
              <select
                value={form.stage}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stage: e.target.value as SubmissionStage,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo_url">Repo URL (optional)</Label>
              <Input
                id="repo_url"
                type="url"
                value={form.repo_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, repo_url: e.target.value }))
                }
                placeholder="https://github.com/..."
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo_url">Demo URL (optional)</Label>
              <Input
                id="demo_url"
                type="url"
                value={form.demo_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, demo_url: e.target.value }))
                }
                placeholder="https://..."
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe your progress..."
                rows={4}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || teams.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? "Submitting..." : "Submit Update"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
