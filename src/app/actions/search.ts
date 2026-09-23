'use server'

import { requireUser } from '@/lib/auth/guards'
import { query } from '@/lib/db'

export interface SearchResult {
    type: string
    id: string
    title: string
    subtitle: string | null
    url: string
    icon: string
}

export async function globalSearch(searchQuery: string): Promise<SearchResult[]> {
    if (!searchQuery || searchQuery.length < 2) return []

    const user = await requireUser()
    const q = `%${searchQuery}%`
    const results: SearchResult[] = []

    const [consumables, machines, members, employees] = await Promise.all([
        query<any>(
            `SELECT id, name, unit FROM consumables WHERE studio_id = $1 AND is_active = true AND name ILIKE $2 LIMIT 5`,
            [user.studioId, q]
        ),
        query<any>(
            `SELECT m.id, m.name, m.brand, m.model FROM machines m WHERE m.studio_id = $1 AND m.is_active = true AND (m.name ILIKE $2 OR m.brand ILIKE $2 OR m.model ILIKE $2) LIMIT 5`,
            [user.studioId, q]
        ),
        query<any>(
            `SELECT id, first_name, last_name, email FROM members WHERE studio_id = $1 AND is_active = true AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2) LIMIT 5`,
            [user.studioId, q]
        ),
        query<any>(
            `SELECT id, display_name FROM users WHERE studio_id = $1 AND is_active = true AND display_name ILIKE $2 LIMIT 3`,
            [user.studioId, q]
        ),
    ])

    for (const c of consumables) {
        results.push({ type: 'Verbrauchsmaterial', id: c.id, title: c.name, subtitle: c.unit, url: `/consumables/${c.id}`, icon: 'inventory_2' })
    }
    for (const m of machines) {
        results.push({ type: 'Maschine', id: m.id, title: m.name, subtitle: [m.brand, m.model].filter(Boolean).join(' '), url: `/machines/${m.id}`, icon: 'fitness_center' })
    }
    for (const m of members) {
        results.push({ type: 'Mitglied', id: m.id, title: `${m.first_name} ${m.last_name}`, subtitle: m.email, url: `/contracts`, icon: 'person' })
    }
    for (const e of employees) {
        results.push({ type: 'Mitarbeiter', id: e.id, title: e.display_name, subtitle: null, url: `/employees`, icon: 'group' })
    }

    return results
}
