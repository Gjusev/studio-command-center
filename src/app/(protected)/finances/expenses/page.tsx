import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getExpenses } from '@/app/actions/finances'
import { getSuppliers } from '@/app/actions/suppliers'
import ExpensesPageClient from './page-client'

export default async function ExpensesPageWrapper() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('finances.view')) {
        redirect('/dashboard')
    }
    const [expenses, suppliers] = await Promise.all([getExpenses({}), getSuppliers()])
    return (
        <ExpensesPageClient
            initialExpenses={expenses.map(e => ({ ...e, amount: Number(e.amount) }))}
            suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
        />
    )
}
