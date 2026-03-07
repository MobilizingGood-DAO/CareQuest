CARE QUEST
Lightweight RepFi Infrastructure for Builder Ecosystems

Most Web3 incentive programs move a lot of money but leave very little infrastructure behind. Hackathons, grants, and ecosystem competitions create bursts of activity, then attention fades once rewards are distributed.

CARE QUEST experiments with a simple fix.

Builders participating in programs like Avalanche Build Games can voluntarily pledge a small percentage of potential rewards toward ecosystem public goods, developer tooling, or community initiatives. Those commitments are tracked in a public dashboard.

Think of it as a small piece of RepFi for builders — a way to make ecosystem alignment visible without introducing another token, DAO, or governance layer.

If stewardship becomes visible, it may become competitive.

The Concept

Incentive programs already coordinate builders around rewards.

CARE QUEST adds a lightweight layer that tracks how builders choose to give back to the ecosystem they are building on.

Simple flow:

Builders
↓
CARE QUEST pledge
↓
Impact dashboard
↓
CARE treasury (future)
↓
Ecosystem public goods

The experiment is simple:
Can visible commitments improve ecosystem alignment?

MVP (Build Games Prototype)

The MVP focuses on demonstrating the coordination model.

1. Identity

Users sign in with:

GitHub OAuth (primary builder identity)

optional wallet connection

2. Register Project

Builders register a project participating in an incentive program.

Fields:

project name

description

GitHub username

optional wallet address

3. Submit Pledge

Builders voluntarily commit a percentage of potential rewards.

Example:

If our project wins Build Games rewards,
we pledge X% toward ecosystem public goods.

Example pledge options:

1%
3%
5%
10%

Optional inputs:

category

short statement

4. Impact Dashboard

The dashboard aggregates ecosystem participation.

Example metrics:

Participating Projects
Average Pledge %
Total Ecosystem Commitment
Builder Leaderboard

Example view:

Project | Pledge | Statement

The dashboard is the core visual demonstration of the concept.

Tech Stack

The prototype prioritizes speed and simplicity.

Frontend

Next.js

TailwindCSS

TypeScript

Backend

Supabase

Tables

projects
pledges

Identity

Supabase GitHub OAuth

optional wallet connection (wagmi)

Deployment

Vercel

Go-To-Market

CARE QUEST targets ecosystem incentive programs where builders already coordinate around rewards.

Examples:

Avalanche Build Games

hackathons

grant programs

builder competitions

retroactive funding rounds

These programs distribute large rewards but lack coordination infrastructure for ecosystem stewardship.

CARE QUEST can plug into these environments without requiring protocol changes.

Final Pitch Experiment

For the Build Games final pitch, CARE QUEST introduces a parallel challenge.

Builders can submit contractually backed pledges alongside their project submissions.

Example:

If our project wins a Build Games reward,
we pledge 3% toward ecosystem public goods.

These commitments appear publicly on the CARE QUEST dashboard.

Builders are no longer competing only on technical performance.

They are also competing on ecosystem commitment.

Why Avalanche

Avalanche has one of the most active builder ecosystems in crypto, but like most networks it still faces the challenge of short-term incentive cycles.

CARE QUEST explores whether visible builder commitments can strengthen long-term ecosystem alignment.

Status

Current stage: Build Games MVP

Prototype goals:

project registration

pledge submission

impact dashboard

The purpose is to test whether visible builder commitments can improve ecosystem coordination.

Contributing

Developers interested in the prototype are welcome to contribute.

Areas where help is useful:

frontend UX

dashboard visualization

identity integration

If you'd like, the next strategic step (and it would significantly help your outreach to Smitty/Tactical) is adding one more short section called:

“Why This Matters for Incentive Design”

Because that frames CARE QUEST as infrastructure for fixing incentive misalignment, which is exactly the topic those devs care about.
