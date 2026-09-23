import { getConsumable, getMovements } from '@/app/actions/consumables'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { MovementForm } from '@/components/consumables/movement-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ConsumableDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getUserWithPermissions()
    const canEdit = user.role === 'studioleiter' || user.permissions.includes('consumables.edit')
    const { id } = await params

    let consumable
    try {
        consumable = await getConsumable(id)
    } catch {
        notFound()
    }

    const movements = await getMovements(id, 20)

    const isOutOfStock = consumable.stockCurrent === 0
    const isLowStock = consumable.stockCurrent <= consumable.stockMin && !isOutOfStock

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
                        <Link href="/consumables" className="hover:text-foreground transition-colors">Verbrauchsmaterialien</Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-foreground">{consumable.name}</span>
                    </div>
                    <h1 className="text-3xl font-black text-foreground">{consumable.name}</h1>
                    <p className="text-muted-foreground mt-1">{consumable.categoryName || 'Ohne Kategorie'}</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/consumables">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Zurück
                        </Link>
                    </Button>
                    {canEdit && (
                        <Button asChild>
                            <Link href={`/consumables/${id}/edit`}>
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Bearbeiten
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Aktueller Bestand</p>
                    <p className={`text-2xl font-bold mt-1 ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-orange-400' : 'text-foreground'}`}>
                        {consumable.stockCurrent} {consumable.unit}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Mindestbestand</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{consumable.stockMin} {consumable.unit}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Stückpreis</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                        {consumable.unitCost ? `${Number(consumable.unitCost).toFixed(2)} €` : '-'}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Status</p>
                    <div className="mt-2">
                        {isOutOfStock ? (
                            <Badge variant="destructive">Ausverkauft</Badge>
                        ) : isLowStock ? (
                            <Badge variant="outline" className="border-yellow-400/20 text-yellow-400 bg-yellow-400/10">Niedrig</Badge>
                        ) : (
                            <Badge variant="default">Verfügbar</Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-muted/50">
                        <h3 className="font-bold text-foreground">Details</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {consumable.locationName && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Standort</span>
                                <span className="text-sm font-medium text-foreground">{consumable.locationName}</span>
                            </div>
                        )}
                        {consumable.supplierName && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Lieferant</span>
                                <span className="text-sm font-medium text-foreground">{consumable.supplierName}</span>
                            </div>
                        )}
                        {consumable.expiresOn && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ablaufdatum</span>
                                <span className="text-sm font-medium text-foreground">
                                    {new Date(consumable.expiresOn).toLocaleDateString('de-DE')}
                                </span>
                            </div>
                        )}
                        {consumable.notes && (
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Notizen</span>
                                <p className="text-sm text-foreground bg-background p-3 rounded-lg border border-border">
                                    {consumable.notes}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-sm text-muted-foreground">Erstellt</span>
                            <span className="text-sm text-foreground">
                                {new Date(consumable.createdAt).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Movement Form + History */}
                <div className="lg:col-span-2 space-y-6">
                    <MovementForm consumableId={id} currentStock={consumable.stockCurrent} />

                    {/* Movement History */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/50">
                            <h3 className="font-bold text-foreground">Bewegungsverlauf</h3>
                        </div>
                        {movements.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <span className="material-symbols-outlined text-3xl block mb-2">history</span>
                                Noch keine Bewegungen erfasst
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {movements.map((m) => {
                                    const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
                                        IN: { icon: 'add_circle', color: 'text-green-500', label: 'Eingang' },
                                        OUT: { icon: 'remove_circle', color: 'text-orange-500', label: 'Ausgang' },
                                        ADJUST: { icon: 'sync', color: 'text-blue-500', label: 'Korrektur' },
                                        WASTE: { icon: 'delete', color: 'text-red-500', label: 'Ausschuss' },
                                    }
                                    const cfg = typeConfig[m.type] || typeConfig.IN
                                    return (
                                        <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                            <span className={`material-symbols-outlined ${cfg.color}`}>{cfg.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {m.type === 'ADJUST' ? `→ ${m.stockAfter}` : `× ${m.quantity}`}
                                                    </span>
                                                </div>
                                                {m.reason && (
                                                    <p className="text-xs text-muted-foreground truncate">{m.reason}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm">
                                                <span className="text-muted-foreground">{m.stockBefore} → {m.stockAfter}</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(m.createdAt).toLocaleDateString('de-DE')} {m.createdByName && `· ${m.createdByName}`}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
