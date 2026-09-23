const postgres = require('postgres')

async function assignStudioleiter() {
    const sql = postgres.default(process.env.DATABASE_URL, {
        max: 1,
    })

    try {
        console.log('🔌 Conectando a la base de datos...')

        // Asignar rol
        const result = await sql`
            UPDATE studio_manager.users
            SET role = 'studioleiter'
            WHERE email = 'youhaghi@mokka-agentur.de'
            RETURNING id, email, display_name, role
        `

        if (result.length === 0) {
            console.log('❌ Usuario no encontrado con email: youhaghi@mokka-agentur.de')
        } else {
            console.log('✅ Rol actualizado exitosamente:')
            console.log(JSON.stringify(result[0], null, 2))
        }
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await sql.end()
    }
}

assignStudioleiter()
