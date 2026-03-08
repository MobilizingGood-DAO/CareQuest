-- CARE QUEST: Avalanche Build Games MVP
-- Run in Supabase SQL Editor
-- Single projects table only

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  pledge_percent INTEGER NOT NULL CHECK (pledge_percent >= 1 AND pledge_percent <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects insert" ON projects FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_projects_wallet_address ON projects(wallet_address);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
