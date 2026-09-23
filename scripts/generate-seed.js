import { randomUUID } from 'crypto'

const studios = [
    { id: randomUUID(), name: 'FitZone Downtown', address: 'Hauptstraße 123, 10115 Berlin' },
    { id: randomUUID(), name: 'PowerGym Nord', address: 'Nordring 45, 20095 Hamburg' }
]

const users = [
    { id: randomUUID(), stack_user_id: 'stack_user_1', studio_id: studios[0].id, email: 'max.mueller@fitzone.de', display_name: 'Max Müller', role: 'studioleiter' },
    { id: randomUUID(), stack_user_id: 'stack_user_2', studio_id: studios[0].id, email: 'anna.schmidt@fitzone.de', display_name: 'Anna Schmidt', role: 'mitarbeiter' },
    { id: randomUUID(), stack_user_id: 'stack_user_3', studio_id: studios[1].id, email: 'tom.weber@powergym.de', display_name: 'Tom Weber', role: 'studioleiter' }
]

const employees = [
    { id: randomUUID(), studio_id: studios[0].id, user_id: users[0].id, display_name: 'Max Müller', role: 'studioleiter' },
    { id: randomUUID(), studio_id: studios[0].id, user_id: users[1].id, display_name: 'Anna Schmidt', role: 'mitarbeiter' },
    { id: randomUUID(), studio_id: studios[1].id, user_id: users[2].id, display_name: 'Tom Weber', role: 'studioleiter' }
]

const categories = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'Reinigung', description: 'Reinigungsmittel und Zubehör' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Hygiene', description: 'Handtücher, Seife, Desinfektionsmittel' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Büro', description: 'Büromaterial und Verbrauchsgüter' },
    { id: randomUUID(), studio_id: studios[1].id, name: 'Reinigung', description: 'Reinigungsmittel' },
    { id: randomUUID(), studio_id: studios[1].id, name: 'Hygiene', description: 'Hygieneartikel' }
]

const locations = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'Lager Hauptgebäude', description: 'Zentrales Lager im Keller' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Empfang', description: 'Lagerraum am Empfang' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Umkleiden', description: 'Lagerraum Damenumkleide' },
    { id: randomUUID(), studio_id: studios[1].id, name: 'Lager', description: 'Hauptlager' }
]

const suppliers = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'CleanSupply GmbH', contact_person: 'Peter Hansen', email: 'hansen@cleansupply.de', phone: '+49 30 12345678' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'HygieneProfi Berlin', contact_person: 'Sarah Klein', email: 'klein@hygieneprofi.de', phone: '+49 30 87654321' }
]

const consumables = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'Allzweckreiniger 5L', category_id: categories[0].id, location_id: locations[0].id, supplier_id: suppliers[0].id, unit: 'Flasche', stock_current: 8, stock_min: 5, unit_cost: 12.50 },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Desinfektionsmittel 1L', category_id: categories[1].id, location_id: locations[1].id, supplier_id: suppliers[1].id, unit: 'Flasche', stock_current: 3, stock_min: 10, unit_cost: 8.90 },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Handtücher weiß', category_id: categories[1].id, location_id: locations[2].id, supplier_id: suppliers[1].id, unit: 'Stück', stock_current: 45, stock_min: 30, unit_cost: 2.50 },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Kopierpapier A4', category_id: categories[2].id, location_id: locations[1].id, supplier_id: null, unit: 'Paket', stock_current: 12, stock_min: 5, unit_cost: 4.20 },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Glasreiniger Spray', category_id: categories[0].id, location_id: locations[0].id, supplier_id: suppliers[0].id, unit: 'Flasche', stock_current: 6, stock_min: 8, unit_cost: 3.75 }
]

const machine_categories = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'Cardio', description: 'Ausdauergeräte' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Kraft', description: 'Kraftgeräte' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Freie Gewichte', description: 'Hanteln und Racks' },
    { id: randomUUID(), studio_id: studios[1].id, name: 'Cardio', description: 'Ausdauergeräte' }
]

const machines = [
    { id: randomUUID(), studio_id: studios[0].id, name: 'Laufband 1', category_id: machine_categories[0].id, location_id: locations[0].id, brand: 'TechnoGym', model: 'Run500', serial_no: 'TG-RUN-2023-001', purchased_on: '2023-01-15', purchase_cost: 3500.00, status: 'IN_SERVICE', last_service_on: '2024-06-01', next_service_on: '2025-06-01' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Laufband 2', category_id: machine_categories[0].id, location_id: locations[0].id, brand: 'TechnoGym', model: 'Run500', serial_no: 'TG-RUN-2023-002', purchased_on: '2023-01-15', purchase_cost: 3500.00, status: 'OUT_OF_SERVICE', last_service_on: '2024-06-01', next_service_on: '2025-06-01' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Brustpresse', category_id: machine_categories[1].id, location_id: locations[0].id, brand: 'Life Fitness', model: 'Signature Series', serial_no: 'LF-CHEST-2022-005', purchased_on: '2022-06-20', purchase_cost: 2800.00, status: 'IN_SERVICE', last_service_on: '2024-07-15', next_service_on: '2025-01-15' },
    { id: randomUUID(), studio_id: studios[0].id, name: 'Crosstrainer Elite', category_id: machine_categories[0].id, location_id: locations[0].id, brand: 'Matrix', model: 'E50', serial_no: 'MTX-E50-2023-012', purchased_on: '2023-03-10', purchase_cost: 4200.00, status: 'MAINTENANCE', last_service_on: '2024-09-20', next_service_on: '2025-03-20' }
]

