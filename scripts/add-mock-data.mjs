/**
 * Idempotent bulk mock data generator for Studio Command Center.
 * Run with: node scripts/add-mock-data.mjs
 *
 * Safe to run multiple times — skips existing data, adds only new records.
 * Uses unique serial numbers for machines, unique emails for members,
 * and date-based dedup for class schedules, payments, expenses, etc.
 */

import postgres from 'postgres'
import { randomUUID } from 'crypto'

const sql = postgres(process.env.DATABASE_URL)

// ── Helpers ──────────────────────────────────────────────────────────
let _hashFn = null
async function hashPassword(pw) {
    if (!_hashFn) {
        try { const m = await import('better-auth/crypto'); _hashFn = m.hashPassword } catch (e) { _hashFn = null }
    }
    if (_hashFn) return await _hashFn(pw)
    // Fallback: use the same scrypt-based format Better Auth expects
    const crypto = await import('node:crypto')
    const salt = crypto.randomBytes(16).toString('base64')
    const key = crypto.scryptSync(pw, salt, 64)
    return `scrypt:${salt}:${key.toString('base64')}`
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randDecimal = (min, max) => (Math.random() * (max - min) + min).toFixed(2)
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
const formatDate = (d) => d.toISOString().split('T')[0]
const formatTimestamp = (d) => d.toISOString()

// ── Data pools ───────────────────────────────────────────────────────
const FIRST_NAMES = [
    'Anna','Benjamin','Clara','David','Elena','Felix','Greta','Henrik',
    'Isabella','Jan','Klara','Lukas','Marie','Niklas','Olivia','Paul',
    'Quirin','Rosa','Sebastian','Theresa','Ulrich','Vanessa','Werner',
    'Xenia','Yannick','Alina','Bruno','Charlotte','Daniel','Emilia',
    'Finn','Hannah','Jonas','Laura','Maximilian','Sophie','Tim','Hanna',
    'Julian','Katharina','Leon','Maria','Nils','Pia','Robert','Sarah',
    'Thomas','Viktoria','Alexander','Bettina','Christoph','Daniela',
    'Erik','Franziska','Georg','Helena','Ingo','Judith','Karl','Lena',
    'Martin','Nicole','Oliver','Petra','Ralf','Simone','Tobias','Ute',
    'Vincent','Waltraud','Andreas','Birgit','Christian','Diana','Edward',
    'Fatima','Günter','Heike','Irene','Jörg','Katrin','Ludwig','Monika',
    'Norbert','Patricia','Rainer','Sigrid','Ulrike','Volker','Wolfgang',
    'Anja','Bernd','Cordula','Dietmar','Elke','Frank','Gabi','Hans',
]

const LAST_NAMES = [
    'Becker','Braun','Fischer','Hoffmann','Klein','Koch','Meyer','Müller',
    'Richter','Schäfer','Schmidt','Schneider','Schulz','Wagner','Weber',
    'Wolf','Zimmermann','Bauer','Hartmann','Lange','König','Walter',
    'Peters','Maier','Huber','Lehmann','Schröder','Herrmann','Kraft',
    'Böhm','Vogt','Kühn','Scholz','Neumann','Fuchs','Lang','Seidel',
    'Horn','Braun','Lorenz','Baumann','Roth','Simon','Werner','Krause',
    'Möller','Hemm','Berg','Engel','Sauer','Krüger','Hansen','Jung',
    'Beck','Schubert','Held','Keller','Graf','Vogel','Berger','Fink',
]

const STREETS = ['Berliner Str.','Hauptstr.','Schillerstr.','Goethestr.','Mozartstr.',
    'Bahnhofstr.','Gartenstr.','Waldstr.','Marktplatz','Kirchstr.',
    'Lindenallee','Ringstr.','Parkstr.','Schulstr.','Tannenweg']
const CITIES = ['Berlin','Hamburg','München','Köln','Frankfurt','Stuttgart','Düsseldorf',
    'Leipzig','Dortmund','Essen','Bremen','Dresden','Hannover','Nürnberg']

const CATEGORIES = [
    { name: 'Getränke', description: 'Wasser, Säfte, Energy Drinks' },
    { name: 'Erste Hilfe', description: 'Pflaster, Verbände, Desinfektion' },
    { name: 'Fitnesszubehör', description: 'Matten, Bänder, Bälle' },
    { name: 'Reinigung', description: 'Putzmittel, Tücher, Desinfektionsmittel' },
    { name: 'Bürobedarf', description: 'Papier, Stifte, Druckerpatronen' },
]
const LOCATIONS = [
    { name: 'Kursraum A', description: 'Yoga und Pilates Raum' },
    { name: 'Kursraum B', description: 'HIIT und Zumba Raum' },
    { name: 'Outdoor Bereich', description: 'Training im Freien' },
    { name: 'Freihantelbereich', description: 'Bankdrücken, Kniebeugen' },
    { name: 'Cardio Zone', description: 'Laufbänder, Fahrräder, Crosstrainer' },
]
const SUPPLIERS = [
    { name: 'SportTec GmbH', contact: 'Markus Braun', email: 'braun@sporttec.de', phone: '+49 89 55512345' },
    { name: 'DrinkMaster AG', contact: 'Julia Fischer', email: 'fischer@drinkmaster.de', phone: '+49 40 66678901' },
    { name: 'GymEquip Direct', contact: 'Stefan Wolf', email: 'wolf@gymequip.de', phone: '+49 69 77723456' },
    { name: 'CleanPro Supplies', contact: 'Andrea Schulz', email: 'schulz@cleanpro.de', phone: '+49 211 987654' },
    { name: 'FitNutrition GmbH', contact: 'Thomas Koch', email: 'koch@fitnutrition.de', phone: '+49 711 345678' },
]

const CONSUMABLES = [
    { name: 'Wasserflaschen 0.5L', unit: 'Flasche', stock: 200, min: 100, cost: 0.45 },
    { name: 'Protein Shake Vanille', unit: 'Flasche', stock: 15, min: 20, cost: 3.50 },
    { name: 'Protein Shake Schoko', unit: 'Flasche', stock: 18, min: 20, cost: 3.50 },
    { name: 'Energy Bar Mix', unit: 'Stück', stock: 35, min: 20, cost: 2.20 },
    { name: 'Yogamatte Premium', unit: 'Stück', stock: 12, min: 8, cost: 25.00 },
    { name: 'Faszienball', unit: 'Stück', stock: 20, min: 10, cost: 8.50 },
    { name: 'Widerstandsbänder Set', unit: 'Set', stock: 6, min: 5, cost: 14.90 },
    { name: 'Pflaster Sortiment', unit: 'Packung', stock: 4, min: 3, cost: 6.80 },
    { name: 'Kühlspray Sport', unit: 'Dose', stock: 7, min: 5, cost: 9.90 },
    { name: 'Handdesinfektion 500ml', unit: 'Flasche', stock: 8, min: 6, cost: 5.40 },
    { name: 'Müllbeutel 60L', unit: 'Rolle', stock: 15, min: 10, cost: 3.20 },
    { name: 'Bodenreiniger Sport 10L', unit: 'Kanister', stock: 3, min: 4, cost: 22.50 },
    { name: 'Isotonisches Getränk', unit: 'Flasche', stock: 45, min: 30, cost: 1.20 },
    { name: 'Handschuhe Einweg', unit: 'Packung', stock: 10, min: 8, cost: 7.50 },
    { name: 'Sprayflasche Leer', unit: 'Stück', stock: 5, min: 3, cost: 2.80 },
    { name: 'Handtuch Rolle', unit: 'Stück', stock: 30, min: 15, cost: 4.90 },
    { name: 'BCAA Pulver', unit: 'Dose', stock: 8, min: 5, cost: 19.90 },
    { name: 'Gewichtsscheiben 2.5kg', unit: 'Paar', stock: 6, min: 4, cost: 35.00 },
    { name: 'Sprungseil Speed', unit: 'Stück', stock: 10, min: 5, cost: 12.50 },
    { name: 'Foam Roller', unit: 'Stück', stock: 8, min: 5, cost: 15.90 },
]

const MACHINES = [
    { name: 'Laufband Pro 5000', brand: 'Technogym', model: 'Run Personal', serial: 'TG-2024-L001', status: 'IN_SERVICE', cost: 5500 },
    { name: 'Crosstrainer Elite', brand: 'Life Fitness', model: 'Club Series', serial: 'LF-2024-C001', status: 'IN_SERVICE', cost: 4200 },
    { name: 'Ruderergometer RX800', brand: 'Concept2', model: 'RowErg D', serial: 'C2-2024-R001', status: 'IN_SERVICE', cost: 1800 },
    { name: 'Schrägbank Press', brand: 'Hammer Strength', model: 'ISP-ADJ', serial: 'HS-2024-005', status: 'IN_SERVICE', cost: 3200 },
    { name: 'Kabelzug Dual', brand: 'Technogym', model: 'Cable STD', serial: 'TG-2024-K001', status: 'IN_SERVICE', cost: 4500 },
    { name: 'Beincurl Maschine', brand: 'Life Fitness', model: 'Pro2 LCP', serial: 'LF-2024-BC01', status: 'IN_SERVICE', cost: 2900 },
    { name: 'Klimmzugstation', brand: 'Rogue', model: 'R-3CT', serial: 'RG-2024-P001', status: 'IN_SERVICE', cost: 1500 },
    { name: 'Spin Bike Pro', brand: 'Keiser', model: 'M3iX', serial: 'KS-2024-S001', status: 'MAINTENANCE', cost: 2800 },
    { name: 'Rückenstrecker', brand: 'Panatta', model: 'Back EXT', serial: 'PA-2024-RE01', status: 'IN_SERVICE', cost: 3100 },
    { name: 'Hantelbank Flat', brand: 'Rogue', model: 'AB-3', serial: 'RG-2024-B001', status: 'IN_SERVICE', cost: 800 },
    { name: 'Smith Machine', brand: 'Life Fitness', model: 'Signature SM', serial: 'LF-2024-SM01', status: 'OUT_OF_SERVICE', cost: 5200 },
    { name: 'Battle Rope Station', brand: 'Rogue', model: 'BR-50', serial: 'RG-2024-BR01', status: 'IN_SERVICE', cost: 350 },
    { name: 'TRX Suspension Frame', brand: 'TRX', model: 'S-frame', serial: 'TRX-2024-F001', status: 'IN_SERVICE', cost: 1200 },
    { name: 'Assault Air Bike', brand: 'Assault Fitness', model: 'Pro', serial: 'AF-2024-A001', status: 'IN_SERVICE', cost: 1600 },
    { name: 'Beinpresse 45°', brand: 'Hammer Strength', model: 'ISO-LP', serial: 'HS-2024-LP01', status: 'IN_SERVICE', cost: 4800 },
    { name: 'Latzug Maschine', brand: 'Technogym', model: 'Superior', serial: 'TG-2024-LT01', status: 'IN_SERVICE', cost: 3600 },
    { name: 'Laufband Pro 5000 #2', brand: 'Technogym', model: 'Run Personal', serial: 'TG-2024-L002', status: 'IN_SERVICE', cost: 5500 },
    { name: 'Crosstrainer Elite #2', brand: 'Life Fitness', model: 'Club Series', serial: 'LF-2024-C002', status: 'MAINTENANCE', cost: 4200 },
    { name: 'Ergometer Fahrrad', brand: 'Wattbike', model: 'Pro', serial: 'WB-2024-E001', status: 'IN_SERVICE', cost: 2900 },
    { name: 'Hackenschmidt Kniebeuge', brand: 'Panatta', model: 'Hack SQ', serial: 'PA-2024-HS01', status: 'IN_SERVICE', cost: 3900 },
]

const CLASS_TYPES = [
    { name: 'Yoga Flow', desc: 'Dynamische Yoga Stunde für alle Level', duration: 60, capacity: 20, color: '#8B5CF6' },
    { name: 'HIIT Burn', desc: 'High Intensity Interval Training', duration: 45, capacity: 25, color: '#EF4444' },
    { name: 'Spinning Power', desc: 'Intensives Indoor Cycling mit Musik', duration: 50, capacity: 15, color: '#F59E0B' },
    { name: 'Pilates Core', desc: 'Rumpfstabilisierung und Körperwahrnehmung', duration: 60, capacity: 18, color: '#10B981' },
    { name: 'Zumba Party', desc: 'Lateinamerikanische Rhythmen und Fitness', duration: 60, capacity: 30, color: '#EC4899' },
    { name: 'Functional Training', desc: 'Ganzkörpertraining mit funktionellen Übungen', duration: 45, capacity: 16, color: '#3B82F6' },
    { name: 'Aqua Fitness', desc: 'Gelenkschonendes Training im Wasser', duration: 45, capacity: 12, color: '#06B6D4' },
    { name: 'Boxing Basics', desc: 'Grundlagen des Boxsports für Einsteiger', duration: 60, capacity: 14, color: '#F97316' },
]

const TASK_TEMPLATES = [
    { title: 'Notfallausrüstung prüfen', desc: 'Erste-Hilfe-Kasten und Defibrillator kontrollieren', freq: 'wöchentlich', points: 5 },
    { title: 'Sauna reinigen', desc: 'Saunabereich reinigen und auffüllen', freq: 'täglich', points: 4 },
    { title: 'Getränkevitrine auffüllen', desc: 'Alle Getränke im Verkaufsautomaten ergänzen', freq: 'täglich', points: 2 },
    { title: 'Parkplatz Kontrolle', desc: 'Parkplätze auf Sauberkeit und Hindernisse prüfen', freq: 'täglich', points: 1 },
    { title: 'Feuerlöscher prüfen', desc: 'Alle Feuerlöscher auf Druck und Datum kontrollieren', freq: 'monatlich', points: 3 },
    { title: 'Kursraum Vorbereitung', desc: 'Mattensystem und Equipment für nächsten Kurs vorbereiten', freq: 'täglich', points: 3 },
    { title: 'Social Media Content', desc: 'Neue Beiträge für Instagram und Facebook erstellen', freq: 'wöchentlich', points: 5 },
    { title: 'Mitgliederfeedback sammeln', desc: 'Zufriedenheitsbefragung bei aktiven Mitgliedern', freq: 'monatlich', points: 4 },
    { title: 'Duschen reinigen', desc: 'Alle Duschen und Umkleidekabinen reinigen', freq: 'täglich', points: 2 },
    { title: 'Erste-Hilfe-Kurs auffrischen', desc: 'Zertifikate der Mitarbeiter auf Gültigkeit prüfen', freq: 'jährlich', points: 5 },
    { title: 'Lüftungsanlage prüfen', desc: 'Filter und Belüftungssystem inspizieren', freq: 'monatlich', points: 3 },
    { title: 'Empfangsbereich aufräumen', desc: 'Theke, Prospekte und Sitzbereich ordnen', freq: 'täglich', points: 1 },
]

const EXPENSES = [
    ...Array.from({length: 6}, (_, i) => ({ cat: 'RENT', desc: `Studiomiete ${['Januar','Februar','März','April','Mai','Juni'][i]}`, amount: 3500 })),
    { cat: 'EQUIPMENT', desc: 'Neue Hantelbank Rogue AB-3', amount: 800 },
    { cat: 'EQUIPMENT', desc: 'Reparatur Laufband 1 - Motor', amount: 650 },
    { cat: 'EQUIPMENT', desc: 'Neue Yogamatten Set (20 Stück)', amount: 480 },
    { cat: 'EQUIPMENT', desc: 'Klimmzugstation Wartung', amount: 220 },
    { cat: 'SUPPLIES', desc: 'Reinigungsmittel Großbestellung', amount: 320 },
    { cat: 'SUPPLIES', desc: 'Handtücher Nachbestellung 50 Stück', amount: 175 },
    { cat: 'SUPPLIES', desc: 'Büromaterial und Druckerpatronen', amount: 89 },
    { cat: 'SUPPLIES', desc: 'Desinfektionsmittel 25L Kanister', amount: 145 },
    ...Array.from({length: 6}, (_, i) => ({ cat: 'SALARY', desc: `Gehalt Mitarbeiter ${['Januar','Februar','März','April','Mai','Juni'][i]}`, amount: 2800 })),
    ...Array.from({length: 6}, (_, i) => ({ cat: 'SALARY', desc: `Minijob Trainer ${['Januar','Februar','März','April','Mai','Juni'][i]}`, amount: 450 })),
    { cat: 'MARKETING', desc: 'Instagram Werbekampagne Q1', amount: 590 },
    { cat: 'MARKETING', desc: 'Flyer und Plakate Druck', amount: 180 },
    { cat: 'MARKETING', desc: 'Google Ads Monatsbudget', amount: 300 },
    { cat: 'MARKETING', desc: 'Instagram Werbekampagne Q2', amount: 620 },
    { cat: 'INSURANCE', desc: 'Betriebshaftpflicht Quartal 1', amount: 420 },
    { cat: 'INSURANCE', desc: 'Betriebshaftpflicht Quartal 2', amount: 420 },
    ...Array.from({length: 6}, (_, i) => ({ cat: 'UTILITIES', desc: `Stromrechnung ${['Januar','Februar','März','April','Mai','Juni'][i]}`, amount: randInt(550, 750) })),
    ...Array.from({length: 6}, (_, i) => ({ cat: 'UTILITIES', desc: `Internet und Telefon ${['Januar','Februar','März','April','Mai','Juni'][i]}`, amount: 79.90 })),
    { cat: 'SOFTWARE', desc: 'Studio Command Center Professional', amount: 79 },
    { cat: 'SOFTWARE', desc: 'Spotify Business Abo', amount: 14.99 },
    { cat: 'SOFTWARE', desc: 'Buchhaltung Software', amount: 29.90 },
    { cat: 'OTHER', desc: 'Blumen und Deko Empfangsbereich', amount: 45 },
    { cat: 'OTHER', desc: 'Kaffee und Snacks für Team', amount: 62 },
    { cat: 'OTHER', desc: 'TÜV Prüfung Geräte', amount: 350 },
    { cat: 'OTHER', desc: 'Neonreparatur Kursraum B', amount: 280 },
    { cat: 'OTHER', desc: 'Weihnachtsfeier Team', amount: 450 },
]

async function main() {
    await sql.unsafe(`SET search_path TO studio_manager, public`)

    // ── Find studio ──────────────────────────────────────────────────
    const studios = await sql.unsafe(`SELECT id, name FROM studios WHERE is_active = true ORDER BY created_at ASC LIMIT 1`)
    if (!studios.length) { console.error('No active studio found.'); process.exit(1) }
    const studioId = studios[0].id
    console.log(`Studio: ${studios[0].name} (${studioId})`)

    const studioUsers = await sql.unsafe(`SELECT id, role FROM users WHERE studio_id = '${studioId}'`)
    const admin = studioUsers.find(u => u.role === 'studioleiter') || studioUsers[0]
    const employee = studioUsers.find(u => u.role === 'mitarbeiter')
    console.log(`Admin: ${admin.id} | Employee: ${employee?.id || 'none'}`)

    // ── Ensure team members (dedupe by email) ─────────────────────────
    console.log('\n--- Team Members ---')
    const TEAM_MEMBERS = [
        { name: 'Lena Trainer', email: 'lena@teststudio.de', role: 'mitarbeiter' },
        { name: 'Tom Fitness', email: 'tom@teststudio.de', role: 'mitarbeiter' },
        { name: 'Sarah Yoga', email: 'sarah@teststudio.de', role: 'mitarbeiter' },
        { name: 'Mike Boxing', email: 'mike@teststudio.de', role: 'mitarbeiter' },
        { name: 'Julia Pilates', email: 'julia@teststudio.de', role: 'mitarbeiter' },
        { name: 'Chris Cardio', email: 'chris@teststudio.de', role: 'mitarbeiter' },
    ]
    const allUserIds = [...studioUsers.map(u => u.id)]
    for (const tm of TEAM_MEMBERS) {
        const existing = await sql.unsafe(`SELECT id FROM "user" WHERE email = '${tm.email}'`)
        if (existing.length) { allUserIds.push(existing[0].id); continue }

        const userId = randomUUID()
        const accountId = randomUUID()
        const hashedPw = await hashPassword('TestPass123!')

        // Better Auth "user" table
        await sql.unsafe(`INSERT INTO "user" (id, name, email, "emailVerified", role, "studioId", banned, "createdAt", "updatedAt") VALUES ('${userId}', '${tm.name}', '${tm.email}', true, '${tm.role}', '${studioId}', false, NOW(), NOW())`)
        // Better Auth "account" table (credential provider)
        await sql.unsafe(`INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") VALUES ('${accountId}', '${tm.email}', 'credential', '${userId}', '${hashedPw}', NOW(), NOW())`)
        // Studio manager users table
        await sql.unsafe(`INSERT INTO users (id, studio_id, display_name, role, is_active) VALUES ('${userId}', '${studioId}', '${tm.name}', '${tm.role}', true)`)
        // Employees table
        await sql.unsafe(`INSERT INTO employees (studio_id, user_id, display_name, role, is_active) VALUES ('${studioId}', '${userId}', '${tm.name}', '${tm.role}', true)`)
        allUserIds.push(userId)
        console.log(`  + ${tm.name} (${tm.email})`)
    }
    console.log(`  Total team: ${allUserIds.length}`)

    // ── Ensure categories (idempotent via UNIQUE) ────────────────────
    console.log('\n--- Categories ---')
    const allCatIds = []
    for (const c of CATEGORIES) {
        const existing = await sql.unsafe(`SELECT id FROM categories WHERE studio_id = '${studioId}' AND name = '${c.name}'`)
        if (existing.length) { allCatIds.push(existing[0].id); continue }
        const r = await sql.unsafe(`INSERT INTO categories (studio_id, name, description) VALUES ('${studioId}', '${c.name}', '${c.description}') RETURNING id`)
        allCatIds.push(r[0].id)
        console.log(`  + ${c.name}`)
    }

    // ── Ensure locations ─────────────────────────────────────────────
    console.log('\n--- Locations ---')
    const allLocIds = []
    for (const l of LOCATIONS) {
        const existing = await sql.unsafe(`SELECT id FROM locations WHERE studio_id = '${studioId}' AND name = '${l.name}'`)
        if (existing.length) { allLocIds.push(existing[0].id); continue }
        const r = await sql.unsafe(`INSERT INTO locations (studio_id, name, description) VALUES ('${studioId}', '${l.name}', '${l.description}') RETURNING id`)
        allLocIds.push(r[0].id)
        console.log(`  + ${l.name}`)
    }

    // ── Ensure suppliers ─────────────────────────────────────────────
    console.log('\n--- Suppliers ---')
    const allSupIds = []
    for (const s of SUPPLIERS) {
        const existing = await sql.unsafe(`SELECT id FROM suppliers WHERE studio_id = '${studioId}' AND name = '${s.name}'`)
        if (existing.length) { allSupIds.push(existing[0].id); continue }
        const r = await sql.unsafe(`INSERT INTO suppliers (studio_id, name, contact_person, email, phone) VALUES ('${studioId}', '${s.name}', '${s.contact}', '${s.email}', '${s.phone}') RETURNING id`)
        allSupIds.push(r[0].id)
        console.log(`  + ${s.name}`)
    }

    // ── Consumables (dedupe by name) ─────────────────────────────────
    console.log('\n--- Consumables ---')
    let addedConsumables = 0
    for (const c of CONSUMABLES) {
        const existing = await sql.unsafe(`SELECT id FROM consumables WHERE studio_id = '${studioId}' AND name = '${c.name}'`)
        if (existing.length) continue
        const catId = pick(allCatIds)
        const locId = pick(allLocIds)
        const supId = Math.random() > 0.4 ? pick(allSupIds) : null
        await sql.unsafe(`INSERT INTO consumables (studio_id, name, category_id, location_id, supplier_id, unit, stock_current, stock_min, unit_cost) VALUES ('${studioId}', '${c.name}', '${catId}', '${locId}', ${supId ? `'${supId}'` : 'NULL'}, '${c.unit}', ${c.stock}, ${c.min}, ${c.cost})`)
        addedConsumables++
    }
    const totalConsumables = await sql.unsafe(`SELECT COUNT(*)::int as c FROM consumables WHERE studio_id = '${studioId}'`)
    console.log(`  Added ${addedConsumables} new | Total: ${totalConsumables[0].c}`)

    // ── Stock movements (always add — they accumulate) ───────────────
    console.log('\n--- Stock movements ---')
    const allConsumables = await sql.unsafe(`SELECT id, stock_current FROM consumables WHERE studio_id = '${studioId}'`)
    const movementTypes = ['IN', 'OUT', 'ADJUST', 'WASTE']
    let movementCount = 0
    for (const con of allConsumables) {
        const currentStock = Number(con.stock_current) || 0
        const numMovements = randInt(2, 5)
        for (let i = 0; i < numMovements; i++) {
            const type = pick(movementTypes)
            const qty = randInt(1, 20)
            const beforeStock = Math.max(0, currentStock + randInt(-10, 10))
            let afterStock = beforeStock
            if (type === 'IN') afterStock = beforeStock + qty
            else if (type === 'OUT') afterStock = Math.max(0, beforeStock - qty)
            else if (type === 'WASTE') afterStock = Math.max(0, beforeStock - randInt(1, 5))
            else afterStock = Math.max(0, beforeStock + randInt(-3, 3))
            const reasons = { 'IN': ['Nachlieferung','Nachbestellung','Inventur Nachtrag'], 'OUT': ['Entnahme','Täglicher Verbrauch','Gruppenkurs'], 'ADJUST': ['Inventur Korrektur','Systemkorrektur'], 'WASTE': ['Verfall','Beschädigung','Verschüttet'] }
            await sql.unsafe(`INSERT INTO consumable_movements (studio_id, consumable_id, type, quantity, stock_before, stock_after, reason, created_by, created_at) VALUES ('${studioId}', '${con.id}', '${type}', ${qty}, ${beforeStock}, ${afterStock}, '${pick(reasons[type])}', '${admin.id}', '${formatTimestamp(daysAgo(randInt(1, 30)))}')`)
            movementCount++
        }
    }
    console.log(`  + ${movementCount} movements`)

    // ── Machines (dedupe by serial_no) ───────────────────────────────
    console.log('\n--- Machines ---')
    const machineCatIds = (await sql.unsafe(`SELECT id FROM machine_categories WHERE studio_id = '${studioId}'`)).map(m => m.id)
    let addedMachines = 0
    for (const m of MACHINES) {
        const existing = await sql.unsafe(`SELECT id FROM machines WHERE studio_id = '${studioId}' AND serial_no = '${m.serial}'`)
        if (existing.length) continue
        await sql.unsafe(`INSERT INTO machines (studio_id, name, category_id, location_id, brand, model, serial_no, status, purchase_cost, purchased_on, last_service_on, next_service_on) VALUES ('${studioId}', '${m.name}', '${pick(machineCatIds)}', '${pick(allLocIds)}', '${m.brand}', '${m.model}', '${m.serial}', '${m.status}', ${m.cost}, '${formatDate(daysAgo(randInt(200, 700)))}', '${formatDate(daysAgo(randInt(30, 90)))}', '${formatDate(daysFromNow(randInt(30, 180)))}')`)
        addedMachines++
    }
    const totalMachines = await sql.unsafe(`SELECT COUNT(*)::int as c FROM machines WHERE studio_id = '${studioId}'`)
    console.log(`  Added ${addedMachines} new | Total: ${totalMachines[0].c}`)

    // ── Machine events (always add) ──────────────────────────────────
    console.log('\n--- Machine events ---')
    const allMachineIds = await sql.unsafe(`SELECT id FROM machines WHERE studio_id = '${studioId}'`)
    const eventDescs = { 'MAINTENANCE': ['Jährliche Inspektion','Schmiermittel gewechselt','Riemen gespannt','Display Kalibrierung'], 'INCIDENT': ['Seltsame Geräusche','Display flackert','Riemen rutscht','Polster gerissen','Kabelbruch'], 'INSPECTION': ['TÜV bestanden','Sicherheitsprüfung','DGUV Prüfung'] }
    let eventCount = 0
    for (const mId of allMachineIds) {
        for (let i = 0; i < randInt(1, 3); i++) {
            const type = pick(['MAINTENANCE','INCIDENT','INSPECTION'])
            const status = Math.random() > 0.3 ? 'CLOSED' : 'OPEN'
            const cost = type === 'MAINTENANCE' ? randDecimal(50, 400) : type === 'INCIDENT' ? randDecimal(0, 800) : randDecimal(20, 150)
            await sql.unsafe(`INSERT INTO machine_events (studio_id, machine_id, type, status, description, cost, downtime_minutes, resolved_at, created_by, created_at, updated_at) VALUES ('${studioId}', '${mId.id}', '${type}', '${status}', '${pick(eventDescs[type])}', ${cost}, ${randInt(0, 480)}, ${status === 'CLOSED' ? `'${formatTimestamp(daysAgo(randInt(5, 60)))}'` : 'NULL'}, '${pick([admin.id, employee?.id || admin.id])}', '${formatTimestamp(daysAgo(randInt(5, 120)))}', '${formatTimestamp(daysAgo(randInt(0, 10)))}')`)
            eventCount++
        }
    }
    console.log(`  + ${eventCount} events`)

    // ── Members (100 total, dedupe by email) ─────────────────────────
    console.log('\n--- Members ---')
    const TARGET_MEMBERS = 100
    const allExistingMembers = await sql.unsafe(`SELECT id, email FROM members WHERE studio_id = '${studioId}'`)
    const existingEmails = new Set(allExistingMembers.map(m => m.email))
    const memberIds = allExistingMembers.map(m => m.id)
    let addedMembers = 0

    // Generate unique combos: use index to create unique email
    let idx = 0
    while (memberIds.length < TARGET_MEMBERS) {
        const fn = FIRST_NAMES[idx % FIRST_NAMES.length]
        const ln = LAST_NAMES[Math.floor(idx / FIRST_NAMES.length) % LAST_NAMES.length]
        const baseEmail = `${fn.toLowerCase()}.${ln.toLowerCase()}@email.de`
        // If this email already exists in DB, skip
        if (existingEmails.has(baseEmail)) { idx++; continue }
        // Make email unique if needed by appending number
        let email = baseEmail
        let suffix = 2
        while (existingEmails.has(email)) {
            email = `${fn.toLowerCase()}.${ln.toLowerCase()}${suffix}@email.de`
            suffix++
        }
        idx++

        const phone = `+49 ${randInt(150, 179)} ${randInt(1000000, 9999999)}`
        const dob = `${randInt(1965, 2005)}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`
        const address = `${pick(STREETS)} ${randInt(1, 150)}, ${randInt(10000, 99999)} ${pick(CITIES)}`

        try {
            const res = await sql.unsafe(`INSERT INTO members (studio_id, first_name, last_name, email, phone, date_of_birth, address, is_active) VALUES ('${studioId}', '${fn}', '${ln}', '${email}', '${phone}', '${dob}', '${address}', true) RETURNING id`)
            memberIds.push(res[0].id)
            existingEmails.add(email)
            addedMembers++
        } catch (e) {
            // skip on duplicate
        }
    }
    console.log(`  Added ${addedMembers} new | Total: ${memberIds.length}`)

    // ── Contracts (2-3 per member, dedupe) ───────────────────────────
    console.log('\n--- Contracts ---')
    const contractTypes = ['MONTHLY','QUARTERLY','YEARLY','DAY_PASS','TRIAL']
    const contractPrices = { MONTHLY: [29.90, 39.90, 49.90, 59.90, 69.90], QUARTERLY: [79.90, 99.90, 129.90], YEARLY: [299, 399, 499, 599], DAY_PASS: [10, 15], TRIAL: [0] }
    let addedContracts = 0
    for (const mId of memberIds) {
        // Check if member already has contracts
        const existingContracts = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM contracts WHERE studio_id = '${studioId}' AND member_id = '${mId}'`))[0].c
        if (existingContracts >= 1) continue // already has contracts

        const numContracts = randInt(1, 2)
        for (let i = 0; i < numContracts; i++) {
            const type = i === 0 ? pick(['MONTHLY','YEARLY','QUARTERLY']) : pick(contractTypes)
            const price = pick(contractPrices[type])
            const daysBackStart = randInt(0, 365)
            const startDate = daysAgo(daysBackStart)
            let endDate = null, status = 'ACTIVE'

            if (type === 'MONTHLY') endDate = daysFromNow(30 - (daysBackStart % 30))
            else if (type === 'QUARTERLY') endDate = daysFromNow(90 - (daysBackStart % 90))
            else if (type === 'YEARLY') endDate = daysFromNow(365 - (daysBackStart % 365))
            else if (type === 'DAY_PASS') { endDate = startDate; status = 'EXPIRED' }
            else if (type === 'TRIAL') { endDate = daysFromNow(14 - (daysBackStart % 14)); if (daysBackStart > 14) status = pick(['EXPIRED','CANCELLED']) }
            if (daysBackStart > 180 && Math.random() > 0.5) status = pick(['EXPIRED','CANCELLED'])
            if (status === 'EXPIRED' && endDate > new Date()) endDate = daysAgo(5)
            if (status === 'CANCELLED') endDate = daysAgo(randInt(5, 30))

            try {
                await sql.unsafe(`INSERT INTO contracts (studio_id, member_id, type, status, start_date, end_date, price_monthly, created_by) VALUES ('${studioId}', '${mId}', '${type}', '${status}', '${formatDate(startDate)}', ${endDate ? `'${formatDate(endDate)}'` : 'NULL'}, ${price}, '${admin.id}')`)
                addedContracts++
            } catch (e) { /* skip */ }
        }
    }
    const totalContracts = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM contracts WHERE studio_id = '${studioId}'`))[0].c
    console.log(`  Added ${addedContracts} new | Total: ${totalContracts}`)

    // ── Check-ins (always add for active members) ────────────────────
    console.log('\n--- Check-ins ---')
    const activeMembers = await sql.unsafe(`SELECT id FROM members WHERE studio_id = '${studioId}' AND is_active = true`)
    let checkInCount = 0
    for (const member of activeMembers) {
        const numVisits = randInt(2, 12)
        for (let i = 0; i < numVisits; i++) {
            const daysBack = randInt(1, 30)
            const hour = randInt(6, 21)
            const minute = randInt(0, 59)
            const checkInTime = new Date(daysAgo(daysBack)); checkInTime.setHours(hour, minute, 0, 0)
            const checkOutTime = new Date(checkInTime.getTime() + randInt(30, 120) * 60000)
            const checkOut = checkOutTime < new Date() ? `'${formatTimestamp(checkOutTime)}'` : 'NULL'
            await sql.unsafe(`INSERT INTO check_ins (studio_id, member_id, check_in_at, check_out_at) VALUES ('${studioId}', '${member.id}', '${formatTimestamp(checkInTime)}', ${checkOut})`)
            checkInCount++
        }
    }
    console.log(`  + ${checkInCount} check-ins`)

    // ── Class types (dedupe by name) ─────────────────────────────────
    console.log('\n--- Class types ---')
    const classTypeIds = []
    for (const ct of CLASS_TYPES) {
        const existing = await sql.unsafe(`SELECT id FROM class_types WHERE studio_id = '${studioId}' AND name = '${ct.name}'`)
        if (existing.length) { classTypeIds.push(existing[0].id); continue }
        const r = await sql.unsafe(`INSERT INTO class_types (studio_id, name, description, duration_minutes, max_capacity, color) VALUES ('${studioId}', '${ct.name}', '${ct.desc}', ${ct.duration}, ${ct.capacity}, '${ct.color}') RETURNING id`)
        classTypeIds.push(r[0].id)
        console.log(`  + ${ct.name}`)
    }
    console.log(`  Total: ${classTypeIds.length}`)

    // ── Class schedules (next 14 days, dedupe by type+trainer+start) ─
    console.log('\n--- Class schedules ---')
    const trainerIds = (await sql.unsafe(`SELECT id FROM employees WHERE studio_id = '${studioId}'`)).map(e => e.id)
    let scheduleCount = 0
    const weekSchedule = {
        1: [{ ti: 0, h: 8 }, { ti: 1, h: 10 }, { ti: 4, h: 18 }],
        2: [{ ti: 5, h: 7 }, { ti: 2, h: 9 }, { ti: 3, h: 17 }, { ti: 7, h: 19 }],
        3: [{ ti: 0, h: 8 }, { ti: 1, h: 12 }, { ti: 6, h: 18 }],
        4: [{ ti: 5, h: 7 }, { ti: 2, h: 10 }, { ti: 4, h: 18 }, { ti: 7, h: 19 }],
        5: [{ ti: 0, h: 9 }, { ti: 1, h: 11 }, { ti: 3, h: 16 }],
        6: [{ ti: 0, h: 9 }, { ti: 2, h: 11 }, { ti: 5, h: 14 }],
    }

    for (let day = 0; day < 14; day++) {
        const classDate = daysFromNow(day)
        const dow = classDate.getDay()
        const daily = weekSchedule[dow] || []
        for (const cls of daily) {
            if (cls.ti >= classTypeIds.length) continue
            const typeId = classTypeIds[cls.ti]
            const trainer = pick(trainerIds)
            const startTime = new Date(classDate); startTime.setHours(cls.h, 0, 0, 0)
            const duration = CLASS_TYPES[cls.ti].duration
            const endTime = new Date(startTime.getTime() + duration * 60000)
            const locId = pick(allLocIds)
            const capacity = CLASS_TYPES[cls.ti].capacity
            const bookings = randInt(0, Math.floor(capacity * 0.8))

            // Dedupe: check if this exact schedule already exists
            const existing = await sql.unsafe(`SELECT id FROM class_schedule WHERE studio_id = '${studioId}' AND class_type_id = '${typeId}' AND trainer_id = '${trainer}' AND start_time = '${formatTimestamp(startTime)}'`)
            if (existing.length) continue

            await sql.unsafe(`INSERT INTO class_schedule (studio_id, class_type_id, trainer_id, location_id, start_time, end_time, max_capacity, current_bookings, created_by) VALUES ('${studioId}', '${typeId}', '${trainer}', '${locId}', '${formatTimestamp(startTime)}', '${formatTimestamp(endTime)}', ${capacity}, ${bookings}, '${admin.id}')`)
            scheduleCount++
        }
    }
    const totalSchedules = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM class_schedule WHERE studio_id = '${studioId}'`))[0].c
    console.log(`  Added ${scheduleCount} new | Total: ${totalSchedules}`)

    // ── Class bookings (for existing schedules) ──────────────────────
    console.log('\n--- Class bookings ---')
    const allSchedules = await sql.unsafe(`SELECT id, max_capacity FROM class_schedule WHERE studio_id = '${studioId}'`)
    let bookingCount = 0
    for (const sched of allSchedules) {
        const existingBookings = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM class_bookings WHERE studio_id = '${studioId}' AND class_schedule_id = '${sched.id}'`))[0].c
        if (existingBookings > 0) continue // already has bookings
        const numBookings = Math.min(randInt(2, sched.max_capacity), memberIds.length)
        const shuffled = [...memberIds].sort(() => Math.random() - 0.5)
        for (let i = 0; i < numBookings; i++) {
            try {
                await sql.unsafe(`INSERT INTO class_bookings (studio_id, class_schedule_id, member_id, status, booked_at) VALUES ('${studioId}', '${sched.id}', '${shuffled[i]}', '${pick(['confirmed','confirmed','confirmed','noshow'])}', '${formatTimestamp(daysAgo(randInt(0, 7)))}')`)
                bookingCount++
            } catch (e) { /* skip */ }
        }
    }
    console.log(`  + ${bookingCount} bookings`)

    // ── Payments (12 months for active contracts, dedupe by invoice) ──
    console.log('\n--- Payments ---')
    const activeContracts = await sql.unsafe(`SELECT id, member_id, price_monthly FROM contracts WHERE studio_id = '${studioId}' AND status = 'ACTIVE'`)
    const paymentMethods = ['SEPA','PAYPAL','CASH','CARD','TRANSFER']
    let paymentCount = 0
    for (const contract of activeContracts) {
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const dueDate = new Date(); dueDate.setMonth(dueDate.getMonth() - monthOffset); dueDate.setDate(1)
            const invoice = `RE-${dueDate.getFullYear()}${String(dueDate.getMonth()+1).padStart(2,'0')}-${contract.id.toString().slice(0, 8)}`

            // Dedupe by invoice number
            const existing = await sql.unsafe(`SELECT id FROM payments WHERE studio_id = '${studioId}' AND invoice_number = '${invoice}'`)
            if (existing.length) continue

            const status = monthOffset === 0 && Math.random() > 0.7 ? 'PENDING' : monthOffset === 0 && Math.random() > 0.8 ? 'OVERDUE' : 'PAID'
            const paidAt = status === 'PAID' ? `'${formatTimestamp(new Date(dueDate.getTime() + randInt(0, 10) * 86400000))}'` : 'NULL'
            const method = pick(paymentMethods)

            await sql.unsafe(`INSERT INTO payments (studio_id, member_id, contract_id, amount, method, status, due_date, paid_at, invoice_number, created_by) VALUES ('${studioId}', '${contract.member_id}', '${contract.id}', ${contract.price_monthly}, '${method}', '${status}', '${formatDate(dueDate)}', ${paidAt}, '${invoice}', '${admin.id}')`)
            paymentCount++
        }
    }
    const totalPayments = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM payments WHERE studio_id = '${studioId}'`))[0].c
    console.log(`  Added ${paymentCount} new | Total: ${totalPayments}`)

    // ── Expenses (dedupe by description+amount+category) ─────────────
    console.log('\n--- Expenses ---')
    let addedExpenses = 0
    for (const exp of EXPENSES) {
        const existing = await sql.unsafe(`SELECT id FROM expenses WHERE studio_id = '${studioId}' AND description = '${exp.desc}' AND category = '${exp.cat}' AND amount = ${exp.amount}`)
        if (existing.length) continue
        const daysBack = randInt(1, 180)
        await sql.unsafe(`INSERT INTO expenses (studio_id, category, amount, description, expense_date, supplier_id, created_by) VALUES ('${studioId}', '${exp.cat}', ${exp.amount}, '${exp.desc}', '${formatDate(daysAgo(daysBack))}', ${Math.random() > 0.5 ? `'${pick(allSupIds)}'` : 'NULL'}, '${admin.id}')`)
        addedExpenses++
    }
    const totalExpenses = (await sql.unsafe(`SELECT COUNT(*)::int as c FROM expenses WHERE studio_id = '${studioId}'`))[0].c
    console.log(`  Added ${addedExpenses} new | Total: ${totalExpenses}`)

    // ── Task templates (dedupe by title) ─────────────────────────────
    console.log('\n--- Task templates ---')
    const taskTemplateIds = []
    for (const t of TASK_TEMPLATES) {
        const existing = await sql.unsafe(`SELECT id FROM task_templates WHERE studio_id = '${studioId}' AND title = '${t.title}'`)
        if (existing.length) { taskTemplateIds.push(existing[0].id); continue }
        const r = await sql.unsafe(`INSERT INTO task_templates (studio_id, title, description, frequency, points) VALUES ('${studioId}', '${t.title}', '${t.desc}', '${t.freq}', ${t.points}) RETURNING id`)
        taskTemplateIds.push(r[0].id)
        console.log(`  + ${t.title}`)
    }

    // ── Task assignments (dedupe by template+assignee+due) ───────────
    console.log('\n--- Task assignments ---')
    const assigneeIds = [admin.id, employee?.id || admin.id]
    let assignmentCount = 0
    for (const templateId of taskTemplateIds) {
        for (let i = 0; i < randInt(1, 3); i++) {
            const assignee = pick(assigneeIds)
            const dueDate = daysFromNow(randInt(0, 14))
            const existing = await sql.unsafe(`SELECT id FROM task_assignments WHERE studio_id = '${studioId}' AND task_template_id = '${templateId}' AND assigned_to_user_id = '${assignee}' AND due_date = '${formatDate(dueDate)}'`)
            if (existing.length) continue
            await sql.unsafe(`INSERT INTO task_assignments (studio_id, task_template_id, assigned_to_user_id, due_date, created_by) VALUES ('${studioId}', '${templateId}', '${assignee}', '${formatDate(dueDate)}', '${admin.id}')`)
            assignmentCount++
        }
    }
    console.log(`  + ${assignmentCount} assignments`)

    // ── Task completions (always add — historical) ───────────────────
    console.log('\n--- Task completions ---')
    const allTemplates = await sql.unsafe(`SELECT id, points FROM task_templates WHERE studio_id = '${studioId}'`)
    let completionCount = 0
    for (const tpl of allTemplates) {
        for (let i = 0; i < randInt(3, 8); i++) {
            const completedBy = pick(assigneeIds)
            await sql.unsafe(`INSERT INTO task_completions (studio_id, task_template_id, completed_by_user_id, completed_at, notes, points_awarded) VALUES ('${studioId}', '${tpl.id}', '${completedBy}', '${formatTimestamp(daysAgo(randInt(1, 30)))}', '${pick(['Erledigt','Ohne Probleme','Pünktlich','Extra gründlich',''])}', ${tpl.points})`)
            completionCount++
        }
    }
    console.log(`  + ${completionCount} completions`)

    // ── Summary ──────────────────────────────────────────────────────
    console.log('\n========================================')
    console.log('MOCK DATA COMPLETE')
    console.log('========================================')
    const counts = await sql.unsafe(`SELECT (SELECT COUNT(*) FROM members WHERE studio_id = '${studioId}') as members, (SELECT COUNT(*) FROM contracts WHERE studio_id = '${studioId}') as contracts, (SELECT COUNT(*) FROM check_ins WHERE studio_id = '${studioId}') as check_ins, (SELECT COUNT(*) FROM consumables WHERE studio_id = '${studioId}') as consumables, (SELECT COUNT(*) FROM machines WHERE studio_id = '${studioId}') as machines, (SELECT COUNT(*) FROM machine_events WHERE studio_id = '${studioId}') as machine_events, (SELECT COUNT(*) FROM class_types WHERE studio_id = '${studioId}') as class_types, (SELECT COUNT(*) FROM class_schedule WHERE studio_id = '${studioId}') as class_schedules, (SELECT COUNT(*) FROM payments WHERE studio_id = '${studioId}') as payments, (SELECT COUNT(*) FROM expenses WHERE studio_id = '${studioId}') as expenses, (SELECT COUNT(*) FROM task_templates WHERE studio_id = '${studioId}') as task_templates, (SELECT COUNT(*) FROM task_assignments WHERE studio_id = '${studioId}') as task_assignments, (SELECT COUNT(*) FROM task_completions WHERE studio_id = '${studioId}') as task_completions, (SELECT COUNT(*) FROM consumable_movements WHERE studio_id = '${studioId}') as consumable_movements, (SELECT COUNT(*) FROM class_bookings WHERE studio_id = '${studioId}') as class_bookings`)
    console.log('\nTotals:')
    for (const [key, val] of Object.entries(counts[0])) console.log(`  ${key}: ${val}`)

    await sql.end()
}

main().catch(e => { console.error('Failed:', e); process.exit(1) })
