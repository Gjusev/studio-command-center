'use server'

import { query } from '@/lib/db'
import { requireUser } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'

export interface Notification {
    id: string
    type: string
    title: string
    message: string
    entityType: string | null
    entityId: string | null
    isRead: boolean
    actionUrl: string | null
    createdAt: Date
}

export async function getNotifications(limit: number = 30): Promise<Notification[]> {
    const user = await requireUser()
    return await query<Notification>(
        `SELECT id, type, title, message, entity_type as "entityType", entity_id as "entityId",
        is_read as "isRead", action_url as "actionUrl", created_at as "createdAt"
    FROM studio_manager.notifications
    WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [user.id, limit]
    )
}

export async function getUnreadCount(): Promise<number> {
    const user = await requireUser()
    const r = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM studio_manager.notifications WHERE user_id = $1 AND is_read = false`,
        [user.id]
    )
    return parseInt(r[0]?.count || '0')
}

export async function markAsRead(id: string) {
    const user = await requireUser()
    await query(`UPDATE studio_manager.notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [id, user.id])
    revalidatePath('/')
}

export async function markAllAsRead() {
    const user = await requireUser()
    await query(`UPDATE studio_manager.notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [user.id])
    revalidatePath('/')
}

export async function deleteNotification(id: string) {
    const user = await requireUser()
    await query(`DELETE FROM studio_manager.notifications WHERE id = $1 AND user_id = $2`, [id, user.id])
    revalidatePath('/')
}

// --- Internal helper to create notifications ---

type NotifType = 'info' | 'warning' | 'error' | 'success'

export async function createNotification(params: {
    studioId: string
    userId: string
    type?: NotifType
    title: string
    message: string
    entityType?: string
    entityId?: string
    actionUrl?: string
}) {
    try {
        await query(
            `INSERT INTO studio_manager.notifications (studio_id, user_id, type, title, message, entity_type, entity_id, action_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [params.studioId, params.userId, params.type || 'info', params.title, params.message,
                params.entityType || null, params.entityId || null, params.actionUrl || null]
        )
    } catch (e) {
        console.error('Failed to create notification:', e)
    }
}

// --- Create notifications for all users in a studio ---

export async function notifyStudioUsers(params: {
    studioId: string
    type?: NotifType
    title: string
    message: string
    entityType?: string
    entityId?: string
    actionUrl?: string
    excludeUserId?: string
}) {
    try {
        const users = await query<{ id: string }>(
            `SELECT u.id FROM studio_manager.users u JOIN studio_manager."user" au ON au.id = u.id
       WHERE u.studio_id = $1 AND u.is_active = true`,
            [params.studioId]
        )
        for (const u of users) {
            if (u.id === params.excludeUserId) continue
            await createNotification({ ...params, userId: u.id })
        }
    } catch (e) {
        console.error('Failed to notify studio users:', e)
    }
}
