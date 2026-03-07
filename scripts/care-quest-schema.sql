-- CARE QUEST: Avalanche Build Games coordination layer
-- Run this in Supabase SQL Editor to create all tables

-- Programs: incentive programs or rounds (e.g. Build Games)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'upcoming')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams: builder teams/projects participating in a program
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  wallet_address TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions: team updates/deliverables
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('idea', 'mvp', 'gtm', 'final')),
  repo_url TEXT,
  demo_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pledges: optional ecosystem contribution commitments
CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  pledge_percentage INTEGER NOT NULL CHECK (pledge_percentage >= 1 AND pledge_percentage <= 10),
  pledge_status TEXT DEFAULT 'draft' CHECK (pledge_status IN ('draft', 'confirmed', 'fulfilled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury records: fulfillment or funding activity
CREATE TABLE IF NOT EXISTS treasury_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  amount TEXT,
  asset_symbol TEXT,
  tx_hash TEXT,
  chain_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_records ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Programs public read" ON programs FOR SELECT USING (true);
CREATE POLICY "Teams public read" ON teams FOR SELECT USING (true);
CREATE POLICY "Submissions public read" ON submissions FOR SELECT USING (true);
CREATE POLICY "Pledges public read" ON pledges FOR SELECT USING (true);
CREATE POLICY "Treasury public read" ON treasury_records FOR SELECT USING (true);

-- Allow insert (wallet verified client-side)
CREATE POLICY "Teams insert" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Submissions insert" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Pledges insert" ON pledges FOR INSERT WITH CHECK (true);
CREATE POLICY "Treasury insert" ON treasury_records FOR INSERT WITH CHECK (true);

-- Allow update for pledges (status changes)
CREATE POLICY "Pledges update" ON pledges FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_program_id ON teams(program_id);
CREATE INDEX IF NOT EXISTS idx_teams_wallet ON teams(wallet_address);
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_program_id ON submissions(program_id);
CREATE INDEX IF NOT EXISTS idx_pledges_team_id ON pledges(team_id);
CREATE INDEX IF NOT EXISTS idx_pledges_program_id ON pledges(program_id);
CREATE INDEX IF NOT EXISTS idx_treasury_program_id ON treasury_records(program_id);

-- Seed Build Games program (run once)
-- 6-week Avalanche native program: $100k grand prize, $5–40k category prizes
INSERT INTO programs (name, description, status)
SELECT
  'Build Games on Avalanche',
  'Avalanche-native 6-week game-building program. $100k grand prize and $5–40k category prizes. CARE QUEST helps coordinate participation, track submissions, and enables optional ecosystem contribution pledges.',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM programs WHERE name = 'Build Games on Avalanche');
