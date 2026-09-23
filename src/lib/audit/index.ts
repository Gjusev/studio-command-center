import { query } from '@/lib/db'

export type AuditAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'stock_movement'
    | 'maintenance_event'
    | 'task_complete'
    | (string & {})

/**
 * Schreibt einen Audit Log Eintrag
 */
export async function logAction(
    studioId: string,
    actorUserId: string,
    action: AuditAction,
    entity: string,
    entityId: string | null = null,
    beforeData: any = null,
    afterData: any = null
): Promise<void> {
    try {
        await query(
            `INSERT INTO audit_logs 
        (studio_id, actor_user_id, action, entity, entity_id, before_json, after_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                studioId,
                actorUserId,
                action,
                entity,
                entityId,
                beforeData ? JSON.stringify(beforeData) : null,
                afterData ? JSON.stringify(afterData) : null,
            ]
        )
    } catch (error) {
        console.error('Failed to write audit log:', error)
        // Wir werfen keinen Error damit Business Logic nicht blockiert wird
    }
}


