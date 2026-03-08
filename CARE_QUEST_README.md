# CARE QUEST

> **Handoff doc:** See [HANDOFF.md](./HANDOFF.md) for current state, test checklist, and collaborator setup.

A coordination layer for the Avalanche Build Games incentive program. Build Games is a 6-week Avalanche-native program with a $100k grand prize and $5–40k category prizes. CARE QUEST helps the incentive program itself—adding participation tracking, transparency, and optional ecosystem contribution—rather than the "take the money and run" approach.

## Product Definition

CARE QUEST is **not** a generic Web3 reputation dashboard. It provides:

- Builder teams registering for program rounds
- Teams submitting project updates (idea / mvp / gtm / final)
- Optional pledges (1–10%) toward ecosystem-supporting initiatives
- Public dashboard for participation metrics
- Treasury transparency for pledge commitments and fulfillment status

**MVP is offchain** – Supabase is the source of truth. Blockchain integration is optional and represented via stored references (wallet_address, tx_hash, chain_id).

## Setup

### 1. Supabase environment variables

Add to `.env.local` (from Supabase → Project Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://hmevvklsavhrmepyfxpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZXZ2a2xzYXZocm1lcHlmeHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTMyMjAsImV4cCI6MjA4ODQ4OTIyMH0.YRenaJykT04ppWEwVrtG9BXRnC9SIHCpkXimcr_JHOs
```

### 2. Database schema

Run the SQL in `scripts/care-quest-schema.sql` in the Supabase SQL Editor. This creates:

- `projects` – id, wallet_address, project_name, description, pledge_percent, created_at

### 3. Access

Visit `/care-quest` in your browser.

## Tech Stack

- Next.js (App Router)
- TailwindCSS
- Supabase
- wagmi + viem (Avalanche C-Chain)
- TypeScript

## Pages

- **Home** – Explains CARE QUEST, Connect Wallet
- **Register Project** – project_name, description, pledge_percent (1–10%); inserts into `projects`
- **Dashboard** – Participating projects count, total pledged %, project list

## Future Integration

The schema supports future on-chain integration via:

- `wallet_address` (teams)
- `tx_hash`, `chain_id` (treasury_records)
- `pledge_status` (draft / confirmed / fulfilled)
