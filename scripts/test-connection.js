import postgres from 'postgres'

async function testConnection() {
    console.log('🔧 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

    const sql = postgres(process.env.DATABASE_URL)

    try {
        // Intentar conectar
        const result = await sql`SELECT VERSION(), NOW()`
        console.log('✅ Successfully connected to database!')
        console.log('📊 Database version:', result[0].version)
        console.log('🕐 Server time:', result[0].now)

        // Verificar si existe el schema studio_manager
        const schemas = await sql`
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name = 'studio_manager'
        `
        console.log('\n📋 Schema studio_manager exists:', schemas.length > 0 ? '✅ Yes' : '❌ No')

        // Listar todas las tablas en studio_manager si existe
        if (schemas.length > 0) {
            const tables = await sql`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'studio_manager'
                ORDER BY table_name
            `
            console.log(`\n📊 Found ${tables.length} tables in studio_manager schema:`)
            tables.forEach(table => console.log(`   - ${table.table_name}`))
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message)
        console.error('\nTroubleshooting:')
        console.error('1. Check if PostgreSQL server is running')
        console.error('2. Verify DATABASE_URL is correct')
        console.error('3. Check firewall settings')
        console.error('4. Ensure remote access is enabled')
    } finally {
        await sql.end()
    }
}

testConnection()
