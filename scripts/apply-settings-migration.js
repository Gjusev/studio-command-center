import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function applySettingsMigration() {
    // Conexión directa a la base de datos remota
    const sql = postgres(process.env.DATABASE_URL)

    try {
        console.log('🔧 Connecting to database...')

        // Leer el add_settings_table.sql
        const migrationPath = path.join(__dirname, '../database/add_settings_table.sql')
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

        console.log('📝 Applying settings migration...')

        // Ejecutar la migración
        await sql.unsafe(migrationSQL)

        console.log('✅ Settings migration applied successfully!')

        // Verificar que la tabla existe
        const tables = await sql`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'studio_manager'
            AND table_name = 'user_settings'
        `

        if (tables.length > 0) {
            console.log('✅ user_settings table created successfully!')
        } else {
            throw new Error('user_settings table not found after migration')
        }

        // Verificar que la función existe
        const functions = await sql`
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'studio_manager'
            AND routine_name = 'get_or_create_user_settings'
        `

        if (functions.length > 0) {
            console.log('✅ get_or_create_user_settings() function created successfully!')
        } else {
            throw new Error('get_or_create_user_settings function not found after migration')
        }

    } catch (error) {
        console.error('❌ Settings migration failed:', error.message)

        // Verificar si es un error de "already exists"
        if (error.message.includes('already exists')) {
            console.log('\n⚠️  Settings table/function already exists. Migration may have been applied previously.')
            process.exit(0)
        }

        throw error
    } finally {
        await sql.end()
    }
}

applySettingsMigration()
    .then(() => {
        console.log('\n✨ Migration complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error.message)
        process.exit(1)
    })
