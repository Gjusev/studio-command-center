'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { categorySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export interface Category {
    id: string
    studioId: string
    name: string
    description: string | null
    isActive: boolean
    createdAt: Date
}

export async function getCategory(id: string) {
    const user = await requireUser()

    const results = await query<Category>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      description,
      is_active as "isActive",
      created_at as "createdAt"
    FROM categories
    WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Kategorie nicht gefunden')
    }

    return results[0]
}

export async function getCategories() {
    const user = await requireUser()

    return await query<Category>(
        `SELECT
      id,
      studio_id as "studioId",
      name,
      description,
      is_active as "isActive",
      created_at as "createdAt"
    FROM categories
    WHERE studio_id = $1 AND is_active = true
    ORDER BY name ASC`,
        [user.studioId]
    )
}

export async function createCategory(data: any) {
    const user = await requireStudioleiter()
    const validated = categorySchema.parse(data)

    const result = await query(
        `INSERT INTO categories (studio_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING id`,
        [user.studioId, validated.name, validated.description || null]
    )

    const categoryId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'category', categoryId, null, validated)

    revalidatePath('/consumables')
    return { success: true, id: categoryId }
}

export async function updateCategory(args: { id: string; [key: string]: any } | string, data?: any) {
    const user = await requireStudioleiter()
    const id = typeof args === 'string' ? args : args.id
    const rawData = typeof args === 'string' ? data : args
    const validated = categorySchema.parse(rawData)

    const before = await query(
        `SELECT * FROM categories WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Kategorie nicht gefunden')
    }

    await query(
        `UPDATE categories SET
      name = $1,
      description = $2
    WHERE id = $3 AND studio_id = $4`,
        [validated.name, validated.description || null, id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'update', 'category', id, before[0], validated)

    revalidatePath('/consumables')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM categories WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Kategorie nicht gefunden')
    }

    await query(
        `UPDATE categories SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'delete', 'category', id, before[0], null)

    revalidatePath('/consumables')
    return { success: true }
}
