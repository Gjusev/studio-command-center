'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Member ---

export interface Member {
    id: string
    studioId: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    dateOfBirth: string | null
    address: string | null
    notes: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    isActive: boolean
    createdAt: Date
}

export interface Contract {
    id: string
    studioId: string
    memberId: string
    memberName: string
    type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'DAY_PASS' | 'TRIAL'
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PAUSED'
    startDate: string
    endDate: string | null
    priceMonthly: number
    deposit: number | null
    cancellationDate: string | null
    cancellationReason: string | null
    notes: string | null
    createdBy: string
    createdByName: string
    createdAt: Date
}

export interface CheckIn {
    id: string
    memberId: string
    memberName: string
    checkInAt: Date
    checkOutAt: Date | null
}

const memberSchema = z.object({
    firstName: z.string().min(1, 'Vorname ist erforderlich'),
    lastName: z.string().min(1, 'Nachname ist erforderlich'),
    email: z.string().email('Ungültige E-Mail').nullable().optional().or(z.literal('')),
    phone: z.string().nullable().optional().or(z.literal('')),
    dateOfBirth: z.string().nullable().optional(),
    address: z.string().nullable().optional().or(z.literal('')),
    notes: z.string().nullable().optional().or(z.literal('')),
    emergencyContactName: z.string().nullable().optional().or(z.literal('')),
    emergencyContactPhone: z.string().nullable().optional().or(z.literal('')),
})

const contractSchema = z.object({
    memberId: z.string().min(1, 'Mitglied ist erforderlich'),
    type: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'DAY_PASS', 'TRIAL']),
    startDate: z.string().min(1, 'Startdatum ist erforderlich'),
    endDate: z.string().nullable().optional(),
    priceMonthly: z.number().min(0, 'Preis muss positiv sein'),
    deposit: z.number().min(0).nullable().optional(),
    notes: z.string().nullable().optional().or(z.literal('')),
})

// ---- Members ----

export async function getMembers(search?: string) {
    const user = await requireUser()
    let q = `SELECT
      m.id, m.studio_id as "studioId", m.first_name as "firstName", m.last_name as "lastName",
      m.email, m.phone, m.date_of_birth as "dateOfBirth", m.address, m.notes,
      m.emergency_contact_name as "emergencyContactName", m.emergency_contact_phone as "emergencyContactPhone",
      m.is_active as "isActive", m.created_at as "createdAt"
    FROM members m WHERE m.studio_id = $1 AND m.is_active = true`
    const params: any[] = [user.studioId]
    if (search) {
        q += ` AND (m.first_name ILIKE $2 OR m.last_name ILIKE $2 OR m.email ILIKE $2)`
        params.push(`%${search}%`)
    }
    q += ` ORDER BY m.last_name, m.first_name`
    return await query<Member>(q, params)
}

export async function getMember(id: string) {
    const user = await requireUser()
    const r = await query<Member>(
        `SELECT m.* FROM members m WHERE m.id = $1 AND m.studio_id = $2`,
        [id, user.studioId])
    if (!r.length) throw new Error('Mitglied nicht gefunden')
    return r[0]
}

