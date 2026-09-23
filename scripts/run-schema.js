import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  connect_timeout: 15,
})

async function setup() {
  try {
    console.log('Connecting to database...')
    
    // Drop existing schema and recreate (clean slate)
    console.log('Dropping existing studio_manager schema...')
    await sql.unsafe(`DROP SCHEMA IF EXISTS studio_manager CASCADE`)
    console.log('Schema dropped.')
    
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8')
    
    // Execute schema
    console.log('Creating new schema...')
    await sql.unsafe(schemaSQL)
    
    console.log('Schema executed successfully!')
    
    // Verify tables
    const tables = await sql`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = 'studio_manager'
      ORDER BY table_name
    `
    
    console.log(`\nTables in studio_manager schema (${tables.length}):`)
    tables.forEach(t => console.log(`  - ${t.table_schema}.${t.table_name}`))
    
    // Check public schema tables (should be none from us)
    const publicTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'verification', 'organization', 'member', 'invitation')
      ORDER BY table_name
    `
    
    if (publicTables.length > 0) {
      console.log(`\nWARNING: Found Better Auth tables in PUBLIC schema:`)
      publicTables.forEach(t => console.log(`  - public.${t.table_name}`))
    } else {
      console.log('\nNo Better Auth tables in public schema (good!)')
    }
    
  } catch (error) {
    console.error('Setup failed:', error.message)
    throw error
  } finally {
    await sql.end()
  }
}

setup()
  .then(() => { process.exit(0) })
  .catch(() => { process.exit(1) })
