"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Project } from "@/lib/care-quest/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Percent } from "lucide-react"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
      setProjects((data as Project[]) || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const projectCount = projects.length
  const totalPledged = projects.reduce((sum, p) => sum + p.pledge_percent, 0)

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Participating Projects
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
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

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Build Games Projects</CardTitle>
          <CardDescription>
            Registered projects and their pledge percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No projects registered yet. Be the first to register for Build Games!
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{project.project_name}</p>
                    {project.description && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {project.description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-xs text-slate-600">
                      {`${project.wallet_address.slice(0, 6)}...${project.wallet_address.slice(-4)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400 font-semibold">
                    {project.pledge_percent}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
        <Link href="/care-quest/register">Register Project</Link>
      </Button>
    </div>
  )
}
