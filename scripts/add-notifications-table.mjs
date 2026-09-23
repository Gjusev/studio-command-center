import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

async function run() {
  await sql.unsafe(`SET search_path TO studio_manager, public`)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL DEFAULT 'info',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      entity_type VARCHAR(100),
      entity_id UUID,
      is_read BOOLEAN NOT NULL DEFAULT false,
      action_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC)`)
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_notifications_studio ON notifications(studio_id)`)

  console.log('Notifications table created')
  await sql.end()
}

run().catch(e => { console.error(e); process.exit(1) })
