/**
 * Applies every schema file in order: base schema first, then module schemas.
 * Idempotent — safe to re-run (each file uses IF NOT EXISTS where it matters).
 *
 * Run with: bun scripts/migrate.mjs   (bun auto-loads .env)
 */
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FILES = [
    '../database/schema.sql',
    '../database/contracts-schema.sql',
    '../database/add-classes-schema.sql',
    '../database/add-finances-schema.sql',
    '../database/add-notifications-schema.sql',
    '../database/add_settings_table.sql',
]

const sql = postgres(process.env.DATABASE_URL)

// Module schemas qualify tables with studio_manager but reference types and
// enums unqualified — resolve them by pinning the search_path.
await sql.unsafe('SET search_path TO studio_manager, public')

for (const f of FILES) {
    const p = path.join(__dirname, f)
    const content = fs.readFileSync(p, 'utf-8')
    process.stdout.write(`applying ${path.basename(f)} ... `)
    try {
        await sql.unsafe(content)
        console.log('ok')
    } catch (err) {
        // "already exists" is the only benign repeat-outcome; anything else aborts
        if (/already exists/i.test(err.message)) {
            console.log('already applied')
            continue
        }
        console.error('FAILED:', err.message)
        process.exit(1)
    }
}

await sql.end()
console.log('\nMigration complete.')
