import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seedDatabase() {
    const sql = postgres(process.env.DATABASE_URL)

    try {
        console.log('🌱 Connecting to database...')

        await sql`SET search_path TO studio_manager, public`

        const seedPath = path.join(__dirname, '../database/seed.sql')
        const seedSQL = fs.readFileSync(seedPath, 'utf-8')

        await sql.unsafe(seedSQL)

        console.log('✅ Database seeded successfully!')

        const studios = await sql`SELECT COUNT(*) as count FROM studios`
        const users = await sql`SELECT COUNT(*) as count FROM users`
        const categories = await sql`SELECT COUNT(*) as count FROM categories`
        const locations = await sql`SELECT COUNT(*) as count FROM locations`
        const suppliers = await sql`SELECT COUNT(*) as count FROM suppliers`
        const consumables = await sql`SELECT COUNT(*) as count FROM consumables`
        const machines = await sql`SELECT COUNT(*) as count FROM machines`

        console.log('\n📊 Inserted data:')
        console.log(`   - Studios: ${studios[0].count}`)
        console.log(`   - Users: ${users[0].count}`)
        console.log(`   - Categories: ${categories[0].count}`)
        console.log(`   - Locations: ${locations[0].count}`)
        console.log(`   - Suppliers: ${suppliers[0].count}`)
        console.log(`   - Consumables: ${consumables[0].count}`)
        console.log(`   - Machines: ${machines[0].count}`)

    } catch (error) {
        console.error('❌ Database seed failed:', error.message)
        throw error
    } finally {
        await sql.end()
    }
}

seedDatabase()
    .then(() => {
        console.log('\n✨ Seed complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Seed failed:', error.message)
        process.exit(1)
    })
