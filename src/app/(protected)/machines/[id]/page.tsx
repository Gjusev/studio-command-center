import { getMachine, getMachineEvents } from '@/app/actions/machines'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'
import { MachineActions } from '@/components/machines/machine-actions'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; variant: 'default' | 'outline' | 'destructive'; color: string }> = {
    IN_SERVICE: { label: 'Operativ', variant: 'default', color: 'text-green-500' },
    OUT_OF_SERVICE: { label: 'Außer Betrieb', variant: 'destructive', color: 'text-destructive' },
    MAINTENANCE: { label: 'Wartung', variant: 'outline', color: 'text-yellow-500' },
}

const typeLabels: Record<string, { label: string; icon: string }> = {
    MAINTENANCE: { label: 'Wartung', icon: 'build' },
    INCIDENT: { label: 'Vorfall', icon: 'warning' },
    INSPECTION: { label: 'Inspektion', icon: 'search' },
}

export default async function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithPermissions()
    const canEdit = user.role === 'studioleiter' || user.permissions.includes('machines.edit')
    const canDelete = user.role === 'studioleiter' || user.permissions.includes('machines.delete')

    let machine
    try { machine = await getMachine(id) } catch { notFound() }

    const events = await getMachineEvents(id, 30)
    const sc = statusConfig[machine.status] || statusConfig.IN_SERVICE

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/machines" className="hover:text-foreground transition-colors">Maschinen</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-foreground font-medium">{machine.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px] text-muted-foreground">fitness_center</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{machine.name}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                            {machine.brand && <span className="text-sm text-muted-foreground">{machine.brand} {machine.model}</span>}
                        </div>
                    </div>
                </div>
                {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                        <MachineActions id={machine.id} name={machine.name} canDelete={canDelete} />
                        {canEdit && (
                        <Link href={`/machines/${id}/edit`}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Bearbeiten
                        </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Kategorie" value={machine.categoryName || '-'} icon={<span className="material-symbols-outlined">category</span>} />
                <StatCard title="Standort" value={machine.locationName || '-'} icon={<span className="material-symbols-outlined">location_on</span>} />
                <StatCard title="Letzte Wartung" value={machine.lastServiceOn ? new Date(machine.lastServiceOn).toLocaleDateString('de-DE') : '-'} icon={<span className="material-symbols-outlined">build</span>} />
                <StatCard title="Nächste Wartung" value={machine.nextServiceOn ? new Date(machine.nextServiceOn).toLocaleDateString('de-DE') : '-'} icon={<span className="material-symbols-outlined">calendar_today</span>} />
            </div>

            {/* Details */}
            <Panel title="Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                    {machine.serialNo && (
                        <div><p className="text-xs text-muted-foreground">Seriennummer</p><p className="text-sm font-medium">{machine.serialNo}</p></div>
                    )}
                    {machine.purchasedOn && (
                        <div><p className="text-xs text-muted-foreground">Kaufdatum</p><p className="text-sm font-medium">{new Date(machine.purchasedOn).toLocaleDateString('de-DE')}</p></div>
                    )}
                    {machine.purchaseCost != null && (
                        <div><p className="text-xs text-muted-foreground">Kaufpreis</p><p className="text-sm font-medium">{Number(machine.purchaseCost).toFixed(2)} €</p></div>
                    )}
                    <div><p className="text-xs text-muted-foreground">Erstellt</p><p className="text-sm font-medium">{new Date(machine.createdAt).toLocaleDateString('de-DE')}</p></div>
                </div>
                {machine.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Notizen</p>
                        <p className="text-sm text-foreground">{machine.notes}</p>
                    </div>
                )}
            </Panel>

            {/* Events History */}
            <Panel title={`Ereignisse (${events.length})`}>
                {/* Desktop */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Typ</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Beschreibung</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Kosten</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Datum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Keine Ereignisse</td></tr>
                            ) : events.map(e => {
                                const tc = typeLabels[e.type] || typeLabels.INSPECTION
                                return (
                                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3">
                                            <span className="flex items-center gap-1.5 text-sm">
                                                <span className="material-symbols-outlined text-[16px]">{tc.icon}</span>
                                                {tc.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-foreground max-w-xs truncate">{e.description}</td>
                                        <td className="px-6 py-3 text-sm">{e.cost != null ? `${Number(e.cost).toFixed(2)} €` : '-'}</td>
                                        <td className="px-6 py-3"><Badge variant={e.status === 'OPEN' ? 'destructive' : 'default'}>{e.status === 'OPEN' ? 'Offen' : 'Geschlossen'}</Badge></td>
                                        <td className="px-6 py-3 text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleDateString('de-DE')}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Mobile */}
                <div className="md:hidden space-y-2">
                    {events.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Keine Ereignisse</div>
                    ) : events.map(e => {
                        const tc = typeLabels[e.type] || typeLabels.INSPECTION
                        return (
                            <div key={e.id} className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[16px]">{tc.icon}</span>
                                        {tc.label}
                                    </span>
                                    <Badge variant={e.status === 'OPEN' ? 'destructive' : 'default'} className="text-[10px]">{e.status === 'OPEN' ? 'Offen' : 'Geschlossen'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{new Date(e.createdAt).toLocaleDateString('de-DE')}</span>
                                    {e.cost != null && <span>{Number(e.cost).toFixed(2)} €</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Panel>
        </div>
    )
}
