'use server'

import { requireStudioleiter, requireUser } from '@/lib/auth/guards'
import type { Permission } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const profileSchema = z.object({
    displayName: z.string().min(1, 'Anzeigename ist erforderlich'),
})

const inviteUserSchema = z.object({
    email: z.string().email('Ungültige E-Mail-Adresse'),
    displayName: z.string().min(1, 'Anzeigename ist erforderlich'),
    role: z.enum(['studioleiter', 'mitarbeiter']).default('mitarbeiter'),
})

/**
 * Lädt einen neuen Benutzer ein (nur Studioleiter)
 * Creates an invitation record with a unique token that can be used at signup
 */
export async function inviteUser(data: { email: string; displayName: string; role?: 'studioleiter' | 'mitarbeiter'; permissions?: Permission[] }) {
    const user = await requireStudioleiter()
    const validated = inviteUserSchema.parse(data)

    // Check if email already has an active user
    const existingUser = await query(
        `SELECT id FROM "user" WHERE email = $1`,
        [validated.email]
    )

    if (existingUser.length > 0) {
        throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits. Der Benutzer kann sich direkt anmelden.')
    }

    // Check for existing unused invitation
    const existingInvite = await query(
        `SELECT id, token FROM studio_invitations WHERE email = $1 AND studio_id = $2 AND used_at IS NULL AND expires_at > NOW()`,
        [validated.email, user.studioId]
    )

    if (existingInvite.length > 0) {
        // Update existing invitation
        await query(
            `UPDATE studio_invitations SET display_name = $1, role = $2, permissions = $3, expires_at = NOW() + INTERVAL '7 days' WHERE id = $4`,
            [validated.displayName, validated.role, data.permissions || [], existingInvite[0].id]
        )
        return { success: true, id: existingInvite[0].id, token: existingInvite[0].token }
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // Create invitation
    const result = await query(
        `INSERT INTO studio_invitations (studio_id, email, display_name, role, token, permissions, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, token`,
        [user.studioId, validated.email, validated.displayName, validated.role, token, data.permissions || [], user.id]
    )

    const invitation = result[0]

    await logAction(
        user.studioId,
        user.id,
        'create',
        'user_invitation',
        invitation.id,
        null,
        { email: validated.email, displayName: validated.displayName, role: validated.role }
    )

    revalidatePath('/employees')
    return { success: true, id: invitation.id, token: invitation.token }
}

/**
 * Validates an invitation token and returns the invitation details
 */
export async function validateInvitation(token: string) {
    const results = await query<{
        id: string
        studio_id: string
        email: string
        display_name: string
        role: string
        permissions: string[]
        studio_name: string
    }>(
        `SELECT si.*, s.name as studio_name
         FROM studio_invitations si
         JOIN studios s ON s.id = si.studio_id
         WHERE si.token = $1 AND si.used_at IS NULL AND si.expires_at > NOW()`,
        [token]
    )

    if (results.length === 0) {
        return null
    }

    return results[0]
}

/**
 * Claims an invitation after a user signs up - links user to the studio
 */
export async function claimInvitation(token: string, userId: string) {
    const invitation = await validateInvitation(token)
    if (!invitation) {
        throw new Error('Einladung ist ungültig oder abgelaufen')
    }

    // Get user info from better-auth user table
    const authUser = await query<{ name: string; email: string }>(
        `SELECT name, email FROM "user" WHERE id = $1`,
        [userId]
    )

    // Verify the signup email matches the invitation email
    if (authUser.length > 0 && authUser[0].email && authUser[0].email !== invitation.email) {
        throw new Error(`Diese Einladung ist für ${invitation.email} gedacht. Sie sind mit ${authUser[0].email} angemeldet.`)
    }

    const displayName = authUser.length > 0 ? (authUser[0].name || invitation.display_name) : invitation.display_name

    // Link user to studio
    await query(
        `INSERT INTO users (id, studio_id, display_name, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (id) DO UPDATE SET
           studio_id = EXCLUDED.studio_id,
           display_name = EXCLUDED.display_name,
           role = EXCLUDED.role,
           is_active = true`,
        [userId, invitation.studio_id, displayName, invitation.role]
    )

    // Create employee record
    await query(
        `INSERT INTO employees (studio_id, user_id, display_name, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (user_id) DO UPDATE SET
           studio_id = EXCLUDED.studio_id,
           display_name = EXCLUDED.display_name,
           role = EXCLUDED.role,
           is_active = true`,
        [invitation.studio_id, userId, displayName, invitation.role]
    )

    // Grant permissions if any
    if (invitation.permissions && invitation.permissions.length > 0) {
        for (const permission of invitation.permissions) {
            await query(
                `INSERT INTO employee_permissions (studio_id, user_id, permission)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (studio_id, user_id, permission) DO NOTHING`,
                [invitation.studio_id, userId, permission]
            )
        }
    }

    // Mark invitation as used
    await query(
        `UPDATE studio_invitations SET used_at = NOW() WHERE id = $1`,
        [invitation.id]
    )

    return { success: true, studioName: invitation.studio_name }
}

/**
 * Gets all pending invitations for the current studio
 */
export async function getPendingInvitations() {
    const user = await requireStudioleiter()

    return await query<{
        id: string
        email: string
        display_name: string
        role: string
        permissions: string[]
        token: string
        expires_at: Date
        created_at: Date
    }>(
        `SELECT id, email, display_name, role, permissions, token, expires_at, created_at
         FROM studio_invitations
         WHERE studio_id = $1 AND used_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [user.studioId]
    )
}

/**
 * Deletes/cancels a pending invitation
 */
export async function cancelInvitation(invitationId: string) {
    const user = await requireStudioleiter()

    await query(
        `DELETE FROM studio_invitations WHERE id = $1 AND studio_id = $2`,
        [invitationId, user.studioId]
    )

    revalidatePath('/employees')
    return { success: true }
}

/**
 * Aktualisiert das eigene Profil
 */
export async function updateUserProfile(data: { displayName: string }) {
    const user = await requireUser()
    const validated = profileSchema.parse(data)

    const before = await query(
        `SELECT * FROM users WHERE id = $1`,
        [user.id]
    )

    await query(
        `UPDATE users SET display_name = $1 WHERE id = $2`,
        [validated.displayName, user.id]
    )

    await logAction(
        user.studioId,
        user.id,
        'update',
        'user_profile',
        user.id,
        before[0],
        { displayName: validated.displayName }
    )

    revalidatePath('/profile')
    return { success: true }
}

/**
 * Aktualisiert die Rolle eines Mitarbeiters (nur Studioleiter)
 */
export async function updateEmployeeRole(
    employeeId: string,
    role: 'studioleiter' | 'mitarbeiter'
) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM users WHERE id = $1 AND studio_id = $2`,
        [employeeId, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Mitarbeiter nicht gefunden')
    }

    await query(
        `UPDATE users SET role = $1 WHERE id = $2 AND studio_id = $3`,
        [role, employeeId, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'update',
        'user_role',
        employeeId,
        before[0],
        { role }
    )

    revalidatePath('/employees')
    revalidatePath(`/employees/${employeeId}`)
    return { success: true }
}

/**
 * Deaktiviert einen Benutzer (nur Studioleiter)
 */
export async function deactivateUser(userId: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM users WHERE id = $1 AND studio_id = $2`,
        [userId, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Benutzer nicht gefunden')
    }

    await query(
        `UPDATE users SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [userId, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'deactivate',
        'user',
        userId,
        before[0],
        null
    )

    revalidatePath('/employees')
    return { success: true }
}

/**
 * Aktiviert einen Benutzer (nur Studioleiter)
 */
export async function activateUser(userId: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM users WHERE id = $1 AND studio_id = $2`,
        [userId, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Benutzer nicht gefunden')
    }

    await query(
        `UPDATE users SET is_active = true WHERE id = $1 AND studio_id = $2`,
        [userId, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'activate',
        'user',
        userId,
        before[0],
        null
    )

    revalidatePath('/employees')
    return { success: true }
}


