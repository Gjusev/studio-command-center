'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { taskTemplateSchema, taskAssignmentSchema, taskCompletionSchema } from '@/lib/validations'
import { notifyStudioUsers } from '@/app/actions/notifications'
import { revalidatePath } from 'next/cache'

export interface TaskTemplate {
    id: string
    studioId: string
    title: string
    description: string | null
    frequency: string | null
    points: number
    isActive: boolean
    createdAt: Date
}

export interface TaskAssignment {
    id: string
    taskTemplateId: string
    taskTitle: string
    taskDescription: string | null
    taskPoints: number
    assignedToUserId: string
    assignedToName: string
    dueDate: string | null
    createdBy: string
    createdByName: string
    createdAt: Date
}

export interface TaskCompletion {
    id: string
    assignmentId: string | null
    taskTemplateId: string
    taskTitle: string
    completedByUserId: string
    completedByName: string
    completedAt: Date
    notes: string | null
    pointsAwarded: number
}

/**
 * Holt alle Task Templates (nur Studioleiter)
 */
export async function getTaskTemplates() {
    const user = await requireUser()

    return await query<TaskTemplate>(
        `SELECT
      id,
      studio_id as "studioId",
      title,
      description,
      frequency,
      points,
      is_active as "isActive",
      created_at as "createdAt"
    FROM task_templates
    WHERE studio_id = $1 AND is_active = true
    ORDER BY title ASC`,
        [user.studioId]
    )
}

/**
 * Erstellt Task Template (nur Studioleiter)
 */
export async function createTaskTemplate(data: any) {
    const user = await requireStudioleiter()
    const validated = taskTemplateSchema.parse(data)

    const result = await query(
        `INSERT INTO task_templates (studio_id, title, description, frequency, points)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id`,
        [user.studioId, validated.title, validated.description || null, validated.frequency || null, validated.points]
    )

    const templateId = result[0].id

    await logAction(user.studioId, user.id, 'create', 'task_template', templateId, null, validated)

    revalidatePath('/tasks/templates')
    return { success: true, id: templateId }
}

/**
 * Weist Task zu (nur Studioleiter)
 */
export async function assignTask(data: any) {
    const user = await requireStudioleiter()
    const validated = taskAssignmentSchema.parse(data)

    const result = await query(
        `INSERT INTO task_assignments (studio_id, task_template_id, assigned_to_user_id, due_date, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id`,
        [user.studioId, validated.taskTemplateId, validated.assignedToUserId, validated.dueDate || null, user.id]
    )

    revalidatePath('/tasks')
    return { success: true, id: result[0].id }
}

/**
 * Holt eigene offene Aufgaben (Mitarbeiter View)
 */
export async function getMyTasks() {
    const user = await requireUser()

    return await query<TaskAssignment>(
        `SELECT
      ta.id,
      ta.task_template_id as "taskTemplateId",
      tt.title as "taskTitle",
      tt.description as "taskDescription",
      tt.points as "taskPoints",
      ta.assigned_to_user_id as "assignedToUserId",
      u.display_name as "assignedToName",
      ta.due_date as "dueDate",
      ta.created_by as "createdBy",
      creator.display_name as "createdByName",
      ta.created_at as "createdAt"
    FROM task_assignments ta
    JOIN task_templates tt ON tt.id = ta.task_template_id
    JOIN users u ON u.id = ta.assigned_to_user_id
    LEFT JOIN users creator ON creator.id = ta.created_by
    WHERE ta.studio_id = $1
      AND ta.assigned_to_user_id = $2
      AND ta.id NOT IN (
        SELECT assignment_id FROM task_completions
        WHERE assignment_id IS NOT NULL AND studio_id = $1
      )
    ORDER BY ta.due_date ASC NULLS LAST, ta.created_at DESC`,
        [user.studioId, user.id]
    )
}

/**
 * Schließt Task ab
 */
export async function completeTask(data: any) {
    const user = await requireUser()
    const validated = taskCompletionSchema.parse(data)

    // Hole Template für Points
    const template = await query(
        `SELECT points FROM task_templates WHERE id = $1`,
        [validated.taskTemplateId]
    )

    if (template.length === 0) {
        throw new Error('Task Template nicht gefunden')
    }

    const result = await query(
        `INSERT INTO task_completions (
      studio_id, assignment_id, task_template_id, completed_by_user_id, notes, points_awarded
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`,
        [
            user.studioId,
            validated.assignmentId || null,
            validated.taskTemplateId,
            user.id,
            validated.notes || null,
            template[0].points,
        ]
    )

    await logAction(user.studioId, user.id, 'task_complete', 'task_completion', result[0].id, null, validated)

    // Notify studioleiter about task completion
    await notifyStudioUsers({
        studioId: user.studioId,
        type: 'success',
        title: 'Aufgabe erledigt',
        message: `${user.displayName} hat "${template[0].title}" abgeschlossen (+${template[0].points} Punkte)`,
        entityType: 'task_completion',
        entityId: result[0].id,
        actionUrl: '/tasks',
        excludeUserId: user.id,
    })

    revalidatePath('/tasks')
    return { success: true, id: result[0].id }
}

