import { requireUser } from '@/lib/auth/guards'
import { getLowStockItems } from '@/app/actions/consumables'
import { getMachineStats } from '@/app/actions/machines'
import { getMyTasks } from '@/app/actions/tasks'
import { getContractAnalytics } from '@/app/actions/contracts'
import { getFinancialSummary } from '@/app/actions/finances'
import { StatCard } from '@/components/ui/stat-card'
import { Panel } from '@/components/ui/panel'
import { CompleteTaskButton } from '@/components/tasks/complete-task-button'
import Link from 'next/link'

export default async function DashboardPage() {
    const user = await requireUser()

    const [lowStockItems, machineStats, myTasks, contractAnalytics, financialSummary] = await Promise.all([
        getLowStockItems(),
        getMachineStats(),
        getMyTasks(),
        getContractAnalytics(),
        getFinancialSummary(),
    ])

    const profit = financialSummary.revenueThisMonth - financialSummary.expensesThisMonth

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                    <p className="text-[11px] font-display font-semibold uppercase tracking-[0.2em] text-[var(--lime)] mb-1">Dashboard</p>
                    <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                        Willkommen, <span className="text-gradient-lime">{user.displayName}</span>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-display">
                    {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    title="Aktive Mitglieder"
                    value={contractAnalytics.activeContracts}
                    icon={<span className="material-symbols-outlined">groups</span>}
                    accent
                />
                <StatCard
                    title="Monatl. Einnahmen"
                    value={`${contractAnalytics.monthlyRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined">trending_up</span>}
                    accent
                />
                <StatCard
                    title="Gewinn / Verlust"
                    value={`${profit.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined">account_balance</span>}
                />
                <StatCard
                    title="Meine Aufgaben"
                    value={myTasks.length}
                    icon={<span className="material-symbols-outlined">badge</span>}
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    title="Kritische Bestände"
                    value={lowStockItems.length}
                    icon={<span className="material-symbols-outlined">inventory_2</span>}
                />
                <StatCard
                    title="Außer Betrieb"
                    value={`${machineStats.outOfService} / ${machineStats.total}`}
                    icon={<span className="material-symbols-outlined">build</span>}
                />
                <StatCard
                    title="Offene Incidents"
                    value={machineStats.openIncidents}
                    icon={<span className="material-symbols-outlined">report_problem</span>}
                />
                <StatCard
                    title="Offene Zahlungen"
                    value={`${financialSummary.pendingPayments.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`}
                    icon={<span className="material-symbols-outlined">pending</span>}
                />
            </div>

            {/* Charts + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {/* Financial Trend */}
                <Panel
                    className="lg:col-span-2"
                    title="Finanzieller Verlauf"
                    accent
                >
                    <div className="space-y-2">
                        {financialSummary.monthlyData.slice(-6).map((m: any) => {
                            const maxVal = Math.max(...financialSummary.monthlyData.map((d: any) => Math.max(d.revenue, d.expenses)), 1)
                            return (
                                <div key={m.month} className="flex items-center gap-2 sm:gap-3">
                                    <span className="font-display text-[10px] sm:text-[11px] text-muted-foreground w-10 sm:w-14 flex-shrink-0 font-medium">{m.month}</span>
                                    <div className="flex-1 flex gap-1 items-center min-w-0">
                                        <div className="h-6 rounded-sm bg-[var(--lime)]/15 border border-[var(--lime)]/20 flex items-center px-1.5 sm:px-2.5 transition-all min-w-0"
                                            style={{ width: `${Math.max((m.revenue / maxVal) * 100, 4)}%` }}>
                                            <span className="text-[9px] sm:text-[10px] font-display font-bold text-[var(--lime)] whitespace-nowrap">{m.revenue > 0 ? `${m.revenue.toFixed(0)}€` : ''}</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-display w-12 sm:w-16 text-right flex-shrink-0">{m.expenses > 0 ? `-${m.expenses.toFixed(0)}€` : ''}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex gap-4 mt-4 pt-3 border-t border-border">
                        <span className="text-[10px] text-muted-foreground font-display flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm bg-[var(--lime)]/30 inline-block" /> Einnahmen
                        </span>
                        <span className="text-[10px] text-muted-foreground font-display">| Ausgaben rechts</span>
                    </div>
                </Panel>

                {/* Alerts */}
                <Panel title="Alerts">
                    <div className="space-y-2">
                        {lowStockItems.length > 0 && (
                            <Link href="/consumables?lowStock=true" className="flex items-center gap-3 p-3 rounded-md bg-card border border-border hover:border-orange-500/40 transition-all group">
                                <div className="status-dot status-dot-yellow" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-display text-[13px] font-bold text-foreground">{lowStockItems.length} kritische Bestände</p>
                                    <p className="text-[11px] text-muted-foreground">Verbrauchsmaterialien nachbestellen</p>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-muted-foreground group-hover:text-foreground transition-colors">chevron_right</span>
                            </Link>
                        )}
                        {machineStats.outOfService > 0 && (
                            <Link href="/machines?status=OUT_OF_SERVICE" className="flex items-center gap-3 p-3 rounded-md bg-card border border-border hover:border-destructive/40 transition-all group">
                                <div className="status-dot status-dot-red" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-display text-[13px] font-bold text-foreground">{machineStats.outOfService} Maschinen defekt</p>
                                    <p className="text-[11px] text-muted-foreground">Reparatur erforderlich</p>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-muted-foreground group-hover:text-foreground transition-colors">chevron_right</span>
                            </Link>
                        )}
                        {financialSummary.pendingPayments > 0 && (
                            <Link href="/finances/payments" className="flex items-center gap-3 p-3 rounded-md bg-card border border-border hover:border-yellow-500/40 transition-all group">
                                <div className="status-dot status-dot-yellow" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-display text-[13px] font-bold text-foreground">Offene Zahlungen</p>
                                    <p className="text-[11px] text-muted-foreground">{financialSummary.pendingPayments.toFixed(0)} € ausstehend</p>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-muted-foreground group-hover:text-foreground transition-colors">chevron_right</span>
                            </Link>
                        )}
                        {machineStats.openIncidents > 0 && (
                            <Link href="/machines" className="flex items-center gap-3 p-3 rounded-md bg-card border border-border hover:border-red-500/40 transition-all group">
                                <div className="status-dot status-dot-red" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-display text-[13px] font-bold text-foreground">{machineStats.openIncidents} offene Incidents</p>
                                    <p className="text-[11px] text-muted-foreground">Maschinen-Störungen</p>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-muted-foreground group-hover:text-foreground transition-colors">chevron_right</span>
                            </Link>
                        )}
                        {lowStockItems.length === 0 && machineStats.outOfService === 0 && financialSummary.pendingPayments === 0 && machineStats.openIncidents === 0 && (
                            <div className="text-center py-6">
                                <div className="status-dot status-dot-green mx-auto mb-3" />
                                <p className="font-display text-sm font-bold">Alles im Grünen Bereich</p>
                                <p className="text-[11px] text-muted-foreground mt-1">Keine offenen Alerts</p>
                            </div>
                        )}
                    </div>
                </Panel>
            </div>

            {/* Low stock + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {lowStockItems.length > 0 && (
                    <Panel
                        title={
                            <div className="flex items-center justify-between w-full">
                                <span>Kritische Bestände</span>
                                <span className="bg-[var(--lime)]/10 text-[var(--lime)] text-[10px] font-display font-bold px-2 py-0.5 rounded-sm">
                                    {lowStockItems.length}
                                </span>
                            </div>
                        }
                    >
                        <div className="space-y-2">
                            {lowStockItems.slice(0, 5).map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/consumables/${item.id}`}
                                    className="flex items-center justify-between p-3 rounded-md bg-background border border-border hover:border-[var(--lime)]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-8 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-[var(--lime)] transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display text-[13px] font-bold text-foreground truncate">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.categoryName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className={item.stockCurrent === 0 ? "text-destructive font-display font-bold text-[13px]" : "font-display font-bold text-[13px] text-foreground"}>
                                            {item.stockCurrent} {item.unit}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Min: {item.stockMin}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {lowStockItems.length > 5 && (
                            <Link
                                href="/consumables?lowStock=true"
                                className="mt-4 block text-center font-display text-[12px] font-bold text-[var(--lime)] hover:text-[var(--lime-dark)] transition-colors uppercase tracking-wider"
                            >
                                Alle {lowStockItems.length} anzeigen →
                            </Link>
                        )}
                    </Panel>
                )}

                {myTasks.length > 0 && (
                    <Panel
                        className="lg:col-span-2"
                        title={
                            <div className="flex items-center justify-between w-full">
                                <span>Meine Aufgaben</span>
                                <span className="bg-[var(--lime)]/10 text-[var(--lime)] text-[10px] font-display font-bold px-2 py-0.5 rounded-sm">
                                    {myTasks.length}
                                </span>
                            </div>
                        }
                    >
                        <div className="space-y-2">
                            {myTasks.slice(0, 5).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-background border border-border hover:border-[var(--lime)]/20 transition-all group gap-2 sm:gap-0"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="size-8 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-[var(--lime)] transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display text-[13px] font-bold text-foreground group-hover:text-[var(--lime)] transition-colors truncate">{task.taskTitle}</p>
                                            {task.taskDescription && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {task.taskDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-11 sm:ml-0">
                                        {task.dueDate && (
                                            <p className="text-[11px] text-muted-foreground font-display">
                                                {new Date(task.dueDate).toLocaleDateString('de-DE')}
                                            </p>
                                        )}
                                        <span className="bg-[var(--lime)]/10 text-[var(--lime)] text-[10px] font-display font-bold px-2 py-0.5 rounded-sm">
                                            {task.taskPoints} Pkt
                                        </span>
                                        <CompleteTaskButton
                                            assignmentId={task.id}
                                            taskTemplateId={task.taskTemplateId}
                                            taskTitle={task.taskTitle}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {myTasks.length > 5 && (
                            <Link
                                href="/tasks"
                                className="mt-4 block text-center font-display text-[12px] font-bold text-[var(--lime)] hover:text-[var(--lime-dark)] transition-colors uppercase tracking-wider"
                            >
                                Alle {myTasks.length} Aufgaben anzeigen →
                            </Link>
                        )}
                    </Panel>
                )}
            </div>

            {/* Empty state */}
            {lowStockItems.length === 0 && myTasks.length === 0 && (
                <div className="rounded-lg border border-border bg-card p-10 md:p-16 text-center">
                    <div className="status-dot status-dot-green mx-auto mb-4" style={{ width: 16, height: 16 }} />
                    <h3 className="font-display text-lg font-bold mb-2">Alles im Grünen Bereich!</h3>
                    <p className="text-sm text-muted-foreground">
                        Keine kritischen Bestände oder offenen Aufgaben.
                    </p>
                </div>
            )}
        </div>
    )
}
