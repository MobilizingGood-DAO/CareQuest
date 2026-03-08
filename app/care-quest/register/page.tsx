"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnectButton } from "@/components/care-quest/wallet-connect-button"
import { AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    project_name: "",
    description: "",
    pledge_percent: 5,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      setError("Please connect your Avalanche wallet first.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const { error: insertError } = await supabase.from("projects").insert({
        wallet_address: address.toLowerCase(),
        project_name: form.project_name.trim(),
        description: form.description.trim() || null,
        pledge_percent: form.pledge_percent,
      })
      if (insertError) throw insertError
      router.push("/care-quest/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register project.")
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
              Connect your Avalanche C-Chain wallet to register your project for Build Games.
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
          <CardTitle>Register Your Project</CardTitle>
          <CardDescription>
            Register for Avalanche Build Games. Pledge 1–10% of potential rewards toward ecosystem initiatives.
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
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={form.project_name}
                onChange={(e) => setForm((prev) => ({ ...prev, project_name: e.target.value }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your project..."
                rows={4}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pledge_percent">Pledge % (1–10%)</Label>
              <Input
                id="pledge_percent"
                type="number"
                min={1}
                max={10}
                value={form.pledge_percent}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    pledge_percent: Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)),
                  }))
                }
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? "Submitting..." : "Register Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
