# CARE QUEST – Handoff Document

**Last updated:** March 7, 2025  
**Timeline:** ~4 days to MVP; Build Games is a 6-week Avalanche program ($100k grand prize, $5–40k category prizes)

---

## Quick Start (New Person)

1. **Clone the repo** (or pull latest)
2. **Copy env:** `cp .env.example .env.local` (or create `.env.local` manually)
3. **Add Supabase credentials** to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Run schema:** In Supabase SQL Editor, execute `scripts/care-quest-schema.sql`
5. **Install & run:**
   ```bash
   npm install
   npm run dev
   ```
6. **Open:** http://localhost:3000/care-quest

---

## Current State

### Done
- [x] CARE QUEST routes: Home, Register Team, Submit Update, Pledge, Dashboard, Treasury
- [x] Supabase schema: programs, teams, submissions, pledges, treasury_records
- [x] wagmi + viem (Avalanche C-Chain) for wallet connection
- [x] Build Games program context (6-week, $100k, category prizes)
- [x] `.env.local` with Supabase credentials
- [x] `.env.example` template (placeholders only)
- [x] Dev server runs successfully

### In Progress
- [ ] Supabase schema run (needs to be executed in Supabase if not done)
- [ ] End-to-end test of full flow
- [ ] GitHub push / repo setup for collaborators

### To Do
- [ ] Fix any build issues (e.g. unrelated leaderboard import – previously fixed)
- [ ] Polish UI / responsive behavior
- [ ] Add program dates (6-week window) if available
- [ ] Push to GitHub; add collaborators

---

## Test Checklist

Before handoff, verify:

1. **Home** – Loads, shows Build Games context
2. **Connect Wallet** – MetaMask or other EVM wallet (Avalanche C-Chain preferred)
3. **Register Team** – Requires schema; creates team in `teams` table
4. **Submit Update** – Requires registered team; creates submission
5. **Pledge** – Requires registered team; creates pledge
6. **Dashboard** – Shows teams, pledges, program info
7. **Treasury** – Shows pledge commitments and placeholder wallet

---

## Known Issues / Notes

- **Supabase:** Schema must be run in Supabase SQL Editor before Register/Submit/Pledge work.
- **Leaderboard:** Pre-existing GOOD CARE app has other pages; `debugUserStats` import was removed to fix build.
- **CARE QUEST is at `/care-quest`** – main app home is `/`.
- **.env.local is gitignored** – never commit real credentials.

---

## File Reference

| File | Purpose |
|------|---------|
| `scripts/care-quest-schema.sql` | Database schema; run in Supabase |
| `CARE_QUEST_README.md` | CARE QUEST product + setup details |
| `.env.example` | Template for env vars |
| `app/care-quest/` | All CARE QUEST pages |
| `components/care-quest/` | Nav, wallet button |
| `lib/care-quest/` | Types, wagmi config |

---

## Collaborative Workflow

- **Before starting work:** `git pull origin main`
- **After changes:** `git add .` → `git commit -m "message"` → `git push origin main`
- **Env:** Each dev creates their own `.env.local` from `.env.example`
- **Schema:** Shared Supabase project = shared DB; or each dev runs schema in their own project

---

*Update this doc as you progress. Add to "Done" and move items from "To Do" as they're completed.*
