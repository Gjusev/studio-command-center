import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getFinancialSummary, getExpensesByCategory, getPayments } from '@/app/actions/finances'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function FinancesPage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('finances.view')) {
        redirect('/dashboard')
    }

    const [summary, expensesByCategory, recentPayments] = await Promise.all([
        getFinancialSummary(),
        getExpensesByCategory(),
        getPayments({ status: 'PENDING' }),
    ])

    const profit = summary.revenueThisMonth - summary.expensesThisMonth

    const categoryLabels: Record<string, string> = {
        RENT: 'Miete', EQUIPMENT: 'Geräte', SUPPLIES: 'Material', SALARY: 'Gehälter',
        MARKETING: 'Marketing', INSURANCE: 'Versicherung', UTILITIES: 'Nebenkosten',
        SOFTWARE: 'Software', OTHER: 'Sonstiges',
    }
    const categoryColors: Record<string, string> = {
        RENT: 'bg-blue-500', EQUIPMENT: 'bg-purple-500', SUPPLIES: 'bg-green-500', SALARY: 'bg-yellow-500',
        MARKETING: 'bg-pink-500', INSURANCE: 'bg-red-500', UTILITIES: 'bg-orange-500',
        SOFTWARE: 'bg-cyan-500', OTHER: 'bg-gray-500',
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">Finanzen</h1>
                    <p className="text-sm text-muted-foreground">Übersicht über Einnahmen, Ausgaben und Zahlungen</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    {user.role === 'studioleiter' && (
                        <>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/finances/payments">
                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                    <span className="hidden sm:inline">Zahlungen</span>
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="shadow-lg shadow-primary/20">
                                <Link href="/finances/expenses">
                                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                    <span className="hidden sm:inline">Ausgaben</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    title="Einnahmen"
                    value={`${summary.revenueThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined text-green-500">trending_up</span>}
                />
                <StatCard
                    title="Ausgaben"
                    value={`${summary.expensesThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined text-red-500">trending_down</span>}
                />
                <StatCard
                    title="Gewinn / Verlust"
                    value={`${profit.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined text-primary">account_balance</span>}
                />
                <StatCard
                    title="Offene Zahlungen"
                    value={`${summary.pendingPayments.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined text-orange-400">pending</span>}
                />
            </div>

            {/* Monthly trend */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/50">
                    <h3 className="font-bold text-foreground text-sm md:text-base">Monatliche Übersicht</h3>
                </div>
                <div className="p-4 md:p-6">
                    <div className="space-y-3">
                        {summary.monthlyData.slice(-6).map((m: any) => {
                            const maxVal = Math.max(m.revenue, m.expenses, 1)
                            return (
                                <div key={m.month} className="flex items-center gap-2 sm:gap-4">
                                    <span className="text-xs sm:text-sm text-muted-foreground w-12 sm:w-20 flex-shrink-0">{m.month}</span>
                                    <div className="flex-1 flex flex-col sm:flex-row gap-1 sm:gap-1 items-stretch sm:items-center min-w-0">
                                        <div className="h-5 sm:h-6 rounded bg-green-500/30 border border-green-500/50 flex items-center px-2"
                                            style={{ width: `${Math.max((m.revenue / maxVal) * 100, 2)}%` }}>
                                            <span className="text-[10px] sm:text-xs font-medium text-green-500 whitespace-nowrap">{m.revenue.toFixed(0)} €</span>
                                        </div>
                                        <div className="h-5 sm:h-6 rounded bg-red-500/30 border border-red-500/50 flex items-center px-2"
                                            style={{ width: `${Math.max((m.expenses / maxVal) * 100, 2)}%` }}>
                                            <span className="text-[10px] sm:text-xs font-medium text-red-500 whitespace-nowrap">{m.expenses.toFixed(0)} €</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex gap-4 sm:gap-6 mt-4 pt-3 sm:pt-4 border-t border-border">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500/30 border border-green-500/50" /><span className="text-[10px] sm:text-xs text-muted-foreground">Einnahmen</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500/30 border border-red-500/50" /><span className="text-[10px] sm:text-xs text-muted-foreground">Ausgaben</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Pending Payments */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/50 flex justify-between items-center">
                        <h3 className="font-bold text-foreground text-sm">Offene Zahlungen</h3>
                        <span className="bg-orange-400/10 text-orange-400 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-orange-400/20">{recentPayments.length}</span>
                    </div>
                    {recentPayments.length === 0 ? (
                        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm">Keine offene Zahlungen</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentPayments.slice(0, 8).map(p => (
                                <div key={p.id} className="flex items-center justify-between px-4 md:px-6 py-3 hover:bg-muted/30 transition-colors">
                                    <div className="min-w-0 mr-3">
                                        <p className="text-sm font-medium text-foreground truncate">{p.memberName || p.description || 'Allgemein'}</p>
                                        {p.dueDate && <p className="text-xs text-muted-foreground">Fällig: {new Date(p.dueDate).toLocaleDateString('de-DE')}</p>}
                                    </div>
                                    <span className="font-bold text-foreground text-sm flex-shrink-0">{Number(p.amount).toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expenses by Category */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-muted/50">
                        <h3 className="font-bold text-foreground text-sm">Ausgaben nach Kategorie</h3>
                    </div>
                    {expensesByCategory.length === 0 ? (
                        <div className="p-4 md:p-6 text-center text-muted-foreground text-sm">Keine Ausgaben diesen Monat</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {expensesByCategory.map((cat: any) => (
                                <div key={cat.category} className="flex items-center gap-3 sm:gap-4 px-4 md:px-6 py-3">
                                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${categoryColors[cat.category] || 'bg-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{categoryLabels[cat.category] || cat.category}</p>
                                        <p className="text-xs text-muted-foreground">{cat.count} Einträge</p>
                                    </div>
                                    <span className="font-bold text-foreground text-sm flex-shrink-0">{parseFloat(cat.total).toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
