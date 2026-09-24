# Getting started

[← Documentation](README.md) · [Architecture](architecture.md)

## Requirements

- Bun, installed locally.
- PostgreSQL 14+ with a dedicated, empty local database.
- Permission to create the application's schema and tables in that database.

## Configure

```bash
bun install --frozen-lockfile
cp .env.example .env
```

On PowerShell, `Copy-Item .env.example .env` is equivalent. Edit `.env`:

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Connection string for the dedicated local PostgreSQL database |
| `BETTER_AUTH_SECRET` | Random signing secret, at least 32 characters |
| `BETTER_AUTH_URL` | Authentication origin; `http://localhost:3000` locally |
| `NEXT_PUBLIC_APP_URL` | Application origin; `http://localhost:3000` locally |
| `NEXT_PUBLIC_DEMO_MODE` | Enables demonstration controls; sample value is `true` |

Generate a local signing secret with:

```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Bootstrap and run

```bash
bun run db:migrate
bun run db:demo
bun run dev
```

Open [localhost:3000](http://localhost:3000). Use the demo sign-in controls
with the synthetic seed. The database must already exist: the migration
runner applies the base and module schemas, not database provisioning.

The seed writes business records. Use only a dedicated demonstration database.
The migration runner is a bootstrap tool, not a versioned upgrade system;
do not treat rerunning it as a production migration plan.

## Checks

```bash
bun run lint
```

For browser tests, keep the development server running, then in another terminal:

```bash
bun scripts/create-e2e-test-data.mjs
bun run test:e2e
```

These commands create synthetic test accounts and exercise the running app.
They need a browser installed for Playwright and the dedicated local database.
See [current boundaries](architecture.md#current-boundaries) before adapting
the project to real studio operations.
