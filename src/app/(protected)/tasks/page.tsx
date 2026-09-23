import { getMyTasks, getAllStats, getCompletedTasks } from '@/app/actions/tasks'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { StatCard } from '@/components/ui/stat-card'
import { Panel } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CompleteTaskButton } from '@/components/tasks/complete-task-button'
import Link from 'next/link'

export default async function TasksPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const user = await getUserWithPermissions()
    const isStudioleiter = user.role === 'studioleiter'
    const canAssign = isStudioleiter || user.permissions.includes('tasks.assign')
    const canManageTemplates = isStudioleiter || user.permissions.includes('tasks.manage_templates')

    const params = await searchParams
    const activeTab = params.tab || (isStudioleiter ? 'overview' : 'my-tasks')

    const [myTasks, allStats, completedTasks] = await Promise.all([
        getMyTasks(),
        isStudioleiter ? getAllStats() : Promise.resolve([]),
        getCompletedTasks(),
    ])

    const myStats = {
        totalTasks: myTasks.length,
        completedLastWeek: completedTasks.filter(t => {
            const completedAt = new Date(t.completedAt)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return completedAt > weekAgo
        }).length,
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mitarbeiter Performance</h1>
                    <p className="text-sm text-muted-foreground">
                        Aufgabenverwaltung und Leistungsübersicht
                    </p>
                </div>
                {(canAssign || canManageTemplates) && (
                    <div className="flex gap-2">
                        {canManageTemplates && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/tasks/templates/new">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                <span className="hidden sm:inline">Neue Vorlage</span>
                                <span className="sm:hidden">Vorlage</span>
                            </Link>
                        </Button>
                        )}
                        {canAssign && (
                        <Button size="sm" asChild>
                            <Link href="/tasks/assign">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                <span className="hidden sm:inline">Aufgabe zuweisen</span>
                                <span className="sm:hidden">Zuweisen</span>
                            </Link>
                        </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <StatCard
                    title="Offene Aufgaben"
                    value={myTasks.length}
                    icon={<span className="material-symbols-outlined">check_circle</span>}
                />
                <StatCard
                    title="Woche erledigt"
                    value={myStats.completedLastWeek}
                    trend={{ value: '+2', positive: true }}
                    icon={<span className="material-symbols-outlined">trending_up</span>}
                />
                {isStudioleiter && allStats.length > 0 && (
                    <StatCard
                        title="Top Performer"
                        value={allStats[0].totalPoints}
                        icon={<span className="material-symbols-outlined">emoji_events</span>}
                    />
                )}
            </div>

            {/* Tab navigation */}
            {isStudioleiter && (
                <div className="flex gap-2 border-b border-border pb-0">
                    <Link href="/tasks?tab=overview"
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === 'overview' ? 'border-[var(--lime)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        <span className="material-symbols-outlined text-[16px] align-middle mr-1">groups</span>
                        Team Übersicht
                    </Link>
                    <Link href="/tasks?tab=my-tasks"
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === 'my-tasks' ? 'border-[var(--lime)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        <span className="material-symbols-outlined text-[16px] align-middle mr-1">task_alt</span>
                        Meine Aufgaben
                    </Link>
                </div>
            )}

            {activeTab === 'my-tasks' && (
                <Panel title="Meine Aufgaben">
                    {/* Desktop table */}
                    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Aufgabe
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Beschreibung
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Fälligkeitsdatum
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Punkte
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Aktion
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {myTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Keine offenen Aufgaben
                                        </td>
                                    </tr>
                                ) : (
                                    myTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {task.taskTitle}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {task.taskDescription || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.dueDate ? (
                                                    <span className={
                                                        new Date(task.dueDate) < new Date()
                                                            ? 'text-destructive'
                                                            : ''
                                                    }>
                                                        {new Date(task.dueDate).toLocaleDateString('de-DE')}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge>{task.taskPoints} Punkte</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <CompleteTaskButton
                                                    assignmentId={task.id}
                                                    taskTemplateId={task.taskTemplateId}
                                                    taskTitle={task.taskTitle}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {myTasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Keine offenen Aufgaben</div>
                        ) : myTasks.map((task) => (
                            <div key={task.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-foreground text-sm">{task.taskTitle}</p>
                                    <Badge className="text-[10px] flex-shrink-0">{task.taskPoints} Pkt</Badge>
                                </div>
                                {task.taskDescription && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.taskDescription}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    {task.dueDate ? (
                                        <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                            Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                                        </span>
                                    ) : <span />}
                                    <CompleteTaskButton
                                        assignmentId={task.id}
                                        taskTemplateId={task.taskTemplateId}
                                        taskTitle={task.taskTitle}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {isStudioleiter && activeTab === 'overview' && (
                <Panel title="Team Performance">
                    {/* Desktop table */}
                    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Mitarbeiter
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Erledigte Aufgaben
                                    </th>
                                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        Gesamtpunkte
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {allStats.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                            Keine Performance-Daten verfügbar
                                        </td>
                                    </tr>
                                ) : (
                                    allStats.map((stat) => (
                                        <tr key={stat.userId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {stat.userName}
                                            </td>
                                            <td className="px-6 py-4 text-foreground">
                                                {stat.totalTasks}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge>{stat.totalPoints} Punkte</Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {allStats.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Keine Performance-Daten verfügbar</div>
                        ) : allStats.map((stat) => (
                            <div key={stat.userId} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground text-sm">{stat.userName}</p>
                                    <p className="text-xs text-muted-foreground">{stat.totalTasks} Aufgaben</p>
                                </div>
                                <Badge>{stat.totalPoints} Punkte</Badge>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            <Panel title="Kürzlich erledigt">
                {/* Desktop table */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Aufgabe
                                </th>
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Mitarbeiter
                                </th>
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Erledigt am
                                </th>
                                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    Punkte
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {completedTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        Noch keine Aufgaben erledigt
                                    </td>
                                </tr>
                            ) : (
                                completedTasks.slice(0, 10).map((task) => (
                                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {task.taskTitle}
                                        </td>
                                        <td className="px-6 py-4 text-foreground">
                                            {task.completedBy}
                                        </td>
                                        <td className="px-6 py-4 text-foreground">
                                            {new Date(task.completedAt).toLocaleDateString('de-DE')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge>{task.points} Punkte</Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden space-y-2">
                    {completedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Noch keine Aufgaben erledigt</div>
                    ) : completedTasks.slice(0, 10).map((task) => (
                        <div key={task.id} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">{task.taskTitle}</p>
                                <p className="text-xs text-muted-foreground">{task.completedBy} · {new Date(task.completedAt).toLocaleDateString('de-DE')}</p>
                            </div>
                            <Badge className="text-[10px] flex-shrink-0">{task.points} Pkt</Badge>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    )
}
