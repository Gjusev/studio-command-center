'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { employeeSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export interface Employee {
    id: string
    studioId: string
    userId: string
    userEmail: string | null
    displayName: string
    role: 'studioleiter' | 'mitarbeiter'
    isActive: boolean
    createdAt: Date
}

export async function getEmployees() {
    const user = await requireUser()

    return await query<Employee>(
        `SELECT
      e.id,
      e.studio_id as "studioId",
      e.user_id as "userId",
      au.email as "userEmail",
      e.display_name as "displayName",
      e.role,
      e.is_active as "isActive",
      e.created_at as "createdAt"
    FROM employees e
    LEFT JOIN "user" au ON au.id = e.user_id
    WHERE e.studio_id = $1 AND e.is_active = true
    ORDER BY e.display_name ASC`,
        [user.studioId]
    )
}

export async function getEmployee(id: string) {
    const user = await requireUser()

    const results = await query<Employee>(
        `SELECT
      e.id,
      e.studio_id as "studioId",
      e.user_id as "userId",
      au.email as "userEmail",
      e.display_name as "displayName",
      e.role,
      e.is_active as "isActive",
      e.created_at as "createdAt"
    FROM employees e
    LEFT JOIN "user" au ON au.id = e.user_id
    WHERE e.id = $1 AND e.studio_id = $2`,
        [id, user.studioId]
    )

    if (results.length === 0) {
        throw new Error('Mitarbeiter nicht gefunden')
    }

    return results[0]
}

export async function createEmployee(data: any) {
    const user = await requireStudioleiter()
    const validated = employeeSchema.parse(data)

    const email = data.email?.trim()
    let userId: string | null = null

    if (email) {
        // Validate email format
        const emailSchema = z.string().email()
        try {
            emailSchema.parse(email)
        } catch (_error) {
            throw new Error('Ungültige E-Mail-Adresse')
        }

        // Check if email already exists
        const existingUser = await query(
            `SELECT * FROM "user" WHERE email = $1`,
            [email]
        )

        if (existingUser.length > 0) {
            throw new Error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits')
        }

        // Create user record in our database directly (no Stack Auth)
        // Generate a UUID for the local users table (not a better-auth user)
        const tempId = `emp_${randomUUID()}`
        const userResult = await query(
            `INSERT INTO users (id, studio_id, display_name, role, is_active)
             VALUES ($1, $2, $3, $4, true)
             RETURNING id`,
            [tempId, user.studioId, validated.displayName, validated.role]
        )

        userId = userResult[0].id
    }

    // Create employee record (single insert, no duplication)
    const result = await query(
        `INSERT INTO employees (studio_id, user_id, display_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [user.studioId, userId, validated.displayName, validated.role]
    )

    const employeeId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'employee', employeeId, null, { ...validated, email })

    revalidatePath('/employees')
    return {
        success: true,
        id: employeeId,
        message: email ? 'Mitarbeiter erstellt' : 'Mitarbeiter erstellt'
    }
}

export async function updateEmployee(id: string, data: any) {
    const user = await requireStudioleiter()
    const validated = employeeSchema.parse(data)

    const before = await query(
        `SELECT * FROM employees WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Mitarbeiter nicht gefunden')
    }

    await query(
        `UPDATE employees SET
      display_name = $1,
      role = $2
    WHERE id = $3 AND studio_id = $4`,
        [validated.displayName, validated.role, id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'update', 'employee', id, before[0], validated)

    revalidatePath('/employees')
    return { success: true }
}

export async function deleteEmployee(id: string) {
    const user = await requireStudioleiter()

    const before = await query(
        `SELECT * FROM employees WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Mitarbeiter nicht gefunden')
    }

    await query(
        `UPDATE employees SET is_active = false WHERE id = $1 AND studio_id = $2`,
        [id, user.studioId]
    )

    await logAction(user.studioId, user.id, 'delete', 'employee', id, before[0], null)

    revalidatePath('/employees')
    return { success: true }
}

export async function getEmployeePerformanceStats(userId?: string) {
    const user = await requireStudioleiter()

    let queryText = `
    SELECT
      e.id,
      e.display_name as "displayName",
      e.role,
      COUNT(tc.id) as "totalTasks",
      COALESCE(SUM(tc.points_awarded), 0) as "totalPoints"
    FROM employees e
    LEFT JOIN task_completions tc ON tc.completed_by_user_id = e.user_id
    WHERE e.studio_id = $1 AND e.is_active = true
  `

    const params: any[] = [user.studioId]

    if (userId) {
        queryText += ` AND e.user_id = $2`
        params.push(userId)
    }

    queryText += ` GROUP BY e.id, e.display_name, e.role ORDER BY "totalPoints" DESC`

    return await query(queryText, params)
}
