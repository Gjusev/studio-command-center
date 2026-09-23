import { getEmployee, getEmployeePerformanceStats } from '@/app/actions/employees'
import { getPermissionsForUser } from '@/app/actions/permissions'
import { getCompletedTasks } from '@/app/actions/tasks'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'
import { PermissionsEditor } from '@/components/employees/permissions-editor'
import Link from 'next/link'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithPermissions()

    let employee
    try { employee = await getEmployee(id) } catch { notFound() }

    const [completedTasks, allStats, employeePermissions] = await Promise.all([
        getCompletedTasks(),
        user.role === 'studioleiter' ? getEmployeePerformanceStats(employee.userId) : Promise.resolve([]),
        user.role === 'studioleiter' && employee.role === 'mitarbeiter'
            ? getPermissionsForUser(employee.userId)
            : Promise.resolve([]),
    ])

    const myTasks = completedTasks.filter((t: any) => t.completedBy === employee.displayName)
    const empStats = allStats.length > 0 ? allStats[0] : null
    const totalPoints = Number(empStats?.totalPoints) || 0
    const totalTasks = Number(empStats?.totalTasks) || 0
    const recentTasks = myTasks.slice(0, 20)

    // Points over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dayStr = d.toISOString().split('T')[0]
        const dayPoints = myTasks
            .filter((t: any) => new Date(t.completedAt).toISOString().split('T')[0] === dayStr)
            .reduce((sum: number, t: any) => sum + (Number(t.points) || 0), 0)
        return { date: d.toLocaleDateString('de-DE', { weekday: 'short' }), points: dayPoints }
    })
    const maxPoints = Math.max(...last7Days.map(d => d.points), 1)

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/employees" className="hover:text-foreground transition-colors">Team</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-foreground font-medium">{employee.displayName}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--lime)]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px] text-[var(--lime)]">person</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{employee.displayName}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={employee.role === 'studioleiter' ? 'default' : 'outline'}>
                                {employee.role === 'studioleiter' ? 'Studioleiter' : 'Mitarbeiter'}
                            </Badge>
                            {employee.userEmail && <span className="text-sm text-muted-foreground">{employee.userEmail}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard title="Erledigte Aufgaben" value={totalTasks} icon={<span className="material-symbols-outlined">task_alt</span>} />
                <StatCard title="Gesamtpunkte" value={totalPoints} icon={<span className="material-symbols-outlined">emoji_events</span>} />
                <StatCard title="Mitglied seit" value={new Date(employee.createdAt).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })} icon={<span className="material-symbols-outlined">calendar_today</span>} />
            </div>

            {/* Activity chart */}
            <Panel title="Aktivität (letzte 7 Tage)">
                <div className="flex items-end gap-2 h-32">
                    {last7Days.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-muted rounded-sm relative" style={{ height: '100px' }}>
                                <div className="absolute bottom-0 w-full rounded-sm bg-[var(--lime)]/60 transition-all"
                                    style={{ height: `${(d.points / maxPoints) * 100}%`, minHeight: d.points > 0 ? '4px' : '0px' }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{d.date}</span>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* Recent tasks */}
            <Panel title="Letzte erledigte Aufgaben">
                {/* Desktop */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Aufgabe</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Erledigt am</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Punkte</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentTasks.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Keine Aufgaben erledigt</td></tr>
                            ) : recentTasks.map((t: any) => (
                                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3 text-sm font-medium text-foreground">{t.taskTitle}</td>
                                    <td className="px-6 py-3 text-sm text-muted-foreground">{new Date(t.completedAt).toLocaleString('de-DE')}</td>
                                    <td className="px-6 py-3"><Badge>{t.points} Pkt</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile */}
                <div className="md:hidden space-y-2">
                    {recentTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Keine Aufgaben erledigt</div>
                    ) : recentTasks.map((t: any) => (
                        <div key={t.id} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{t.taskTitle}</p>
                                <p className="text-xs text-muted-foreground">{new Date(t.completedAt).toLocaleDateString('de-DE')}</p>
                            </div>
                            <Badge className="text-[10px] flex-shrink-0">{t.points} Pkt</Badge>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* Permissions - only for mitarbeiter, only visible to studioleiter */}
            {user.role === 'studioleiter' && employee.role === 'mitarbeiter' && employee.userId && (
                <PermissionsEditor
                    userId={employee.userId}
                    displayName={employee.displayName}
                    currentPermissions={employeePermissions}
                />
            )}
        </div>
    )
}
