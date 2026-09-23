'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { machineSchema, machineEventSchema } from '@/lib/validations'
import { notifyStudioUsers } from '@/app/actions/notifications'
import { revalidatePath } from 'next/cache'

export interface Machine {
    id: string
    studioId: string
    name: string
    categoryId: string | null
    categoryName: string | null
    locationId: string | null
    locationName: string | null
    brand: string | null
    model: string | null
    serialNo: string | null
    purchasedOn: string | null
    purchaseCost: number | null
    status: 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'MAINTENANCE'
    lastServiceOn: string | null
    nextServiceOn: string | null
    notes: string | null
    photoUrl: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface MachineEvent {
    id: string
    machineId: string
    machineName: string
    type: 'MAINTENANCE' | 'INCIDENT' | 'INSPECTION'
    status: 'OPEN' | 'CLOSED'
    description: string
    cost: number | null
    downtimeMinutes: number | null
    resolvedAt: Date | null
    createdBy: string
    createdByName: string
    createdAt: Date
}

/**
 * Holt alle Maschinen mit Filtern
 */
export async function getMachines(filters?: {
    search?: string
    status?: string
    categoryId?: string
    locationId?: string
}) {
    const user = await requireUser()

    let queryText = `
    SELECT
      m.id,
      m.studio_id as "studioId",
      m.name,
      m.category_id as "categoryId",
      mc.name as "categoryName",
      m.location_id as "locationId",
      loc.name as "locationName",
      m.brand,
      m.model,
      m.serial_no as "serialNo",
      m.purchased_on as "purchasedOn",
      m.purchase_cost as "purchaseCost",
      m.status,
      m.last_service_on as "lastServiceOn",
      m.next_service_on as "nextServiceOn",
      m.notes,
      m.photo_url as "photoUrl",
      m.is_active as "isActive",
      m.created_at as "createdAt",
      m.updated_at as "updatedAt"
    FROM machines m
    LEFT JOIN machine_categories mc ON mc.id = m.category_id
    LEFT JOIN locations loc ON loc.id = m.location_id
    WHERE m.studio_id = $1 AND m.is_active = true
  `

    const params: any[] = [user.studioId]
    let paramIndex = 2

    if (filters?.search) {
        queryText += ` AND (m.name ILIKE $${paramIndex} OR m.brand ILIKE $${paramIndex} OR m.model ILIKE $${paramIndex})`
        params.push(`%${filters.search}%`)
        paramIndex++
    }

    if (filters?.status) {
        queryText += ` AND m.status = $${paramIndex}`
        params.push(filters.status)
        paramIndex++
    }

    if (filters?.categoryId) {
        queryText += ` AND m.category_id = $${paramIndex}`
        params.push(filters.categoryId)
        paramIndex++
    }

    if (filters?.locationId) {
        queryText += ` AND m.location_id = $${paramIndex}`
        params.push(filters.locationId)
        paramIndex++
    }

    queryText += ` ORDER BY m.name ASC`

    return await query<Machine>(queryText, params)
}

/**
 * Holt einzelne Maschine
 */
export async function getMachine(id: string) {
    const user = await requireUser()

    const results = await query<Machine>(
        `SELECT
      m.id,
      m.studio_id as "studioId",
      m.name,
      m.category_id as "categoryId",
      mc.name as "categoryName",
      m.location_id as "locationId",
      loc.name as "locationName",
      m.brand,
      m.model,
      m.serial_no as "serialNo",
      m.purchased_on as "purchasedOn",
      m.purchase_cost as "purchaseCost",
      m.status,
      m.last_service_on as "lastServiceOn",
      m.next_service_on as "nextServiceOn",
      m.notes,
      m.photo_url as "photoUrl",
      m.is_active as "isActive",
      m.created_at as "createdAt",
      m.updated_at as "updatedAt"
    FROM machines m
    LEFT JOIN machine_categories mc ON mc.id = m.category_id
    LEFT JOIN locations loc ON loc.id = m.location_id
    WHERE m.id = $1 AND m.studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Maschine nicht gefunden')
    }

    return results[0]
}

/**
 * Erstellt neue Maschine (nur Studioleiter)
 */
export async function createMachine(data: any) {
    const user = await requireStudioleiter()
    const validated = machineSchema.parse(data)

    const result = await query(
        `INSERT INTO machines (
      studio_id, name, category_id, location_id, brand, model, serial_no,
      purchased_on, purchase_cost, status, last_service_on, next_service_on,
      notes, photo_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id`,
        [
            user.studioId,
            validated.name,
            validated.categoryId || null,
            validated.locationId || null,
            validated.brand || null,
            validated.model || null,
            validated.serialNo || null,
            validated.purchasedOn || null,
            validated.purchaseCost || null,
            validated.status,
            validated.lastServiceOn || null,
            validated.nextServiceOn || null,
            validated.notes || null,
            validated.photoUrl || null,
        ]
    )

    const machineId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'machine', machineId, null, validated)

    revalidatePath('/machines')
    return { success: true, id: machineId }
}

/**
 * Aktualisiert Maschine (nur Studioleiter)
 */
export async function updateMachine(args: { id: string; [key: string]: any } | string, data?: any) {
    const user = await requireStudioleiter()
    // Support both (id, data) and ({ id, ...data }) calling conventions
    const id = typeof args === 'string' ? args : args.id
    const rawData = typeof args === 'string' ? data : args
    const validated = machineSchema.parse(rawData)

    const before = await getMachine(id)

    await query(
        `UPDATE machines SET
      name = $1,
      category_id = $2,
      location_id = $3,
      brand = $4,
      model = $5,
      serial_no = $6,
      purchased_on = $7,
      purchase_cost = $8,
      status = $9,
      last_service_on = $10,
      next_service_on = $11,
      notes = $12,
      photo_url = $13
    WHERE id = $14 AND studio_id = $15`,
        [
            validated.name,
            validated.categoryId || null,
            validated.locationId || null,
            validated.brand || null,
            validated.model || null,
            validated.serialNo || null,
            validated.purchasedOn || null,
            validated.purchaseCost || null,
            validated.status,
            validated.lastServiceOn || null,
            validated.nextServiceOn || null,
            validated.notes || null,
            validated.photoUrl || null,
            id,
            user.studioId,
        ]
    )

    await logAction(user.studioId, user.id, 'update', 'machine', id, before, validated)

    revalidatePath('/machines')
    revalidatePath(`/machines/${id}`)
    return { success: true }
}

/**
 * Erstellt Machine Event
 */
export async function createMachineEvent(data: any) {
    const user = await requireUser()
    const validated = machineEventSchema.parse(data)

    // Maschine existiert und gehört zum Studio?
    await getMachine(validated.machineId)

    const result = await query(
        `INSERT INTO machine_events (
      studio_id, machine_id, type, status, description, cost, downtime_minutes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
        [
            user.studioId,
            validated.machineId,
            validated.type,
            validated.status,
            validated.description,
            validated.cost || null,
            validated.downtimeMinutes || null,
            user.id,
        ]
    )

    const eventId = result[0].id

    await logAction(user.studioId, user.id, 'maintenance_event', 'machine_event', eventId, null, validated)

    revalidatePath('/machines')
    revalidatePath(`/machines/${validated.machineId}`)

    return { success: true, id: eventId }
}

/**
 * Aktualisiert Event Status
 */
export async function updateMachineEventStatus(id: string, status: 'OPEN' | 'CLOSED') {
    const user = await requireUser()

    const before = await query(
        `SELECT * FROM machine_events WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Event nicht gefunden')
    }

    await query(
        `UPDATE machine_events SET
      status = $1,
      resolved_at = CASE WHEN $1 = 'CLOSED' THEN NOW() ELSE resolved_at END
    WHERE id = $2 AND studio_id = $3`,
        [status, id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'update', 'machine_event', id, before[0], { status })

    revalidatePath('/machines')
    return { success: true }
}

/**
 * Holt Events für eine Maschine
 */
export async function getMachineEvents(machineId: string, limit: number = 50) {
    const user = await requireUser()

    return await query<MachineEvent>(
        `SELECT
      me.id,
      me.machine_id as "machineId",
      m.name as "machineName",
      me.type,
      me.status,
      me.description,
      me.cost,
      me.downtime_minutes as "downtimeMinutes",
      me.resolved_at as "resolvedAt",
      me.created_by as "createdBy",
      u.display_name as "createdByName",
      me.created_at as "createdAt"
    FROM machine_events me
    LEFT JOIN machines m ON m.id = me.machine_id
    LEFT JOIN users u ON u.id = me.created_by
    WHERE me.machine_id = $1 AND me.studio_id = $2
    ORDER BY me.created_at DESC
    LIMIT $3`,
        [machineId, user.studioId, limit]
    )
}

/**
 * Holt Maschinen KPIs
 */
export async function getMachineStats() {
    const user = await requireUser()

    const stats = await query(
        `SELECT
      COUNT(*) FILTER (WHERE status = 'OUT_OF_SERVICE') as "outOfService",
      COUNT(*) FILTER (WHERE status = 'IN_SERVICE') as "inService",
      COUNT(*) FILTER (WHERE status = 'MAINTENANCE') as "inMaintenance",
      COUNT(*) as total
    FROM machines
    WHERE studio_id = $1 AND is_active = true`,
        [user.studioId]
    )

    const openIncidents = await query(
        `SELECT COUNT(*) as count
    FROM machine_events
    WHERE studio_id = $1 AND status = 'OPEN' AND type = 'INCIDENT'`,
        [user.studioId]
    )

    const costThisMonth = await query(
        `SELECT COALESCE(SUM(cost), 0) as total
    FROM machine_events
    WHERE studio_id = $1
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND cost IS NOT NULL`,
        [user.studioId]
    )

    return {
        outOfService: parseInt(stats[0].outOfService || '0'),
        inService: parseInt(stats[0].inService || '0'),
        inMaintenance: parseInt(stats[0].inMaintenance || '0'),
        total: parseInt(stats[0].total || '0'),
        openIncidents: parseInt(openIncidents[0].count || '0'),
        costThisMonth: parseFloat(costThisMonth[0].total || '0'),
    }
}

/**
 * Löscht eine Maschine (soft-delete, nur Studioleiter)
 */
export async function deleteMachine(id: string) {
    const user = await requireStudioleiter()

    const before = await getMachine(id)

    // Soft-delete machine
    await query(
        `UPDATE machines SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'delete',
        'machine',
        id,
        before,
        null
    )

    revalidatePath('/machines')
    return { success: true }
}

/**
 * Ändert den Status einer Maschine (für alle User)
 */
export async function updateMachineStatus(id: string, status: 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'MAINTENANCE') {
    const user = await requireUser()

    const before = await getMachine(id)

    await query(
        `UPDATE machines SET status = $1::machine_status WHERE id = $2 AND studio_id = $3`,
        [status, id, user.studioId]
    )

    const statusLabels: Record<string, string> = {
        'IN_SERVICE': 'Aktiv',
        'OUT_OF_SERVICE': 'Außer Betrieb',
        'MAINTENANCE': 'Wartung',
    }

    // Auto-create event for status change
    if (before.status !== status) {
        const eventTypes: Record<string, string> = {
            'MAINTENANCE': 'MAINTENANCE',
            'OUT_OF_SERVICE': 'INCIDENT',
            'IN_SERVICE': 'INSPECTION',
        }
        await query(
            `INSERT INTO machine_events (studio_id, machine_id, type, status, description, created_by)
       VALUES ($1, $2, $3, 'CLOSED', $4, $5)`,
            [user.studioId, id, eventTypes[status] || 'INSPECTION',
                `Status geändert: ${statusLabels[before.status] || before.status} → ${statusLabels[status]} (von ${user.displayName || user.id})`,
                user.id]
        )
    }

    await logAction(user.studioId, user.id, 'update', 'machine_status', id, { status: before.status }, { status })

    // Notify studio users about status change
    await notifyStudioUsers({
        studioId: user.studioId,
        type: status === 'OUT_OF_SERVICE' ? 'error' : status === 'MAINTENANCE' ? 'warning' : 'success',
        title: 'Maschinenstatus geändert',
        message: `${before.name}: ${statusLabels[before.status]} → ${statusLabels[status]}`,
        entityType: 'machine',
        entityId: id,
        actionUrl: `/machines/${id}`,
        excludeUserId: user.id,
    })

    revalidatePath('/machines')
    revalidatePath(`/machines/${id}`)
    return { success: true }
}

/**
 * Holt Studio-weite Maschinen-Statistiken (für Analytics)
 */
export async function getMachineAnalytics() {
    const user = await requireUser()

    const [statusDist, eventsByType, monthlyCosts, topDowntime] = await Promise.all([
        query(`SELECT status, COUNT(*)::int as count FROM machines WHERE studio_id = $1 AND is_active = true GROUP BY status`, [user.studioId]),
        query(`SELECT type, COUNT(*)::int as count, COALESCE(SUM(cost), 0)::float as total_cost FROM machine_events WHERE studio_id = $1 GROUP BY type`, [user.studioId]),
        query(`SELECT DATE_TRUNC('month', created_at) as month, COALESCE(SUM(cost), 0)::float as total FROM machine_events WHERE studio_id = $1 AND cost IS NOT NULL AND created_at >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month`, [user.studioId]),
        query(`SELECT m.name, COALESCE(SUM(me.downtime_minutes), 0)::int as total_downtime FROM machine_events me JOIN machines m ON m.id = me.machine_id WHERE me.studio_id = $1 AND me.downtime_minutes IS NOT NULL GROUP BY m.name ORDER BY total_downtime DESC LIMIT 5`, [user.studioId]),
    ])

    return { statusDist, eventsByType, monthlyCosts, topDowntime }
}
