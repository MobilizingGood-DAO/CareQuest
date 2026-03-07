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

Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database schema

Run the SQL in `scripts/care-quest-schema.sql` in the Supabase SQL Editor. This creates:

- `programs` – incentive program rounds (Build Games seeded)
- `teams` – builder teams/projects
- `submissions` – team updates (stage, repo_url, demo_url, etc.)
- `pledges` – optional ecosystem contribution commitments
- `treasury_records` – fulfillment/funding activity

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
- **Register Team** – Register team for active program
- **Submit Update** – Submit project progress (stage, repo, demo)
- **Pledge** – Optional 1–10% pledge
- **Dashboard** – Participation metrics, teams, pledges
- **Treasury** – Pledge commitments and fulfillment records

## Future Integration

The schema supports future on-chain integration via:

- `wallet_address` (teams)
- `tx_hash`, `chain_id` (treasury_records)
- `pledge_status` (draft / confirmed / fulfilled)
