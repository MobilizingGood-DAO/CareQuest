export interface Project {
  id: string
  wallet_address: string
  project_name: string
  description: string | null
  pledge_percent: number
  created_at: string
}
