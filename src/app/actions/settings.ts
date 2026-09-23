'use server'

import { query } from '@/lib/db'
import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for settings
const settingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('dark'),
    language: z.enum(['de', 'en']).default('de'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    lowStockAlerts: z.boolean().default(true),
    maintenanceReminders: z.boolean().default(true),
    taskReminders: z.boolean().default(true),
    itemsPerPage: z.number().int().min(10).max(100).default(25),
    defaultCurrency: z.enum(['EUR', 'USD', 'GBP', 'CHF']).default('EUR'),
    defaultDateFormat: z.enum(['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD.MM.YYYY'),
    defaultTimeFormat: z.enum(['24h', '12h']).default('24h'),
    timezone: z.string().default('Europe/Berlin'),
})

export type UserSettings = z.infer<typeof settingsSchema> & {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

/**
 * Get user settings (creates defaults if not exist)
 */
export async function getUserSettings(): Promise<UserSettings> {
    const user = await requireUser()

    let result = await query(
        `SELECT * FROM studio_manager.user_settings WHERE user_id = $1`,
        [user.id]
    )

    // Create default settings if none exist
    if (result.length === 0) {
        await query(
            `INSERT INTO studio_manager.user_settings (
                user_id, theme, language, email_notifications, push_notifications,
                low_stock_alerts, maintenance_reminders, task_reminders,
                items_per_page, default_currency, default_date_format,
                default_time_format, timezone
            ) VALUES ($1, 'dark', 'de', true, true, true, true, true, 25, 'EUR', 'DD.MM.YYYY', '24h', 'Europe/Berlin')`,
            [user.id]
        )
        result = await query(
            `SELECT * FROM studio_manager.user_settings WHERE user_id = $1`,
            [user.id]
        )
    }

    const settings = result[0] as any

    return {
        id: settings.id,
        userId: settings.user_id,
        theme: settings.theme as 'light' | 'dark' | 'system',
        language: settings.language as 'de' | 'en',
        emailNotifications: settings.email_notifications,
        pushNotifications: settings.push_notifications,
        lowStockAlerts: settings.low_stock_alerts,
        maintenanceReminders: settings.maintenance_reminders,
        taskReminders: settings.task_reminders,
        itemsPerPage: settings.items_per_page,
        defaultCurrency: settings.default_currency,
        defaultDateFormat: settings.default_date_format,
        defaultTimeFormat: settings.default_time_format,
        timezone: settings.timezone,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
    }
}

/**
 * Update user settings
 */
export async function updateUserSettings(formData: FormData) {
    const user = await requireUser()

    // Extract and validate form data
    const rawData = {
        theme: formData.get('theme') as string | null,
        language: formData.get('language') as string | null,
        emailNotifications: formData.get('emailNotifications') === 'true',
        pushNotifications: formData.get('pushNotifications') === 'true',
        lowStockAlerts: formData.get('lowStockAlerts') === 'true',
        maintenanceReminders: formData.get('maintenanceReminders') === 'true',
        taskReminders: formData.get('taskReminders') === 'true',
        itemsPerPage: parseInt(formData.get('itemsPerPage') as string) || 25,
        defaultCurrency: formData.get('defaultCurrency') as string | null,
        defaultDateFormat: formData.get('defaultDateFormat') as string | null,
        defaultTimeFormat: formData.get('defaultTimeFormat') as string | null,
        timezone: formData.get('timezone') as string | null,
    }

    const validatedData = settingsSchema.parse(rawData)

    // Get current settings for audit log
    const currentSettings = await query(
        `SELECT * FROM studio_manager.user_settings WHERE user_id = $1`,
        [user.id]
    )

    // Update settings in database
    await query(
        `INSERT INTO studio_manager.user_settings (
            user_id, theme, language, email_notifications, push_notifications,
            low_stock_alerts, maintenance_reminders, task_reminders,
            items_per_page, default_currency, default_date_format,
            default_time_format, timezone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id) DO UPDATE SET
            theme = EXCLUDED.theme,
            language = EXCLUDED.language,
            email_notifications = EXCLUDED.email_notifications,
            push_notifications = EXCLUDED.push_notifications,
            low_stock_alerts = EXCLUDED.low_stock_alerts,
            maintenance_reminders = EXCLUDED.maintenance_reminders,
            task_reminders = EXCLUDED.task_reminders,
            items_per_page = EXCLUDED.items_per_page,
            default_currency = EXCLUDED.default_currency,
            default_date_format = EXCLUDED.default_date_format,
            default_time_format = EXCLUDED.default_time_format,
            timezone = EXCLUDED.timezone,
            updated_at = NOW()
        `,
        [
            user.id,
            validatedData.theme,
            validatedData.language,
            validatedData.emailNotifications,
            validatedData.pushNotifications,
            validatedData.lowStockAlerts,
            validatedData.maintenanceReminders,
            validatedData.taskReminders,
            validatedData.itemsPerPage,
            validatedData.defaultCurrency,
            validatedData.defaultDateFormat,
            validatedData.defaultTimeFormat,
            validatedData.timezone,
        ]
    )

    // Log the action
    await logAction(
        user.studioId,
        user.id,
        'update',
        'user_settings',
        user.id,
        currentSettings[0] || null,
        validatedData
    )

    return { success: true }
}

/**
 * Reset user settings to defaults
 */
export async function resetUserSettings() {
    const user = await requireUser()

    await query(
        `DELETE FROM studio_manager.user_settings WHERE user_id = $1`,
        [user.id]
    )

    // Log the action
    await logAction(
        user.studioId,
        user.id,
        'delete',
        'user_settings',
        user.id,
        null,
        { theme: 'dark', language: 'de' }
    )

    return { success: true }
}

/**
 * Get studio info (for display in settings)
 */
export async function getStudioInfo() {
    const user = await requireUser()

    const result = await query(
        `SELECT s.id, s.name, s.address, s.phone, s.email, s.created_at
         FROM studio_manager.studios s
         INNER JOIN studio_manager.users u ON u.studio_id = s.id
         WHERE u.id = $1`,
        [user.id]
    )

    return result[0] || null
}

/**
 * Update studio info (only studioleiter)
 */
const studioInfoSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().max(500).optional(),
    phone: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
})

export async function updateStudioInfo(data: { name?: string; address?: string; phone?: string; email?: string }) {
    const user = await requireStudioleiter()
    const validated = studioInfoSchema.parse(data)

    const before = await query(
        `SELECT * FROM studio_manager.studios WHERE id = $1`,
        [user.studioId]
    )

    if (before.length === 0) {
        throw new Error('Studio nicht gefunden')
    }

    await query(
        `UPDATE studio_manager.studios SET
            name = COALESCE($1, name),
            address = COALESCE($2, address),
            phone = COALESCE($3, phone),
            email = COALESCE($4, email),
            updated_at = NOW()
        WHERE id = $5`,
        [validated.name || null, validated.address || null, validated.phone || null, validated.email || null, user.studioId]
    )

    await logAction(
        user.studioId,
        user.id,
        'update',
        'studio',
        user.studioId,
        before[0],
        validated
    )

    revalidatePath('/settings')
    return { success: true }
}
