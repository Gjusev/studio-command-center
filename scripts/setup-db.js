import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupDatabase() {
    // Conexión directa a la base de datos remota
    const sql = postgres(process.env.DATABASE_URL)

    try {
        console.log('🔧 Connecting to database...')

        // Leer el schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql')
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8')

        // Ejecutar todo el schema SQL en una sola transacción
        // Esto es importante para mantener el search_path correcto
        await sql.unsafe(schemaSQL)

        console.log('✅ Database setup completed successfully!')

        // Verificar que las tablas existen
        const tables = await sql`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'studio_manager'
            ORDER BY table_name
        `

        console.log(`\n📊 Created ${tables.length} tables in studio_manager schema:`)
        tables.forEach(table => {
            console.log(`   - ${table.table_name}`)
        })

    } catch (error) {
        console.error('❌ Database setup failed:', error.message)

        // Verificar si es un error de "already exists"
        if (error.message.includes('already exists')) {
            console.log('\n⚠️  Schema already exists. Run: node scripts/reset-db.js first')
        }

        throw error
    } finally {
        await sql.end()
    }
}

setupDatabase()
    .then(() => {
        console.log('\n✨ Setup complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Setup failed:', error.message)
        process.exit(1)
    })
