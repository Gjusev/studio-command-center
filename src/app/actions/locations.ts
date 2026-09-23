'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { locationSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export interface Location {
    id: string
    studioId: string
    name: string
    description: string | null
    isActive: boolean
    createdAt: Date
}

export async function getLocation(id: string) {
    const user = await requireUser()

    const results = await query<Location>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      description,
      is_active as "isActive",
      created_at as "createdAt"
    FROM locations
    WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Standort nicht gefunden')
    }

    return results[0]
}

export async function getLocations() {
    const user = await requireUser()

    return await query<Location>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      description,
      is_active as "isActive",
      created_at as "createdAt"
    FROM locations
    WHERE studio_id = $1 AND is_active = true
    ORDER BY name ASC`,
        [user.studioId]
    )
}

export async function createLocation(data: any) {
    const user = await requireStudioleiter()
    const validated = locationSchema.parse(data)

    const result = await query(
        `INSERT INTO locations (studio_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING id`,
        [user.studioId, validated.name, validated.description || null]
    )

    const locationId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'location', locationId, null, validated)

    revalidatePath('/consumables')
    revalidatePath('/machines')
    return { success: true, id: locationId }
}

export async function updateLocation(args: { id: string; [key: string]: any } | string, data?: any) {
    const user = await requireStudioleiter()
    const id = typeof args === 'string' ? args : args.id
    const rawData = typeof args === 'string' ? data : args
    const validated = locationSchema.parse(rawData)

    const before = await query(
        `SELECT * FROM locations WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Standort nicht gefunden')
    }

    await query(
        `UPDATE locations SET
      name = $1,
      description = $2
    WHERE id = $3 AND studio_id = $4`,
        [validated.name, validated.description || null, id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'update', 'location', id, before[0], validated)

    revalidatePath('/consumables')
    revalidatePath('/machines')
    return { success: true }
}

export async function deleteLocation(id: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM locations WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Standort nicht gefunden')
    }

    await query(
        `UPDATE locations SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'delete', 'location', id, before[0], null)

    revalidatePath('/consumables')
    revalidatePath('/machines')
    return { success: true }
}
