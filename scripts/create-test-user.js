import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

async function run() {
  const id = crypto.randomUUID()
  const accountId = crypto.randomUUID()

  // Simple password hash - Better Auth uses scrypt
  const { hashPassword } = await import('better-auth/crypto')
  const hashedPw = await hashPassword('TestPass123')

  // Insert user
  await sql.unsafe(`
    INSERT INTO studio_manager."user" (id, name, email, "emailVerified")
    VALUES ('${id}', 'Admin User', 'admin@studio.com', true)
  `)

  // Insert account (credential provider)
  await sql.unsafe(`
    INSERT INTO studio_manager.account (id, "accountId", "providerId", "userId", password)
    VALUES ('${accountId}', 'admin@studio.com', 'credential', '${id}', '${hashedPw}')
  `)

  console.log('User created:', id)
  console.log('Email: admin@studio.com')
  console.log('Password: TestPass123')

  // Verify
  const users = await sql.unsafe(`SELECT id, name, email FROM studio_manager."user"`)
  console.log('Users in DB:', JSON.stringify(users, null, 2))

  await sql.end()
}

run().catch(e => { console.error(e.message); process.exit(1) })
