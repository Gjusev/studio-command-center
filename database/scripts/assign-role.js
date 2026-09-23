const { Client } = require('pg')

async function assignStudioleiter() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    })

    try {
        await client.connect()
        console.log('✅ Conectado a la base de datos')

        // Asignar rol
        const result = await client.query(`
            UPDATE studio_manager.users
            SET role = 'studioleiter'
            WHERE email = 'youhaghi@mokka-agentur.de'
            RETURNING id, email, display_name, role
        `)

        if (result.rows.length === 0) {
            console.log('❌ Usuario no encontrado con email: youhaghi@mokka-agentur.de')
        } else {
            console.log('✅ Rol actualizado exitosamente:')
            console.log(JSON.stringify(result.rows[0], null, 2))
        }
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await client.end()
    }
}

assignStudioleiter()
