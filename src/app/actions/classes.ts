'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { notifyStudioUsers } from '@/app/actions/notifications'
import { revalidatePath } from 'next/cache'

export interface ClassType {
    id: string
    studioId: string
    name: string
    description: string | null
    durationMinutes: number
    maxCapacity: number
    color: string
    isActive: boolean
}

export interface ClassScheduleItem {
    id: string
    classTypeId: string
    classTypeName: string
    classTypeColor: string
    trainerId: string | null
    trainerName: string | null
    locationId: string | null
    locationName: string | null
    title: string | null
    startTime: Date
    endTime: Date
    recurrence: string
    maxCapacity: number
    currentBookings: number
    isCancelled: boolean
    notes: string | null
}

export interface ClassBooking {
    id: string
    classScheduleId: string
    memberId: string
    memberName: string
    status: string
    bookedAt: Date
}

// --- Class Types ---

export async function getClassTypes() {
    const user = await requireUser()
    return await query<ClassType>(
        `SELECT id, studio_id as "studioId", name, description, duration_minutes as "durationMinutes",
        max_capacity as "maxCapacity", color, is_active as "isActive"
    FROM class_types WHERE studio_id = $1 AND is_active = true ORDER BY name`,
        [user.studioId]
    )
}

export async function createClassType(data: { name: string; description?: string; durationMinutes?: number; maxCapacity?: number; color?: string }) {
    const user = await requireStudioleiter()
    const result = await query(
        `INSERT INTO class_types (studio_id, name, description, duration_minutes, max_capacity, color)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [user.studioId, data.name, data.description || null, data.durationMinutes || 60, data.maxCapacity || 20, data.color || '#3B82F6']
    )
    await logAction(user.studioId, user.id, 'create', 'class_type', result[0].id, null, data)
    revalidatePath('/classes')
    return { success: true, id: result[0].id }
}

// --- Class Schedule ---

export async function getClassSchedule(filters?: { dateFrom?: string; dateTo?: string }) {
    const user = await requireUser()
    const params: any[] = [user.studioId]
    let dateFilter = ''
    let idx = 2

    if (filters?.dateFrom) {
        dateFilter += ` AND cs.start_time >= $${idx}`
        params.push(filters.dateFrom)
        idx++
    }
    if (filters?.dateTo) {
        dateFilter += ` AND cs.start_time <= $${idx}`
        params.push(filters.dateTo)
        idx++
    }

    return await query<ClassScheduleItem>(
        `SELECT cs.id, cs.class_type_id as "classTypeId", ct.name as "classTypeName", ct.color as "classTypeColor",
        cs.trainer_id as "trainerId", e.display_name as "trainerName",
        cs.location_id as "locationId", loc.name as "locationName",
        cs.title, cs.start_time as "startTime", cs.end_time as "endTime",
        cs.recurrence, COALESCE(cs.max_capacity, ct.max_capacity) as "maxCapacity",
        cs.current_bookings as "currentBookings", cs.is_cancelled as "isCancelled", cs.notes
    FROM class_schedule cs
    JOIN class_types ct ON ct.id = cs.class_type_id
    LEFT JOIN employees e ON e.id = cs.trainer_id
    LEFT JOIN locations loc ON loc.id = cs.location_id
    WHERE cs.studio_id = $1${dateFilter}
    ORDER BY cs.start_time ASC`,
        params
    )
}

export async function createClassSchedule(data: {
    classTypeId: string; trainerId?: string; locationId?: string; title?: string;
    startTime: string; endTime: string; recurrence?: string; maxCapacity?: number; notes?: string
}) {
    const user = await requireStudioleiter()
    const result = await query(
        `INSERT INTO class_schedule (studio_id, class_type_id, trainer_id, location_id, title, start_time, end_time, recurrence, max_capacity, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [user.studioId, data.classTypeId, data.trainerId || null, data.locationId || null,
            data.title || null, data.startTime, data.endTime, data.recurrence || 'NONE',
            data.maxCapacity || null, data.notes || null, user.id]
    )
    await logAction(user.studioId, user.id, 'create', 'class_schedule', result[0].id, null, data)
    revalidatePath('/classes')
    return { success: true, id: result[0].id }
}

export async function updateClassType(id: string, data: {
    name?: string; description?: string; durationMinutes?: number; maxCapacity?: number; color?: string
}) {
    const user = await requireStudioleiter()
    const sets: string[] = []
    const params: any[] = [id, user.studioId]
    let idx = 3

    const fields: Record<string, any> = {
        name: data.name, description: data.description, duration_minutes: data.durationMinutes,
        max_capacity: data.maxCapacity, color: data.color,
    }
    for (const [col, val] of Object.entries(fields)) {
        if (val !== undefined) { sets.push(`${col} = $${idx}`); params.push(val); idx++ }
    }
    if (sets.length === 0) return { success: true }

    await query(`UPDATE class_types SET ${sets.join(', ')} WHERE id = $1 AND studio_id = $2`, params)
    await logAction(user.studioId, user.id, 'update', 'class_type', id, null, data)
    revalidatePath('/classes')
    return { success: true }
}

export async function cancelClassSchedule(id: string) {
    const user = await requireStudioleiter()
    await query(`UPDATE class_schedule SET is_cancelled = true WHERE id = $1 AND studio_id = $2`, [id, user.studioId])
    await notifyStudioUsers({
        studioId: user.studioId, type: 'warning', title: 'Kurs abgesagt',
        message: 'Ein geplanter Kurs wurde abgesagt', entityType: 'class_schedule', entityId: id,
        actionUrl: '/classes', excludeUserId: user.id,
    })
    revalidatePath('/classes')
    return { success: true }
}

export async function getClassBookings(classScheduleId: string) {
    const user = await requireUser()
    return await query<ClassBooking>(
        `SELECT cb.id, cb.class_schedule_id as "classScheduleId", cb.member_id as "memberId",
        CONCAT(m.first_name, ' ', m.last_name) as "memberName", cb.status, cb.booked_at as "bookedAt"
    FROM class_bookings cb
    JOIN members m ON m.id = cb.member_id
    WHERE cb.class_schedule_id = $1 AND cb.studio_id = $2
    ORDER BY cb.booked_at ASC`,
        [classScheduleId, user.studioId]
    )
}
