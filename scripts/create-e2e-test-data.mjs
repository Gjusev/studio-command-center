/**
 * Creates test users and seed data for E2E tests via Better Auth API.
 *
 * Test accounts created:
 *   Studioleiter:  admin@teststudio.de    / TestPass123!
 *   Mitarbeiter:   mitarbeiter@teststudio.de / TestPass123!
 *
 * Usage: node scripts/create-e2e-test-data.js
 */

import postgres from 'postgres'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const TEST_USERS = [
  { name: 'Admin Test', email: 'admin@teststudio.de', password: 'TestPass123!', role: 'studioleiter' },
  { name: 'Max Mitarbeiter', email: 'mitarbeiter@teststudio.de', password: 'TestPass123!', role: 'mitarbeiter' },
]

async function wipeTestData(sql) {
  console.log('Cleaning existing test data...')
  await sql.unsafe(`SET search_path TO studio_manager, public`)

  const testEmails = TEST_USERS.map(u => `'${u.email}'`).join(',')

  // Get test user ids
  const testUsers = await sql.unsafe(`
    SELECT id, email FROM "user" WHERE email IN (${testEmails})
  `)
  const testUserIds = testUsers.map(u => `'${u.id}'`).join(',')

  if (testUserIds) {
    // Delete in reverse dependency order
    await sql.unsafe(`DELETE FROM task_completions WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM task_assignments WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM task_templates WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM machine_events WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM consumable_movements WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM consumables WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM machines WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM audit_logs WHERE studio_id IN (SELECT studio_id FROM users WHERE id IN (${testUserIds}))`)
    await sql.unsafe(`DELETE FROM employees WHERE user_id IN (${testUserIds})`)
    await sql.unsafe(`DELETE FROM users WHERE id IN (${testUserIds})`)
    await sql.unsafe(`DELETE FROM "session" WHERE "userId" IN (${testUserIds})`)
    await sql.unsafe(`DELETE FROM account WHERE "userId" IN (${testUserIds})`)
    await sql.unsafe(`DELETE FROM "user" WHERE id IN (${testUserIds})`)
  }

  // Clean test studios
  await sql.unsafe(`DELETE FROM consumables WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM machines WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM categories WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM machine_categories WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM locations WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM suppliers WHERE studio_id IN (SELECT id FROM studios WHERE name = 'Test Fitness Studio')`)
  await sql.unsafe(`DELETE FROM studios WHERE name = 'Test Fitness Studio'`)

  console.log('  Cleaned.')
}

async function signUpUser(user) {
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE_URL,
    },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to sign up ${user.email}: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data
}

