import postgres from 'postgres'

async function run() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 })

  // Check current session columns
  const sessionCols = await sql.unsafe(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'studio_manager' AND table_name = 'session'
    ORDER BY ordinal_position
  `)
  console.log('Current session columns:', sessionCols.map(c => c.column_name).join(', '))

  // Better Auth expects: id, expiresAt, token, ipAddress, userAgent, userId, createdAt, updatedAt
  // We need to rename useragent -> userAgent (case-sensitive with quotes)
  console.log('\nFixing column names...')
  
  try {
    await sql.unsafe(`ALTER TABLE studio_manager."session" RENAME COLUMN useragent TO "userAgent"`)
    console.log('  Renamed: useragent -> userAgent')
  } catch (e) { console.log('  userAgent rename:', e.message) }

  // Verify
  const sessionColsAfter = await sql.unsafe(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'studio_manager' AND table_name = 'session'
    ORDER BY ordinal_position
  `)
  console.log('\nFixed session columns:', sessionColsAfter.map(c => c.column_name).join(', '))

  await sql.end()
}

run()
