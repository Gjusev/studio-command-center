import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
    const client = await pool.connect()
    try {
        await client.query('SET search_path TO studio_manager, public')

        await client.query(`
            CREATE TABLE IF NOT EXISTS employee_permissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                permission VARCHAR(100) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(studio_id, user_id, permission)
            )
        `)
        console.log('✓ employee_permissions table created')

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_employee_permissions_user ON employee_permissions(user_id)
        `)
        console.log('✓ employee_permissions index created')

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_employee_permissions_studio ON employee_permissions(studio_id)
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS studio_invitations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                role user_role NOT NULL DEFAULT 'mitarbeiter',
                token VARCHAR(255) NOT NULL UNIQUE,
                permissions TEXT[] DEFAULT '{}',
                used_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
                created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `)
        console.log('✓ studio_invitations table created')

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_studio_invitations_token ON studio_invitations(token)
        `)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_studio_invitations_email ON studio_invitations(email)
        `)

        // Add phone and email columns to studios if not exist
        try {
            await client.query(`ALTER TABLE studios ADD COLUMN IF NOT EXISTS phone VARCHAR(100)`)
            await client.query(`ALTER TABLE studios ADD COLUMN IF NOT EXISTS email VARCHAR(255)`)
            console.log('✓ studios table updated')
        } catch (e) {
            console.log('  (studios columns may already exist)')
        }

        console.log('\n✅ Migration complete!')
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        client.release()
        await pool.end()
    }
}

migrate()
