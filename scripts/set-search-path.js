import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

async function run() {
  try {
    await sql.unsafe(`ALTER ROLE postgres SET search_path TO studio_manager, public`)
    console.log('search_path set for postgres user')
    
    const result = await sql`SHOW search_path`
    console.log('Current search_path:', result[0].search_path)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await sql.end()
  }
}

run()
