import { getConsumables } from '@/app/actions/consumables'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ConsumableActions } from '@/components/consumables/consumable-actions'

export default async function ConsumablesPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; lowStock?: string }>
}) {
    const user = await getUserWithPermissions()
    const canCreate = user.role === 'studioleiter' || user.permissions.includes('consumables.create')
    const canEdit = user.role === 'studioleiter' || user.permissions.includes('consumables.edit')
    const canDelete = user.role === 'studioleiter' || user.permissions.includes('consumables.delete')

    const params = await searchParams
    const consumables = await getConsumables({
        search: params.search,
        lowStock: params.lowStock === 'true',
    })

    const lowStockCount = consumables.filter(c => c.stockCurrent <= c.stockMin).length
    const outOfStockCount = consumables.filter(c => c.stockCurrent === 0).length

    const getStatusBadge = (item: typeof consumables[0]) => {
        const isOutOfStock = item.stockCurrent === 0
        const isLowStock = item.stockCurrent <= item.stockMin

        if (isOutOfStock) {
            return (
                <Badge variant="destructive">
                    Ausverkauft
                </Badge>
            )
        }
        if (isLowStock) {
            return (
                <Badge variant="outline" className="border-yellow-400/20 text-yellow-400 bg-yellow-400/10">
                    Niedrig
                </Badge>
            )
        }
        return (
            <Badge variant="default">
                Verfügbar
            </Badge>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        <span>Inventar</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-foreground">Verbrauchsmaterialien</span>
                    </div>
                    <h1 className="text-foreground text-2xl md:text-4xl font-black leading-tight tracking-tight">
                        Verbrauchsmaterialien
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Verwalten Sie Ihr Inventar, überwachen Sie Bestandslevels und Bestellungen
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {(canCreate || canEdit) && (
                    <Link
                        href="/consumables/settings"
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span className="hidden sm:inline">Einstellungen</span>
                    </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <StatCard
                    title="Gesamt Artikel"
                    value={consumables.length}
                    icon={<span className="material-symbols-outlined">inventory</span>}
                />
                <StatCard
                    title="Niedriger Bestand"
                    value={lowStockCount}
                    icon={<span className="material-symbols-outlined text-orange-400">warning</span>}
                />
                <StatCard
                    title="Kein Bestand"
                    value={outOfStockCount}
                    icon={<span className="material-symbols-outlined text-destructive">error</span>}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-xl">
                    <form action="/consumables" className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <Input
                            name="search"
                            type="search"
                            placeholder="Suche..."
                            className="pl-10"
                            defaultValue={params.search || ''}
                        />
                    </form>
                    <Link
                        href={params.lowStock === 'true' ? '/consumables' : '/consumables?lowStock=true'}
                        className={`px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors border ${params.lowStock === 'true' ? 'bg-[var(--lime)] text-black border-[var(--lime)]' : 'border-border text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">warning</span>
                        Niedrig ({lowStockCount})
                    </Link>
                </div>
                {canCreate && (
                <Button asChild size="sm" className="shadow-lg shadow-primary/20">
                    <Link href="/consumables/new">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span className="truncate">Neuer Artikel</span>
                    </Link>
                </Button>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[25%]">
                                Artikel
                            </th>
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[15%]">
                                Kategorie
                            </th>
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[15%]">
                                Standort
                            </th>
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[10%]">
                                Bestand
                            </th>
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[10%]">
                                Min. Bestand
                            </th>
                            <th className="px-6 py-4 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[10%]">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right text-muted-foreground text-xs font-semibold uppercase tracking-wider w-[5%]">
                                Aktionen
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {consumables.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="material-symbols-outlined text-4xl">search_off</span>
                                        <p>Keine Verbrauchsmaterialien gefunden</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            consumables.map((item) => (
                                <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/consumables/${item.id}`}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-muted-foreground">
                                                    inventory_2
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">
                                                    {item.name}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-md bg-card px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                                            {item.categoryName || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground text-sm">
                                        {item.locationName || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-foreground text-sm font-medium">
                                        {formatNumber(item.stockCurrent)} {item.unit}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground text-sm">
                                        {formatNumber(item.stockMin)} {item.unit}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ConsumableActions id={item.id} name={item.name} canDelete={canDelete} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {consumables.length > 0 && (
                    <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3 sm:px-6">
                        <p className="text-sm text-muted-foreground">
                            Zeige <span className="font-medium text-foreground">1</span> bis{' '}
                            <span className="font-medium text-foreground">{consumables.length}</span> von{' '}
                            <span className="font-medium text-foreground">{consumables.length}</span> Ergebnissen
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
                {consumables.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                        <p className="text-sm">Keine Verbrauchsmaterialien gefunden</p>
                    </div>
                ) : consumables.map((item) => (
                    <Link
                        key={item.id}
                        href={`/consumables/${item.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/20 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
                                inventory_2
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                {getStatusBadge(item)}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">{item.categoryName || '-'}</span>
                                <span className={`text-xs font-medium ${item.stockCurrent <= item.stockMin ? (item.stockCurrent === 0 ? 'text-destructive' : 'text-orange-400') : 'text-foreground'}`}>
                                    {formatNumber(item.stockCurrent)} {item.unit}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
