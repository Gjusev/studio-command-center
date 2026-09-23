# Getting started

## Requirements

- Bun ≥ 1.0
- PostgreSQL ≥ 14 (a dedicated local database)

## Setup

```bash
git clone https://github.com/Gjusev/studio_manager.git
cd studio_manager
bun install --frozen-lockfile
cp .env.example .env
# Set DATABASE_URL to your local database
# Generate a BETTER_AUTH_SECRET (32+ random chars)
bun run db:migrate   # base schema + module schemas, idempotent
bun run db:demo      # synthetic business records
bun run dev          # http://localhost:3000
```

The sign-in page offers demo buttons when `NEXT_PUBLIC_DEMO_MODE=true`
(the `.env.example` default). Demo mode is meant for demonstration data
only. `bun run db:demo` writes synthetic consumables, machines, tasks,
members, classes and finance records to the configured database.

## Demo users

With the dev server running:

```bash
bun scripts/create-e2e-test-data.mjs
```

Creates `admin@teststudio.de` / `TestPass123!` (Studioleiter) and
`mitarbeiter@teststudio.de` / `TestPass123!` (Mitarbeiter) through the real
sign-up endpoint.

## Checks

```bash
bun run lint
bun run test:e2e   # Playwright; app and test users required
```

## Verification notes

- `db:migrate` is idempotent; re-running reports already-applied parts.
- The schema bootstrap and module schemas are applied in one command; a
  dedicated migration tool for upgrades of existing installations is a
  documented gap — see [architecture.md](architecture.md#current-boundaries).
