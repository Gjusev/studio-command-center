'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query, withTransaction } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { consumableSchema, movementSchema } from '@/lib/validations'
import { notifyStudioUsers } from '@/app/actions/notifications'
import { revalidatePath } from 'next/cache'

export interface Consumable {
    id: string
    studioId: string
    name: string
    categoryId: string | null
    categoryName: string | null
    locationId: string | null
    locationName: string | null
    supplierId: string | null
    supplierName: string | null
    unit: string
    stockCurrent: number
    stockMin: number
    unitCost: number | null
    expiresOn: string | null
    notes: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface ConsumableMovement {
    id: string
    consumableId: string
    type: 'IN' | 'OUT' | 'ADJUST' | 'WASTE'
    quantity: number
    stockBefore: number
    stockAfter: number
    reason: string | null
    createdBy: string
    createdByName: string
    createdAt: Date
}

/**
 * Holt alle Verbrauchsmaterialien mit optionalen Filtern
 */
export async function getConsumables(filters?: {
    search?: string
    categoryId?: string
    locationId?: string
    lowStock?: boolean
    limit?: number
    offset?: number
}) {
    const user = await requireUser()
    const studioId = user.studioId

    let queryText = `
    SELECT 
      c.id,
      c.studio_id as "studioId",
      c.name,
      c.category_id as "categoryId",
      cat.name as "categoryName",
      c.location_id as "locationId",
      loc.name as "locationName",
      c.supplier_id as "supplierId",
      sup.name as "supplierName",
      c.unit,
      c.stock_current as "stockCurrent",
      c.stock_min as "stockMin",
      c.unit_cost as "unitCost",
      c.expires_on as "expiresOn",
      c.notes,
      c.is_active as "isActive",
      c.created_at as "createdAt",
      c.updated_at as "updatedAt"
    FROM consumables c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN locations loc ON loc.id = c.location_id
    LEFT JOIN suppliers sup ON sup.id = c.supplier_id
    WHERE c.studio_id = $1 AND c.is_active = true
  `

    const params: any[] = [studioId]
    let paramIndex = 2

    if (filters?.search) {
        queryText += ` AND c.name ILIKE $${paramIndex}`
        params.push(`%${filters.search}%`)
        paramIndex++
    }

    if (filters?.categoryId) {
        queryText += ` AND c.category_id = $${paramIndex}`
        params.push(filters.categoryId)
        paramIndex++
    }

    if (filters?.locationId) {
        queryText += ` AND c.location_id = $${paramIndex}`
        params.push(filters.locationId)
        paramIndex++
    }

    if (filters?.lowStock) {
        queryText += ` AND c.stock_current <= c.stock_min`
    }

    queryText += ` ORDER BY c.name ASC`

    if (filters?.limit) {
        queryText += ` LIMIT $${paramIndex}`
        params.push(filters.limit)
        paramIndex++
    }

    if (filters?.offset) {
        queryText += ` OFFSET $${paramIndex}`
        params.push(filters.offset)
    }

    return await query<Consumable>(queryText, params)
}

/**
 * Holt ein einzelnes Verbrauchsmaterial mit Details
 */
export async function getConsumable(id: string) {
    const user = await requireUser()

    const results = await query<Consumable>(
        `SELECT 
      c.id,
      c.studio_id as "studioId",
      c.name,
      c.category_id as "categoryId",
      cat.name as "categoryName",
      c.location_id as "locationId",
      loc.name as "locationName",
      c.supplier_id as "supplierId",
      sup.name as "supplierName",
      c.unit,
      c.stock_current as "stockCurrent",
      c.stock_min as "stockMin",
      c.unit_cost as "unitCost",
      c.expires_on as "expiresOn",
      c.notes,
      c.is_active as "isActive",
      c.created_at as "createdAt",
      c.updated_at as "updatedAt"
    FROM consumables c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN locations loc ON loc.id = c.location_id
    LEFT JOIN suppliers sup ON sup.id = c.supplier_id
    WHERE c.id = $1 AND c.studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Verbrauchsmaterial nicht gefunden')
    }

    return results[0]
}

/**
 * Erstellt neues Verbrauchsmaterial (nur Studioleiter)
 */
export async function createConsumable(data: any) {
    const user = await requireStudioleiter()
    const validated = consumableSchema.parse(data)

    const result = await query(
        `INSERT INTO consumables (
      studio_id, name, category_id, location_id, supplier_id,
      unit, stock_current, stock_min, unit_cost, expires_on, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id`,
        [
            user.studioId,
            validated.name,
            validated.categoryId || null,
            validated.locationId || null,
            validated.supplierId || null,
            validated.unit,
            validated.stockCurrent,
            validated.stockMin,
            validated.unitCost || null,
            validated.expiresOn || null,
            validated.notes || null,
        ]
    )

    const consumableId = result[0].id

    await logAction(
        user.studioId,
        user.id,
        'create',
        'consumable',
        consumableId,
        null,
        validated
    )

    await notifyStudioUsers({
        studioId: user.studioId,
        type: 'success',
        title: 'Neues Verbrauchsmaterial',
        message: `${validated.name} wurde hinzugefügt`,
        entityType: 'consumable',
        entityId: consumableId,
        actionUrl: `/consumables/${consumableId}`,
        excludeUserId: user.id,
    })

    revalidatePath('/consumables')
    return { success: true, id: consumableId }
}

/**
 * Aktualisiert Verbrauchsmaterial (nur Studioleiter)
 */
export async function updateConsumable(args: { id: string; [key: string]: any } | string, data?: any) {
    const user = await requireStudioleiter()
    // Support both (id, data) and ({ id, ...data }) calling conventions
    const id = typeof args === 'string' ? args : args.id
    const rawData = typeof args === 'string' ? data : args
    const validated = consumableSchema.parse(rawData)

    const before = await getConsumable(id)

    await query(
        `UPDATE consumables SET
      name = $1,
      category_id = $2,
      location_id = $3,
      supplier_id = $4,
      unit = $5,
      stock_min = $6,
      unit_cost = $7,
      expires_on = $8,
      notes = $9
    WHERE id = $10 AND studio_id = $11`,
        [
            validated.name,
            validated.categoryId || null,
            validated.locationId || null,
            validated.supplierId || null,
            validated.unit,
            validated.stockMin,
            validated.unitCost || null,
            validated.expiresOn || null,
            validated.notes || null,
            id,
            user.studioId,
        ]
    )

    await logAction(
        user.studioId,
        user.id,
        'update',
        'consumable',
        id,
        before,
        validated
    )

    revalidatePath('/consumables')
    revalidatePath(`/consumables/${id}`)
    return { success: true }
}

/**
 * Bucht Bewegung (IN/OUT/ADJUST/WASTE)
 */
export async function createMovement(data: any) {
    const user = await requireUser()
    const validated = movementSchema.parse(data)

    return await withTransaction(async (tx) => {
        // Aktuelles Verbrauchsmaterial holen
        const consumables = await tx`
      SELECT stock_current, studio_id
      FROM consumables
      WHERE id = ${validated.consumableId}
      FOR UPDATE
    `

        if (consumables.length === 0) {
            throw new Error('Verbrauchsmaterial nicht gefunden')
        }

        const consumable = consumables[0]

        // Studio Scope prüfen
        if (consumable.studio_id !== user.studioId) {
            throw new Error('Zugriff verweigert')
        }

        const stockBefore = parseFloat(consumable.stock_current)
        let stockAfter = stockBefore

        // Neuen Bestand berechnen
        switch (validated.type) {
            case 'IN':
                stockAfter = stockBefore + validated.quantity
                break
            case 'OUT':
                stockAfter = stockBefore - validated.quantity
                if (stockAfter < 0) {
                    throw new Error('Bestand kann nicht negativ werden')
                }
                break
            case 'ADJUST':
                stockAfter = validated.quantity
                break
            case 'WASTE':
                stockAfter = stockBefore - validated.quantity
                if (stockAfter < 0) {
                    throw new Error('Bestand kann nicht negativ werden')
                }
                break
        }

        // Movement erstellen
        const movementResult = await tx`
      INSERT INTO consumable_movements (
        studio_id, consumable_id, type, quantity, stock_before, stock_after,
        reason, created_by
      ) VALUES (
        ${user.studioId}, ${validated.consumableId}, ${validated.type},
        ${validated.quantity}, ${stockBefore}, ${stockAfter},
        ${validated.reason || null}, ${user.id}
      )
      RETURNING id
    `

        // Bestand aktualisieren
        await tx`
      UPDATE consumables
      SET stock_current = ${stockAfter}
      WHERE id = ${validated.consumableId}
    `

        // Audit Log
        await logAction(
            user.studioId,
            user.id,
            'stock_movement',
            'consumable_movement',
            movementResult[0].id,
            null,
            {
                consumableId: validated.consumableId,
                type: validated.type,
                quantity: validated.quantity,
                stockBefore,
                stockAfter,
            }
        )

        // Notify if stock is low after movement
        if (stockAfter <= (await getConsumable(validated.consumableId)).stockMin) {
            await notifyStudioUsers({
                studioId: user.studioId,
                type: 'warning',
                title: 'Kritischer Bestand',
                message: `${(await getConsumable(validated.consumableId)).name}: ${stockAfter} Einheiten remaining`,
                entityType: 'consumable',
                entityId: validated.consumableId,
                actionUrl: `/consumables/${validated.consumableId}`,
            })
        }

        revalidatePath('/consumables')
        revalidatePath(`/consumables/${validated.consumableId}`)

        return { success: true, id: movementResult[0].id }
    })
}

/**
 * Holt Bewegungen für ein Verbrauchsmaterial
 */
export async function getMovements(consumableId: string, limit: number = 50) {
    const user = await requireUser()

    return await query<ConsumableMovement>(
        `SELECT
      cm.id,
      cm.consumable_id as "consumableId",
      cm.type,
      cm.quantity,
      cm.stock_before as "stockBefore",
      cm.stock_after as "stockAfter",
      cm.reason,
      cm.created_by as "createdBy",
      u.display_name as "createdByName",
      cm.created_at as "createdAt"
    FROM consumable_movements cm
    LEFT JOIN users u ON u.id = cm.created_by
    WHERE cm.consumable_id = $1 AND cm.studio_id = $2
    ORDER BY cm.created_at DESC
    LIMIT $3`,
        [consumableId, user.studioId, limit]
    )
}

/**
 * Holt Verbrauchsmaterialien mit niedrigem Bestand
 */
export async function getLowStockItems() {
    const user = await requireUser()

    return await query<Consumable>(
        `SELECT
      c.id,
      c.name,
      c.unit,
      c.stock_current as "stockCurrent",
      c.stock_min as "stockMin",
      cat.name as "categoryName",
      loc.name as "locationName"
    FROM consumables c
    LEFT JOIN categories cat ON cat.id = c.category_id
    LEFT JOIN locations loc ON loc.id = c.location_id
    WHERE c.studio_id = $1
      AND c.is_active = true
      AND c.stock_current <= c.stock_min
    ORDER BY (c.stock_current - c.stock_min) ASC`,
        [user.studioId]
    )
}

/**
 * Löscht ein Verbrauchsmaterial (soft-delete, nur Studioleiter)
 */
export async function deleteConsumable(id: string) {
    const user = await requireStudioleiter()

    const before = await getConsumable(id)

    await query(
        `UPDATE consumables SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'delete',
        'consumable',
        id,
        before,
        null
    )

    revalidatePath('/consumables')
    return { success: true }
}
