import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = postgres(process.env.DATABASE_URL)

async function run() {
  const classesSQL = readFileSync(join(__dirname, '..', 'database', 'add-classes-schema.sql'), 'utf8')
  await sql.unsafe(classesSQL)
  console.log('Classes schema created')

  const financesSQL = readFileSync(join(__dirname, '..', 'database', 'add-finances-schema.sql'), 'utf8')
  await sql.unsafe(financesSQL)
  console.log('Finances schema created')

  await sql.end()
}

run().catch(e => { console.error(e); process.exit(1) })