export async function createMember(data: any) {
    const user = await requireUser()
    const v = memberSchema.parse(data)
    const r = await query(
        `INSERT INTO members (studio_id, first_name, last_name, email, phone, date_of_birth, address, notes, emergency_contact_name, emergency_contact_phone)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [user.studioId, v.firstName, v.lastName, v.email || null, v.phone || null,
            v.dateOfBirth || null, v.address || null, v.notes || null,
            v.emergencyContactName || null, v.emergencyContactPhone || null])
    await logAction(user.studioId, user.id, 'create', 'member', r[0].id, null, v)
    revalidatePath('/contracts')
    return { success: true, id: r[0].id }
}

export async function updateMember(id: string, data: any) {
    const user = await requireUser()
    const v = memberSchema.parse(data)
    await query(
        `UPDATE members SET first_name=$1, last_name=$2, email=$3, phone=$4, date_of_birth=$5, address=$6, notes=$7, emergency_contact_name=$8, emergency_contact_phone=$9
     WHERE id=$10 AND studio_id=$11`,
        [v.firstName, v.lastName, v.email || null, v.phone || null, v.dateOfBirth || null,
            v.address || null, v.notes || null, v.emergencyContactName || null, v.emergencyContactPhone || null,
            id, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

export async function deleteMember(id: string) {
    const user = await requireStudioleiter()
    await query(`UPDATE members SET is_active=false WHERE id=$1 AND studio_id=$2`, [id, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

// ---- Contracts ----

export async function getContracts(filters?: { status?: string; search?: string }) {
    const user = await requireUser()
    let q = `SELECT
      c.id, c.studio_id as "studioId", c.member_id as "memberId",
      (m.first_name || ' ' || m.last_name) as "memberName",
      c.type, c.status, c.start_date as "startDate", c.end_date as "endDate",
      c.price_monthly as "priceMonthly", c.deposit,
      c.cancellation_date as "cancellationDate", c.cancellation_reason as "cancellationReason",
      c.notes, c.created_by as "createdBy",
      COALESCE(au.name, u.display_name, 'Unbekannt') as "createdByName",
      c.created_at as "createdAt"
    FROM contracts c
    JOIN members m ON m.id = c.member_id
    LEFT JOIN "user" au ON au.id = c.created_by
    LEFT JOIN users u ON u.id = c.created_by
    WHERE c.studio_id = $1`
    const params: any[] = [user.studioId]
    let i = 2
    if (filters?.status) {
        q += ` AND c.status = $${i}::contract_status`
        params.push(filters.status)
        i++
    }
    if (filters?.search) {
        q += ` AND (m.first_name ILIKE $${i} OR m.last_name ILIKE $${i} OR m.email ILIKE $${i})`
        params.push(`%${filters.search}%`)
    }
    q += ` ORDER BY c.created_at DESC`
    return await query<Contract>(q, params)
}

export async function createContract(data: any) {
    const user = await requireUser()
    const v = contractSchema.parse(data)
    const r = await query(
        `INSERT INTO contracts (studio_id, member_id, type, start_date, end_date, price_monthly, deposit, notes, created_by)
     VALUES ($1,$2,$3::contract_type,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [user.studioId, v.memberId, v.type, v.startDate, v.endDate || null,
            v.priceMonthly, v.deposit || null, v.notes || null, user.id])
    await logAction(user.studioId, user.id, 'create', 'contract', r[0].id, null, v)
    revalidatePath('/contracts')
    return { success: true, id: r[0].id }
}

export async function cancelContract(id: string, reason?: string) {
    const user = await requireUser()
    await query(
        `UPDATE contracts SET status='CANCELLED'::contract_status, cancellation_date=CURRENT_DATE, cancellation_reason=$1
     WHERE id=$2 AND studio_id=$3`,
        [reason || null, id, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

export async function pauseContract(id: string) {
    const user = await requireUser()
    await query(`UPDATE contracts SET status='PAUSED'::contract_status WHERE id=$1 AND studio_id=$2`, [id, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

export async function reactivateContract(id: string) {
    const user = await requireUser()
    await query(`UPDATE contracts SET status='ACTIVE'::contract_status WHERE id=$1 AND studio_id=$2`, [id, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

// ---- Check-ins ----

export async function checkInMember(memberId: string) {
    const user = await requireUser()
    await query(
        `INSERT INTO check_ins (studio_id, member_id) VALUES ($1, $2)`,
        [user.studioId, memberId])
    revalidatePath('/contracts')
    return { success: true }
}

export async function checkOutMember(memberId: string) {
    const user = await requireUser()
    await query(
        `UPDATE check_ins SET check_out_at = NOW()
     WHERE member_id = $1 AND studio_id = $2 AND check_out_at IS NULL`,
        [memberId, user.studioId])
    revalidatePath('/contracts')
    return { success: true }
}

export async function getRecentCheckIns(limit: number = 20) {
    const user = await requireUser()
    return await query<CheckIn>(
        `SELECT ci.id, ci.member_id as "memberId",
      (m.first_name || ' ' || m.last_name) as "memberName",
      ci.check_in_at as "checkInAt", ci.check_out_at as "checkOutAt"
    FROM check_ins ci JOIN members m ON m.id = ci.member_id
    WHERE ci.studio_id = $1
    ORDER BY ci.check_in_at DESC LIMIT $2`,
        [user.studioId, limit])
}

// ---- Analytics ----

export async function getContractAnalytics() {
    const user = await requireUser()
    const [statusDist, revenue, typeDist, checkInStats] = await Promise.all([
        query(`SELECT status, COUNT(*)::int as count FROM contracts WHERE studio_id=$1 GROUP BY status`, [user.studioId]),
        query(`SELECT COALESCE(SUM(price_monthly),0)::float as monthly_revenue FROM contracts WHERE studio_id=$1 AND status='ACTIVE'`, [user.studioId]),
        query(`SELECT type, COUNT(*)::int as count FROM contracts WHERE studio_id=$1 AND status='ACTIVE' GROUP BY type`, [user.studioId]),
        query(`SELECT DATE(check_in_at) as day, COUNT(*)::int as count FROM check_ins WHERE studio_id=$1 AND check_in_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`, [user.studioId]),
    ])
    return {
        activeContracts: statusDist.filter((s: any) => s.status === 'ACTIVE').reduce((a: number, s: any) => a + s.count, 0),
        monthlyRevenue: revenue[0]?.monthly_revenue || 0,
        statusDist,
        typeDist,
        checkInStats,
    }
}
