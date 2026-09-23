import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getPayments } from '@/app/actions/finances'
import { getMembers } from '@/app/actions/contracts'
import PaymentsPageClient from './page-client'

export default async function PaymentsPageWrapper() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('finances.view')) {
        redirect('/dashboard')
    }
    const [payments, members] = await Promise.all([getPayments({}), getMembers()])
    return (
        <PaymentsPageClient
            initialPayments={payments.map(p => ({ ...p, amount: Number(p.amount) }))}
            members={members.map(m => ({ id: m.id, firstName: m.firstName, lastName: m.lastName }))}
        />
    )
}
