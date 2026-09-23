'use server'

import { requireStudioleiter, getUserPermissions, type Permission, PERMISSION_LABELS } from '@/lib/auth/guards'
import { query, withTransaction } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getPermissionsForUser(userId: string): Promise<Permission[]> {
    await requireStudioleiter()
    return getUserPermissions(userId)
}

export async function setPermissionsForUser(userId: string, permissions: Permission[]) {
    const user = await requireStudioleiter()

    // Validate all permissions are valid
    const validPermissions = Object.keys(PERMISSION_LABELS) as Permission[]
    const invalid = permissions.filter(p => !validPermissions.includes(p))
    if (invalid.length > 0) {
        throw new Error(`Invalid permissions: ${invalid.join(', ')}`)
    }

    // Get studio_id for the target user
    const targetUser = await query<{ studio_id: string }>(
        `SELECT studio_id FROM users WHERE id = $1`,
        [userId]
    )
    if (targetUser.length === 0) {
        throw new Error('Benutzer nicht gefunden')
    }

    const studioId = targetUser[0].studio_id

    // Replace all permissions in a transaction
    await withTransaction(async (tx) => {
        await tx`
            DELETE FROM employee_permissions
            WHERE user_id = ${userId} AND studio_id = ${studioId}
        `

        for (const permission of permissions) {
            await tx`
                INSERT INTO employee_permissions (studio_id, user_id, permission)
                VALUES (${studioId}, ${userId}, ${permission})
            `
        }
    })

    await logAction(
        user.studioId,
        user.id,
        'update',
        'employee_permissions',
        undefined,
        null,
        { userId, permissions }
    )

    revalidatePath('/employees')
    return { success: true }
}
