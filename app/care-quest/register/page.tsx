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
import { Program } from "@/lib/care-quest/types"
import { AlertCircle } from "lucide-react"

export default function RegisterTeamPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact_email: "",
  })

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
      setPrograms((data as Program[]) || [])
      if (data?.[0]) setSelectedProgramId((data[0] as Program).id)
    }
    fetchPrograms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      setError("Please connect your Avalanche wallet first.")
      return
    }
    if (!selectedProgramId) {
      setError("No active program found. Please try again later.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: insertError } = await supabase.from("teams").insert({
        program_id: selectedProgramId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        wallet_address: address.toLowerCase(),
        contact_email: form.contact_email.trim() || null,
      })
      if (insertError) throw insertError
      router.push("/care-quest/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register team.")
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
              Connect your Avalanche C-Chain wallet to register your team for the program.
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
          <CardTitle>Register Your Team</CardTitle>
          <CardDescription>
            Register your builder team for the Avalanche incentive program.
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
            {programs.length > 0 && (
              <div className="space-y-2">
                <Label>Program</Label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Team / Project Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My Game Project"
                required
                maxLength={200}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of your project..."
                rows={4}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email (optional)</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contact_email: e.target.value }))
                }
                placeholder="team@example.com"
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || programs.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? "Submitting..." : "Register Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