async function seedStudioData(sql, studioId, adminUserId, employeeUserId) {
  console.log('Seeding studio data...')

  // Categories
  const catHygiene = await insertAndGetId(sql,
    `INSERT INTO categories (studio_id, name, description) VALUES ($1, 'Hygiene', 'Reinigungs- und Hygieneartikel') RETURNING id`,
    [studioId]
  )
  const catSupplement = await insertAndGetId(sql,
    `INSERT INTO categories (studio_id, name, description) VALUES ($1, 'Supplements', 'Nahrungsergänzungsmittel') RETURNING id`,
    [studioId]
  )
  const catEquipment = await insertAndGetId(sql,
    `INSERT INTO categories (studio_id, name, description) VALUES ($1, 'Kleingeräte', 'Widerstandsbänder, Springseile, etc.') RETURNING id`,
    [studioId]
  )

  // Locations
  const locLager = await insertAndGetId(sql,
    `INSERT INTO locations (studio_id, name, description) VALUES ($1, 'Hauptlager', 'Lagerraum im Erdgeschoss') RETURNING id`,
    [studioId]
  )
  const locStudio = await insertAndGetId(sql,
    `INSERT INTO locations (studio_id, name, description) VALUES ($1, 'Studiofläche', 'Direkt im Trainingsbereich') RETURNING id`,
    [studioId]
  )

  // Suppliers
  const supplierId = await insertAndGetId(sql,
    `INSERT INTO suppliers (studio_id, name, contact_person, email, phone) VALUES ($1, 'FitSupply GmbH', 'Anna Müller', 'anna@fitsupply.de', '+49 30 123456') RETURNING id`,
    [studioId]
  )

  // Consumables
  const consumables = [
    { name: 'Handtücher', categoryId: catHygiene, locationId: locLager, supplierId, unit: 'Stück', stockCurrent: 50, stockMin: 20, unitCost: 3.50 },
    { name: 'Desinfektionsmittel', categoryId: catHygiene, locationId: locStudio, supplierId, unit: 'Liter', stockCurrent: 5, stockMin: 10, unitCost: 8.90 },
    { name: 'Protein Riegel', categoryId: catSupplement, locationId: locStudio, supplierId: null, unit: 'Stück', stockCurrent: 30, stockMin: 15, unitCost: 2.50 },
    { name: 'Widerstandsbänder Set', categoryId: catEquipment, locationId: locLager, supplierId: null, unit: 'Set', stockCurrent: 8, stockMin: 5, unitCost: 12.00 },
    { name: 'Reinigungsspray', categoryId: catHygiene, locationId: locStudio, supplierId, unit: 'Flasche', stockCurrent: 3, stockMin: 5, unitCost: 4.50 },
  ]

  for (const c of consumables) {
    await sql.unsafe(`
      INSERT INTO consumables (studio_id, name, category_id, location_id, supplier_id, unit, stock_current, stock_min, unit_cost)
      VALUES ('${studioId}', '${c.name}', ${c.categoryId ? `'${c.categoryId}'` : 'NULL'}, ${c.locationId ? `'${c.locationId}'` : 'NULL'}, ${c.supplierId ? `'${c.supplierId}'` : 'NULL'}, '${c.unit}', ${c.stockCurrent}, ${c.stockMin}, ${c.unitCost})
    `)
  }

  // Machine categories
  const mcCardio = await insertAndGetId(sql,
    `INSERT INTO machine_categories (studio_id, name, description) VALUES ($1, 'Cardio', 'Herz-Kreislauf-Geräte') RETURNING id`,
    [studioId]
  )
  const mcKraft = await insertAndGetId(sql,
    `INSERT INTO machine_categories (studio_id, name, description) VALUES ($1, 'Krafttraining', 'Kraftsportgeräte') RETURNING id`,
    [studioId]
  )

  // Machines
  const machines = [
    { name: 'Laufband Pro 5000', categoryId: mcCardio, locationId: locStudio, brand: 'Technogym', model: 'Run Personal', serialNo: 'TG-2024-001', status: 'IN_SERVICE' },
    { name: 'Crosstrainer Elite', categoryId: mcCardio, locationId: locStudio, brand: 'Life Fitness', model: 'CLX-800', serialNo: 'LF-2024-002', status: 'IN_SERVICE' },
    { name: 'Beinpresse X200', categoryId: mcKraft, locationId: locStudio, brand: 'Hammer Strength', model: 'LP-X200', serialNo: 'HS-2024-003', status: 'MAINTENANCE' },
    { name: 'Latzug Station', categoryId: mcKraft, locationId: locStudio, brand: 'Panatta', model: 'Lat-M1', serialNo: 'PA-2024-004', status: 'IN_SERVICE' },
  ]

  const machineIds = []
  for (const m of machines) {
    const mid = await insertAndGetId(sql,
      `INSERT INTO machines (studio_id, name, category_id, location_id, brand, model, serial_no, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::machine_status) RETURNING id`,
      [studioId, m.name, m.categoryId, m.locationId, m.brand, m.model, m.serialNo, m.status]
    )
    machineIds.push(mid)
  }

  // Machine events
  await sql.unsafe(`
    INSERT INTO machine_events (studio_id, machine_id, type, status, description, cost, downtime_minutes, created_by)
    VALUES ('${studioId}', '${machineIds[2]}', 'MAINTENANCE', 'OPEN', 'Jährliche Inspektion und Wartung erforderlich', 250.00, 120, '${adminUserId}')
  `)
  await sql.unsafe(`
    INSERT INTO machine_events (studio_id, machine_id, type, status, description, created_by)
    VALUES ('${studioId}', '${machineIds[0]}', 'INCIDENT', 'OPEN', 'Laufband macht seltsame Geräusche bei hoher Geschwindigkeit', '${employeeUserId || adminUserId}')
  `)

  // Task templates
  const taskTemplates = [
    { title: 'Studiosaal reinigen', description: 'Komplette Reinigung des Trainingsbereichs', frequency: 'täglich', points: 5 },
    { title: 'Handtuchvorrat prüfen', description: 'Bestandskontrolle und Nachbestellung bei Bedarf', frequency: 'täglich', points: 2 },
    { title: 'Maschinen checken', description: 'Alle Geräte auf Funktion und Sauberkeit prüfen', frequency: 'täglich', points: 5 },
    { title: 'Empfang aufräumen', description: 'Reinigung und Organisation des Eingangsbereichs', frequency: 'wöchentlich', points: 3 },
    { title: 'Notfallausrüstung prüfen', description: 'Erste-Hilfe-Kasten und Defibrillator kontrollieren', frequency: 'monatlich', points: 5 },
  ]

  const templateIds = []
  for (const t of taskTemplates) {
    const tid = await insertAndGetId(sql,
      `INSERT INTO task_templates (studio_id, title, description, frequency, points) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [studioId, t.title, t.description, t.frequency, t.points]
    )
    templateIds.push(tid)
  }

  // Task assignments (assign to employee if exists)
  if (employeeUserId) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    await sql.unsafe(`
      INSERT INTO task_assignments (studio_id, task_template_id, assigned_to_user_id, due_date, created_by)
      VALUES ('${studioId}', '${templateIds[0]}', '${employeeUserId}', '${tomorrow.toISOString().split('T')[0]}', '${adminUserId}')
    `)
    await sql.unsafe(`
      INSERT INTO task_assignments (studio_id, task_template_id, assigned_to_user_id, due_date, created_by)
      VALUES ('${studioId}', '${templateIds[1]}', '${employeeUserId}', '${tomorrow.toISOString().split('T')[0]}', '${adminUserId}')
    `)
    await sql.unsafe(`
      INSERT INTO task_assignments (studio_id, task_template_id, assigned_to_user_id, due_date, created_by)
      VALUES ('${studioId}', '${templateIds[4]}', '${employeeUserId}', '${nextWeek.toISOString().split('T')[0]}', '${adminUserId}')
    `)
  }

  console.log('  Studio data seeded.')
  console.log(`  - Categories: ${3 + 2}`)
  console.log(`  - Locations: 2`)
  console.log(`  - Suppliers: 1`)
  console.log(`  - Consumables: ${consumables.length}`)
  console.log(`  - Machines: ${machines.length}`)
  console.log(`  - Machine Events: 2`)
  console.log(`  - Task Templates: ${taskTemplates.length}`)
  console.log(`  - Task Assignments: ${employeeUserId ? 3 : 0}`)
}

async function insertAndGetId(sql, queryText, params) {
  const result = await sql.unsafe(queryText, params)
  return result[0].id
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const sql = postgres(process.env.DATABASE_URL)
  console.log('Creating E2E test data...')
  console.log(`API URL: ${BASE_URL}\n`)

  try {
    // 1. Clean
    await wipeTestData(sql)

    // 2. Create admin user via Better Auth API
    console.log('\nCreating admin user...')
    const adminResult = await signUpUser(TEST_USERS[0])
    const adminUserId = adminResult.user?.id
    console.log(`  Admin created: ${adminUserId}`)

    // 3. Create employee user via Better Auth API
    console.log('Creating employee user...')
    const employeeResult = await signUpUser(TEST_USERS[1])
    const employeeUserId = employeeResult.user?.id
    console.log(`  Employee created: ${employeeUserId}`)

    // 4. Create studio and link users
    await sql.unsafe(`SET search_path TO studio_manager, public`)

    // Create studio
    const studioResult = await sql.unsafe(`
      INSERT INTO studios (name, slug, address, email, is_active)
      VALUES ('Test Fitness Studio', 'test-fitness-studio', 'Musterstraße 42, 10115 Berlin', 'info@teststudio.de', true)
      RETURNING id
    `)
    const studioId = studioResult[0].id
    console.log(`\nStudio ID: ${studioId}`)

    // Insert admin into users table as studioleiter
    await sql.unsafe(`
      INSERT INTO users (id, studio_id, display_name, role, is_active)
      VALUES ('${adminUserId}', '${studioId}', 'Admin Test', 'studioleiter', true)
      ON CONFLICT (id) DO UPDATE SET studio_id = EXCLUDED.studio_id, role = EXCLUDED.role
    `)

    // Insert employee into users table
    await sql.unsafe(`
      INSERT INTO users (id, studio_id, display_name, role, is_active)
      VALUES ('${employeeUserId}', '${studioId}', 'Max Mitarbeiter', 'mitarbeiter', true)
      ON CONFLICT (id) DO UPDATE SET studio_id = EXCLUDED.studio_id, role = EXCLUDED.role
    `)

    // Create employee records
    await sql.unsafe(`
      INSERT INTO employees (studio_id, user_id, display_name, role, is_active)
      VALUES ('${studioId}', '${adminUserId}', 'Admin Test', 'studioleiter', true)
      ON CONFLICT (user_id) DO NOTHING
    `)
    await sql.unsafe(`
      INSERT INTO employees (studio_id, user_id, display_name, role, is_active)
      VALUES ('${studioId}', '${employeeUserId}', 'Max Mitarbeiter', 'mitarbeiter', true)
      ON CONFLICT (user_id) DO NOTHING
    `)

    // 6. Seed all studio data
    await seedStudioData(sql, studioId, adminUserId, employeeUserId)

    console.log('\n========================================')
    console.log('E2E TEST DATA CREATED SUCCESSFULLY')
    console.log('========================================')
    console.log('\nTest Accounts:')
    console.log('  Studioleiter:')
    console.log('    Email:    admin@teststudio.de')
    console.log('    Password: TestPass123!')
    console.log('  Mitarbeiter:')
    console.log('    Email:    mitarbeiter@teststudio.de')
    console.log('    Password: TestPass123!')
    console.log('')

  } catch (error) {
    console.error('\nFailed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

main()
