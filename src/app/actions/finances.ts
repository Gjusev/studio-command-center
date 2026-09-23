'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import { query } from '@/lib/db'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface Payment {
    id: string
    studioId: string
    memberId: string | null
    memberName: string | null
    contractId: string | null
    amount: number
    method: string
    status: string
    dueDate: string | null
    paidAt: Date | null
    description: string | null
    invoiceNumber: string | null
    createdAt: Date
}

export interface Expense {
    id: string
    studioId: string
    category: string
    amount: number
    description: string
    expenseDate: string
    supplierId: string | null
    supplierName: string | null
    receiptUrl: string | null
    createdAt: Date
}

// --- Payments ---

export async function getPayments(filters?: { status?: string; method?: string; dateFrom?: string; dateTo?: string }) {
    const user = await requireUser()
    const params: any[] = [user.studioId]
    let filter = ''
    let idx = 2

    if (filters?.status) { filter += ` AND p.status = $${idx}`; params.push(filters.status); idx++ }
    if (filters?.method) { filter += ` AND p.method = $${idx}`; params.push(filters.method); idx++ }
    if (filters?.dateFrom) { filter += ` AND p.due_date >= $${idx}`; params.push(filters.dateFrom); idx++ }
    if (filters?.dateTo) { filter += ` AND p.due_date <= $${idx}`; params.push(filters.dateTo); idx++ }

    return await query<Payment>(
        `SELECT p.id, p.studio_id as "studioId", p.member_id as "memberId",
        CONCAT(m.first_name, ' ', m.last_name) as "memberName",
        p.contract_id as "contractId", p.amount, p.method::text as method, p.status::text as status,
        p.due_date as "dueDate", p.paid_at as "paidAt", p.description, p.invoice_number as "invoiceNumber", p.created_at as "createdAt"
    FROM payments p
    LEFT JOIN members m ON m.id = p.member_id
    WHERE p.studio_id = $1${filter}
    ORDER BY p.due_date DESC NULLS LAST, p.created_at DESC`,
        params
    )
}

export async function createPayment(data: {
    memberId?: string; contractId?: string; amount: number; method?: string;
    status?: string; dueDate?: string; description?: string
}) {
    const user = await requireStudioleiter()
    const result = await query(
        `INSERT INTO payments (studio_id, member_id, contract_id, amount, method, status, due_date, description, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [user.studioId, data.memberId || null, data.contractId || null, data.amount,
            data.method || 'SEPA', data.status || 'PENDING', data.dueDate || null,
            data.description || null, user.id]
    )
    await logAction(user.studioId, user.id, 'create', 'payment', result[0].id, null, data)
    revalidatePath('/finances')
    return { success: true, id: result[0].id }
}

export async function updatePaymentStatus(id: string, status: string) {
    const user = await requireStudioleiter()
    const paidAt = status === 'PAID' ? 'NOW()' : null
    await query(
        `UPDATE payments SET status = $1::payment_status, paid_at = ${paidAt ? 'NOW()' : 'paid_at'}, updated_at = NOW() WHERE id = $2 AND studio_id = $3`,
        [status, id, user.studioId]
    )
    await logAction(user.studioId, user.id, 'update', 'payment', id, null, { status })
    revalidatePath('/finances')
    return { success: true }
}

// --- Expenses ---

export async function getExpenses(filters?: { category?: string; dateFrom?: string; dateTo?: string }) {
    const user = await requireUser()
    const params: any[] = [user.studioId]
    let filter = ''
    let idx = 2

    if (filters?.category) { filter += ` AND e.category = $${idx}`; params.push(filters.category); idx++ }
    if (filters?.dateFrom) { filter += ` AND e.expense_date >= $${idx}`; params.push(filters.dateFrom); idx++ }
    if (filters?.dateTo) { filter += ` AND e.expense_date <= $${idx}`; params.push(filters.dateTo); idx++ }

    return await query<Expense>(
        `SELECT e.id, e.studio_id as "studioId", e.category::text as category, e.amount, e.description,
        e.expense_date as "expenseDate", e.supplier_id as "supplierId", sup.name as "supplierName",
        e.receipt_url as "receiptUrl", e.created_at as "createdAt"
    FROM expenses e
    LEFT JOIN suppliers sup ON sup.id = e.supplier_id
    WHERE e.studio_id = $1${filter}
    ORDER BY e.expense_date DESC`,
        params
    )
}

export async function createExpense(data: {
    category: string; amount: number; description: string; expenseDate?: string;
    supplierId?: string; receiptUrl?: string
}) {
    const user = await requireStudioleiter()
    const result = await query(
        `INSERT INTO expenses (studio_id, category, amount, description, expense_date, supplier_id, receipt_url, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [user.studioId, data.category, data.amount, data.description,
            data.expenseDate || new Date().toISOString().split('T')[0],
            data.supplierId || null, data.receiptUrl || null, user.id]
    )
    await logAction(user.studioId, user.id, 'create', 'expense', result[0].id, null, data)
    revalidatePath('/finances')
    return { success: true, id: result[0].id }
}

export async function deleteExpense(id: string) {
    const user = await requireStudioleiter()
    await query(`DELETE FROM expenses WHERE id = $1 AND studio_id = $2`, [id, user.studioId])
    await logAction(user.studioId, user.id, 'delete', 'expense', id, null, null)
    revalidatePath('/finances')
    return { success: true }
}

// --- Financial Summary ---

export async function getFinancialSummary() {
    const user = await requireUser()

    const [revenue, expenses, pending, overdue, monthly] = await Promise.all([
        query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE studio_id = $1 AND status = 'PAID' AND paid_at >= DATE_TRUNC('month', CURRENT_DATE)`, [user.studioId]),
        query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE studio_id = $1 AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)`, [user.studioId]),
        query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE studio_id = $1 AND status = 'PENDING'`, [user.studioId]),
        query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE studio_id = $1 AND status = 'OVERDUE'`, [user.studioId]),
        query(`SELECT
        TO_CHAR(d.month, 'YYYY-MM') as month,
        COALESCE(r.total, 0) as revenue,
        COALESCE(e.total, 0) as expenses
      FROM (
        SELECT generate_series(DATE_TRUNC('month', NOW()) - INTERVAL '11 months', DATE_TRUNC('month', NOW()), INTERVAL '1 month') as month
      ) d
      LEFT JOIN (SELECT DATE_TRUNC('month', paid_at) as month, SUM(amount)::float as total FROM payments WHERE studio_id = $1 AND status = 'PAID' GROUP BY month) r ON r.month = d.month
      LEFT JOIN (SELECT DATE_TRUNC('month', expense_date) as month, SUM(amount)::float as total FROM expenses WHERE studio_id = $1 GROUP BY month) e ON e.month = d.month
      ORDER BY d.month`, [user.studioId]),
    ])

    return {
        revenueThisMonth: revenue[0]?.total || 0,
        expensesThisMonth: expenses[0]?.total || 0,
        pendingPayments: pending[0]?.total || 0,
        overduePayments: overdue[0]?.total || 0,
        monthlyData: monthly.map((m: any) => ({
            month: m.month,
            revenue: parseFloat(m.revenue) || 0,
            expenses: parseFloat(m.expenses) || 0,
        })),
    }
}

export async function getExpensesByCategory() {
    const user = await requireUser()
    return await query(
        `SELECT category::text as category, SUM(amount)::float as total, COUNT(*)::int as count
     FROM expenses WHERE studio_id = $1 AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)
     GROUP BY category ORDER BY total DESC`,
        [user.studioId]
    )
}
