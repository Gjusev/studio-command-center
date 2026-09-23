'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { supplierSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export interface Supplier {
    id: string
    studioId: string
    name: string
    contactPerson: string | null
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
    isActive: boolean
    createdAt: Date
}

export async function getSupplier(id: string) {
    const user = await requireUser()

    const results = await query<Supplier>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      contact_person as "contactPerson",
      email,
      phone,
      address,
      notes,
      is_active as "isActive",
      created_at as "createdAt"
    FROM suppliers
    WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Lieferant nicht gefunden')
    }

    return results[0]
}

export async function getSuppliers() {
    const user = await requireUser()

    return await query<Supplier>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      contact_person as "contactPerson",
      email,
      phone,
      address,
      notes,
      is_active as "isActive",
      created_at as "createdAt"
    FROM suppliers
    WHERE studio_id = $1 AND is_active = true
    ORDER BY name ASC`,
        [user.studioId]
    )
}

export async function createSupplier(data: any) {
    const user = await requireStudioleiter()
    const validated = supplierSchema.parse(data)

    const result = await query(
        `INSERT INTO suppliers (studio_id, name, contact_person, email, phone, address, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
        [
            user.studioId,
            validated.name,
            validated.contactPerson || null,
            validated.email || null,
            validated.phone || null,
            validated.address || null,
            validated.notes || null,
        ]
    )

    const supplierId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'supplier', supplierId, null, validated)

    revalidatePath('/consumables')
    return { success: true, id: supplierId }
}

export async function updateSupplier(args: { id: string; [key: string]: any } | string, data?: any) {
    const user = await requireStudioleiter()
    const id = typeof args === 'string' ? args : args.id
    const rawData = typeof args === 'string' ? data : args
    const validated = supplierSchema.parse(rawData)

    const before = await query(
        `SELECT * FROM suppliers WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Lieferant nicht gefunden')
    }

    await query(
        `UPDATE suppliers SET
      name = $1,
      contact_person = $2,
      email = $3,
      phone = $4,
      address = $5,
      notes = $6
    WHERE id = $7 AND studio_id = $8`,
        [
            validated.name,
            validated.contactPerson || null,
            validated.email || null,
            validated.phone || null,
            validated.address || null,
            validated.notes || null,
            id,
            user.studioId,
        ]
    )

    await logAction(user.studioId, user.id, 'update', 'supplier', id, before[0], validated)

    revalidatePath('/consumables')
    return { success: true }
}

export async function deleteSupplier(id: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM suppliers WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Lieferant nicht gefunden')
    }

    await query(
        `UPDATE suppliers SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'delete', 'supplier', id, before[0], null)

    revalidatePath('/consumables')
    return { success: true }
}