/**
 * Holt Performance Stats für einen Mitarbeiter
 */
export async function getEmployeeStats(userId: string, dateFrom?: string, dateTo?: string) {
    const user = await requireUser()

    const queryText = `
    SELECT
      COUNT(*) as "totalTasks",
      COALESCE(SUM(points_awarded), 0) as "totalPoints"
    FROM task_completions
    WHERE studio_id = $1 AND completed_by_user_id = $2
      ${dateFrom ? 'AND completed_at >= $3' : ''}
      ${dateTo ? `AND completed_at <= $${dateFrom ? '4' : '3'}` : ''}
  `

    const params: any[] = [user.studioId, userId]
    if (dateFrom) params.push(dateFrom)
    if (dateTo) params.push(dateTo)

    const stats = await query(queryText, params)

    return {
        totalTasks: parseInt(stats[0].totalTasks || '0'),
        totalPoints: parseInt(stats[0].totalPoints || '0'),
    }
}

/**
 * Holt Gesamt-Statistik aller Mitarbeiter (nur Studioleiter)
 */
export async function getAllStats(dateFrom?: string, dateTo?: string) {
    const user = await requireStudioleiter()

    const queryText = `
    SELECT
      u.id as "userId",
      u.display_name as "userName",
      COUNT(tc.id) as "totalTasks",
      COALESCE(SUM(tc.points_awarded), 0) as "totalPoints"
    FROM users u
    LEFT JOIN task_completions tc ON tc.completed_by_user_id = u.id
      AND tc.studio_id = $1
      ${dateFrom ? 'AND tc.completed_at >= $2' : ''}
      ${dateTo ? `AND tc.completed_at <= $${dateFrom ? '3' : '2'}` : ''}
    WHERE u.studio_id = $1 AND u.is_active = true
    GROUP BY u.id, u.display_name
    ORDER BY "totalPoints" DESC
  `

    const params: any[] = [user.studioId]
    if (dateFrom) params.push(dateFrom)
    if (dateTo) params.push(dateTo)

    return await query(queryText, params)
}

/**
 * Holt abgeschlossene Tasks für Export
 */
export async function getCompletedTasks(dateFrom?: string, dateTo?: string) {
    const user = await requireUser()

    // Nur Studioleiter darf alle Tasks sehen
    const isStudioleiter = user.role === 'studioleiter'

    const queryText = `
    SELECT
      tc.id,
      tt.title as "taskTitle",
      u.display_name as "completedBy",
      tc.completed_at as "completedAt",
      tc.notes,
      tc.points_awarded as "points"
    FROM task_completions tc
    JOIN task_templates tt ON tt.id = tc.task_template_id
    JOIN users u ON u.id = tc.completed_by_user_id
    WHERE tc.studio_id = $1
      ${!isStudioleiter ? 'AND tc.completed_by_user_id = $2' : ''}
      ${dateFrom ? `AND tc.completed_at >= $${isStudioleiter ? '2' : '3'}` : ''}
      ${dateTo ? `AND tc.completed_at <= $${isStudioleiter ? (dateFrom ? '3' : '2') : (dateFrom ? '4' : '3')}` : ''}
    ORDER BY tc.completed_at DESC
  `

    const params: any[] = [user.studioId]
    if (!isStudioleiter) params.push(user.id)
    if (dateFrom) params.push(dateFrom)
    if (dateTo) params.push(dateTo)

    return await query(queryText, params)
}

/**
 * Exportiert Tasks als CSV String
 */
export async function exportTasksCSV(dateFrom?: string, dateTo?: string) {
    const tasks = await getCompletedTasks(dateFrom, dateTo)

    // CSV Header
    let csv = 'Task,Mitarbeiter,Erledigt am,Notizen,Punkte\n'

    // Zeilen
    for (const task of tasks) {
        const escapedTitle = `"${(task.taskTitle || '').replace(/"/g, '""')}"`
        const escapedName = `"${(task.completedBy || '').replace(/"/g, '""')}"`
        const date = new Date(task.completedAt).toLocaleDateString('de-DE')
        const escapedNotes = `"${(task.notes || '').replace(/"/g, '""')}"`
        const points = task.points || 0

        csv += `${escapedTitle},${escapedName},${date},${escapedNotes},${points}\n`
    }

    return csv
}
