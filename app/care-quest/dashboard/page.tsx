"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Team, Pledge, Program } from "@/lib/care-quest/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Percent,
  FileCheck,
  Gift,
  ChevronRight,
} from "lucide-react"

interface TeamWithPledge extends Team {
  program?: Program
  pledge?: Pledge | null
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<TeamWithPledge[]>([])
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [
        { data: teamsData },
        { data: pledgesData },
        { data: programsData },
      ] = await Promise.all([
        supabase.from("teams").select("*, program:programs(*)").order("created_at", { ascending: false }),
        supabase.from("pledges").select("*"),
        supabase.from("programs").select("*").eq("status", "active"),
      ])
      setTeams((teamsData as TeamWithPledge[]) || [])
      setPledges((pledgesData as Pledge[]) || [])
      setPrograms((programsData as Program[]) || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const teamCount = teams.length
  const totalPledged = pledges.reduce((sum, p) => sum + p.pledge_percentage, 0)
  const teamsWithPledges = teams.map((t) => ({
    ...t,
    pledge: pledges.find((p) => p.team_id === t.id) ?? null,
  }))

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Participating Teams
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Pledged %
            </CardTitle>
            <Percent className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPledged}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Active programs */}
      {programs.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Active Programs</CardTitle>
            <CardDescription>
              Avalanche incentive program rounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-800 bg-slate-800/30 p-4"
                >
                  <p className="font-medium">{p.name}</p>
                  {p.description && (
                    <p className="mt-1 text-sm text-slate-500">{p.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team list */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Participating Teams</CardTitle>
          <CardDescription>
            Teams registered for the program and their optional pledge percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No teams registered yet. Be the first to register for the program!
            </p>
          ) : (
            <div className="space-y-4">
              {teamsWithPledges.map((team) => (
                <div
                  key={team.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{team.name}</p>
                    {team.description && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {team.description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-xs text-slate-600">
                      {`${team.wallet_address.slice(0, 6)}...${team.wallet_address.slice(-4)}`}
                    </p>
                  </div>
                  {team.pledge ? (
                    <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                      <Gift className="h-4 w-4" />
                      <span className="font-semibold">{team.pledge.pledge_percentage}%</span>
                      <span className="text-xs text-slate-500">({team.pledge.pledge_status})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">No pledge</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
          <Link href="/care-quest/register">
            Register Team
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-700">
          <Link href="/care-quest/submit">
            Submit Update
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-700">
          <Link href="/care-quest/pledge">
            Pledge
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
