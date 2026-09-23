import { getEmployees, getEmployeePerformanceStats } from '@/app/actions/employees'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/ui/stat-card'
import { Panel } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { EmployeeActions } from '@/components/employees/employee-actions'
import { InviteUserDialog } from '@/components/employees/invite-user-dialog'
import Link from 'next/link'

export default async function EmployeesPage() {
    const user = await getUserWithPermissions()
    const isStudioleiter = user.role === 'studioleiter'
    if (!isStudioleiter && !user.permissions.includes('employees.view')) {
        redirect('/dashboard')
    }

    const [employees, stats] = await Promise.all([
        getEmployees(),
        isStudioleiter ? getEmployeePerformanceStats() : Promise.resolve([]),
    ])

    const statsMap = new Map(
        stats.map((s: any) => [s.id, { totalTasks: Number(s.totalTasks) || 0, totalPoints: Number(s.totalPoints) || 0 }])
    )

    // Compute KPIs with proper number casting
    const topPerformer = stats.length > 0 ? stats[0] : null
    const teamTotalPoints = stats.reduce((sum: number, s: any) => sum + (Number(s.totalPoints) || 0), 0)

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mitarbeiter</h1>
                    <p className="text-sm text-muted-foreground">
                        Teamverwaltung und Performance
                    </p>
                </div>
                {isStudioleiter && <InviteUserDialog />}
            </div>

            {isStudioleiter && stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <StatCard
                        title="Gesamt Mitarbeiter"
                        value={employees.length}
                        icon={<span className="material-symbols-outlined">group</span>}
                    />
                    <StatCard
                        title="Top Performer"
                        value={topPerformer ? `${topPerformer.displayName} (${Number(topPerformer.totalPoints) || 0} Pkt)` : '-'}
                        icon={<span className="material-symbols-outlined">emoji_events</span>}
                    />
                    <StatCard
                        title="Team Punkte"
                        value={teamTotalPoints}
                        icon={<span className="material-symbols-outlined">groups</span>}
                    />
                </div>
            )}

            <Panel title="Teamübersicht">
                {/* Desktop table */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Rolle
                                </th>
                                {isStudioleiter && (
                                    <>
                                        <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                            Aufgaben
                                        </th>
                                        <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                            Punkte
                                        </th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        Keine Mitarbeiter gefunden
                                    </td>
                                </tr>
                            ) : (
                                employees.map((employee) => {
                                    const empStats = statsMap.get(employee.id)
                                    return (
                                        <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <Link
                                                    href={`/employees/${employee.id}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {employee.displayName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.userEmail ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-muted-foreground text-[16px]">email</span>
                                                        {employee.userEmail}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Nicht verbunden</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={employee.role === 'studioleiter' ? 'default' : 'outline'}>
                                                    {employee.role === 'studioleiter' ? 'Studioleiter' : 'Mitarbeiter'}
                                                </Badge>
                                            </td>
                                            {isStudioleiter && (
                                                <>
                                                    <td className="px-6 py-4 text-foreground">
                                                        {empStats?.totalTasks || 0}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge>{empStats?.totalPoints || 0} Punkte</Badge>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-6 py-4">
                                                {isStudioleiter ? (
                                                    <EmployeeActions
                                                        employeeId={employee.id}
                                                        userId={employee.userId}
                                                        employeeName={employee.displayName}
                                                        currentRole={employee.role}
                                                        isActive={employee.isActive}
                                                    />
                                                ) : (
                                                    <Badge
                                                        variant={employee.isActive ? 'default' : 'outline'}
                                                        className={
                                                            employee.isActive
                                                                ? 'border border-primary/20 bg-primary/10 text-primary'
                                                                : 'border border-destructive/20 bg-destructive/10 text-destructive'
                                                        }
                                                    >
                                                        {employee.isActive ? 'Aktiv' : 'Inaktiv'}
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden space-y-2">
                    {employees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Keine Mitarbeiter gefunden</div>
                    ) : employees.map((employee) => {
                        const empStats = statsMap.get(employee.id)
                        return (
                            <div key={employee.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                                <div className="flex items-center justify-between">
                                    <Link href={`/employees/${employee.id}`} className="font-medium text-foreground text-sm hover:text-primary transition-colors">
                                        {employee.displayName}
                                    </Link>
                                    <Badge variant={employee.role === 'studioleiter' ? 'default' : 'outline'} className="text-[10px]">
                                        {employee.role === 'studioleiter' ? 'Leiter' : 'Mitarbeiter'}
                                    </Badge>
                                </div>
                                {employee.userEmail && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">email</span>
                                        {employee.userEmail}
                                    </p>
                                )}
                                {isStudioleiter && empStats && (
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                        <span>{empStats.totalTasks} Aufgaben</span>
                                        <span>{empStats.totalPoints} Punkte</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Panel>
        </div>
    )
}
