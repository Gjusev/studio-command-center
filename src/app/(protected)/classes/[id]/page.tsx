import { getClassSchedule, getClassBookings } from '@/app/actions/classes'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'
import { CancelClassButton } from './cancel-button'
import Link from 'next/link'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithPermissions()
    const canManage = user.role === 'studioleiter' || user.permissions.includes('classes.manage')

    const schedule = await getClassSchedule()
    const cls = schedule.find((s: any) => s.id === id)
    if (!cls) notFound()

    const bookings = await getClassBookings(id)
    const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed')
    const waitlistBookings = bookings.filter((b: any) => b.status === 'waitlist')
    const occupancy = cls.maxCapacity > 0 ? Math.round((cls.currentBookings / cls.maxCapacity) * 100) : 0

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/classes" className="hover:text-foreground transition-colors">Kursplanung</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-foreground font-medium">{cls.classTypeName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cls.classTypeColor}20` }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ color: cls.classTypeColor }}>fitness_center</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{cls.title || cls.classTypeName}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" style={{ borderColor: cls.classTypeColor, color: cls.classTypeColor }}>{cls.classTypeName}</Badge>
                            {cls.isCancelled && <Badge variant="destructive">Abgesagt</Badge>}
                            {cls.trainerName && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">person</span>{cls.trainerName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {canManage && !cls.isCancelled && <CancelClassButton classId={id} />}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Datum" value={new Date(cls.startTime).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} icon={<span className="material-symbols-outlined">calendar_today</span>} />
                <StatCard title="Uhrzeit" value={`${new Date(cls.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${new Date(cls.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`} icon={<span className="material-symbols-outlined">schedule</span>} />
                <StatCard title="Belegung" value={`${cls.currentBookings}/${cls.maxCapacity}`} icon={<span className="material-symbols-outlined">groups</span>} />
                <StatCard title="Auslastung" value={`${occupancy}%`} icon={<span className="material-symbols-outlined">pie_chart</span>} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Belegung</span>
                    <span className="text-sm text-muted-foreground">{cls.currentBookings} / {cls.maxCapacity} Platze</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(occupancy, 100)}%`, backgroundColor: occupancy > 90 ? 'var(--destructive)' : occupancy > 70 ? '#f59e0b' : 'var(--lime)' }} />
                </div>
            </div>

            <Panel title={`Teilnehmer (${confirmedBookings.length})`}>
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead><tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Mitglied</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Gebucht am</th>
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                            {confirmedBookings.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Keine Buchungen</td></tr>
                            ) : confirmedBookings.map((b: any) => (
                                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3 text-sm font-medium">{b.memberName}</td>
                                    <td className="px-6 py-3"><Badge variant="default">Bestatigt</Badge></td>
                                    <td className="px-6 py-3 text-sm text-muted-foreground">{new Date(b.bookedAt).toLocaleString('de-DE')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="md:hidden space-y-2">
                    {confirmedBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Keine Buchungen</div>
                    ) : confirmedBookings.map((b: any) => (
                        <div key={b.id} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                            <div><p className="font-medium text-sm">{b.memberName}</p><p className="text-xs text-muted-foreground">{new Date(b.bookedAt).toLocaleDateString('de-DE')}</p></div>
                            <Badge variant="default" className="text-[10px]">Bestatigt</Badge>
                        </div>
                    ))}
                </div>
            </Panel>

            {waitlistBookings.length > 0 && (
                <Panel title={`Warteliste (${waitlistBookings.length})`}>
                    <div className="space-y-2">
                        {waitlistBookings.map((b: any, i: number) => (
                            <div key={b.id} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                                    <span className="text-sm font-medium">{b.memberName}</span>
                                </div>
                                <Badge variant="outline" className="text-[10px]">Warteliste</Badge>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {cls.notes && (
                <Panel title="Notizen"><p className="text-sm text-muted-foreground">{cls.notes}</p></Panel>
            )}
        </div>
    )
}