const task_templates = [
    { id: randomUUID(), studio_id: studios[0].id, title: 'Umkleiden reinigen', description: 'Umkleiden komplett reinigen und desinfizieren', frequency: 'täglich', points: 3 },
    { id: randomUUID(), studio_id: studios[0].id, title: 'Geräte abwischen', description: 'Alle Cardio und Kraftgeräte abwischen', frequency: 'täglich', points: 5 },
    { id: randomUUID(), studio_id: studios[0].id, title: 'Handtücher auffüllen', description: 'Handtücher in allen Bereichen auffüllen', frequency: 'täglich', points: 2 },
    { id: randomUUID(), studio_id: studios[0].id, title: 'Kassensturz', description: 'Tagesabrechnung durchführen', frequency: 'täglich', points: 4 },
    { id: randomUUID(), studio_id: studios[0].id, title: 'Lüftungsanlage prüfen', description: 'Lüftungsanlage auf Funktion prüfen', frequency: 'wöchentlich', points: 3 },
    { id: randomUUID(), studio_id: studios[1].id, title: 'Empfang öffnen', description: 'Empfang öffnen und System hochfahren', frequency: 'täglich', points: 2 }
]

let sql = `-- Seed Daten für Studio Management Plattform

-- Studios
INSERT INTO studios (id, name, address) VALUES
${studios.map(s => `('${s.id}', '${s.name}', '${s.address}')`).join(',\n')};

-- Users (Stack Auth IDs müssen später durch echte ersetzt werden)
INSERT INTO users (id, stack_user_id, studio_id, email, display_name, role) VALUES
${users.map(u => `('${u.id}', '${u.stack_user_id}', '${u.studio_id}', '${u.email}', '${u.display_name}', '${u.role}')`).join(',\n')};

-- Employees (verknüpft mit users)
INSERT INTO employees (id, studio_id, user_id, display_name, role) VALUES
${employees.map(e => `('${e.id}', '${e.studio_id}', '${e.user_id}', '${e.display_name}', '${e.role}')`).join(',\n')};

-- Categories
INSERT INTO categories (id, studio_id, name, description) VALUES
${categories.map(c => `('${c.id}', '${c.studio_id}', '${c.name}', '${c.description}')`).join(',\n')};

-- Locations
INSERT INTO locations (id, studio_id, name, description) VALUES
${locations.map(l => `('${l.id}', '${l.studio_id}', '${l.name}', '${l.description}')`).join(',\n')};

-- Suppliers
INSERT INTO suppliers (id, studio_id, name, contact_person, email, phone) VALUES
${suppliers.map(s => `('${s.id}', '${s.studio_id}', '${s.name}', '${s.contact_person}', '${s.email}', '${s.phone}')`).join(',\n')};

-- Consumables
INSERT INTO consumables (id, studio_id, name, category_id, location_id, supplier_id, unit, stock_current, stock_min, unit_cost) VALUES
${consumables.map(c => `('${c.id}', '${c.studio_id}', '${c.name}', '${c.category_id}', '${c.location_id}', ${c.supplier_id ? `'${c.supplier_id}'` : 'NULL'}, '${c.unit}', ${c.stock_current}, ${c.stock_min}, ${c.unit_cost})`).join(',\n')};

-- Machine Categories
INSERT INTO machine_categories (id, studio_id, name, description) VALUES
${machine_categories.map(mc => `('${mc.id}', '${mc.studio_id}', '${mc.name}', '${mc.description}')`).join(',\n')};

-- Machines
INSERT INTO machines (id, studio_id, name, category_id, location_id, brand, model, serial_no, purchased_on, purchase_cost, status, last_service_on, next_service_on) VALUES
${machines.map(m => `('${m.id}', '${m.studio_id}', '${m.name}', '${m.category_id}', '${m.location_id}', '${m.brand}', '${m.model}', '${m.serial_no}', '${m.purchased_on}', ${m.purchase_cost}, '${m.status}', '${m.last_service_on}', '${m.next_service_on}')`).join(',\n')};

-- Task Templates
INSERT INTO task_templates (id, studio_id, title, description, frequency, points) VALUES
${task_templates.map(tt => `('${tt.id}', '${tt.studio_id}', '${tt.title}', '${tt.description}', '${tt.frequency}', ${tt.points})`).join(',\n')};
`

console.log(sql)
