export interface Program {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: "active" | "ended" | "upcoming"
  created_at: string
}

export interface Team {
  id: string
  program_id: string
  name: string
  description: string | null
  wallet_address: string
  contact_email: string | null
  created_at: string
}

export interface Submission {
  id: string
  team_id: string
  program_id: string
  stage: "idea" | "mvp" | "gtm" | "final"
  repo_url: string | null
  demo_url: string | null
  description: string | null
  submitted_at: string
}

export interface Pledge {
  id: string
  team_id: string
  program_id: string
  pledge_percentage: number
  pledge_status: "draft" | "confirmed" | "fulfilled"
  notes: string | null
  created_at: string
}

export interface TreasuryRecord {
  id: string
  program_id: string | null
  team_id: string | null
  amount: string | null
  asset_symbol: string | null
  tx_hash: string | null
  chain_id: string | null
  status: "pending" | "completed" | "failed"
  created_at: string
}

export type SubmissionStage = "idea" | "mvp" | "gtm" | "final"
