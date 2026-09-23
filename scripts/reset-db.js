import postgres from 'postgres'

async function resetDatabase() {
    const sql = postgres(process.env.DATABASE_URL)

    try {
        console.log('🔧 Connecting to database...')

        // Eliminar también tablas del schema public
        const dropOrder = [
            'task_completions',
            'task_assignments',
            'task_templates',
            'employees',
            'machine_events',
            'machines',
            'machine_categories',
            'consumable_movements',
            'consumables',
            'suppliers',
            'locations',
            'categories',
            'audit_logs',
            'users',
            'studios'
        ]

        for (const tableName of dropOrder) {
            try {
                await sql.unsafe(`DROP TABLE IF EXISTS studio_manager.${tableName} CASCADE`)
                console.log(`✅ Dropped studio_manager.${tableName}`)
            } catch (error) {
                // Ignorar si no existe
            }
            try {
                await sql.unsafe(`DROP TABLE IF EXISTS public.${tableName} CASCADE`)
                console.log(`✅ Dropped public.${tableName}`)
            } catch (error) {
                // Ignorar si no existe
            }
        }

        // Eliminar el schema
        try {
            await sql.unsafe(`DROP SCHEMA IF EXISTS studio_manager CASCADE`)
            console.log(`✅ Dropped schema: studio_manager`)
        } catch (error) {
            console.log(`⚠️  Could not drop schema:`, error.message)
        }

        // Eliminar los enums
        const enums = ['user_role', 'movement_type', 'machine_status', 'event_type', 'event_status']
        for (const enumName of enums) {
            try {
                await sql.unsafe(`DROP TYPE IF EXISTS ${enumName} CASCADE`)
                console.log(`✅ Dropped type: ${enumName}`)
            } catch (error) {
                // Ignorar errores de tipos que no existen
            }
        }

        console.log('\n✅ Database cleaned successfully!')

    } catch (error) {
        console.error('❌ Database cleanup failed:', error)
        throw error
    } finally {
        await sql.end()
    }
}

resetDatabase()
    .then(() => {
        console.log('\n✨ Cleanup complete! You can now run: bun run db:setup')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Cleanup failed:', error)
        process.exit(1)
    })
