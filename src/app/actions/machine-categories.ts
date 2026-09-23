'use server'

import { requireUser } from '@/lib/auth/guards'
import { query } from '@/lib/db'

export interface MachineCategory {
    id: string
    studioId: string
    name: string
    description: string | null
    isActive: boolean
    createdAt: Date
}

export async function getMachineCategories() {
    const user = await requireUser()

    return await query<MachineCategory>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      description,
      is_active as "isActive",
      created_at as "createdAt"
    FROM machine_categories
    WHERE studio_id = $1 AND is_active = true
    ORDER BY name ASC`,
        [user.studioId]
    )
}
