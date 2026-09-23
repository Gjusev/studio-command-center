import { getMachines } from '@/app/actions/machines'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MachineActions } from '@/components/machines/machine-actions'

export default async function MachinesPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const user = await getUserWithPermissions()
    const canCreate = user.role === 'studioleiter' || user.permissions.includes('machines.create')
    const canDelete = user.role === 'studioleiter' || user.permissions.includes('machines.delete')

    const params = await searchParams
    const machines = await getMachines({
        search: params.search,
        status: params.status,
    })

    const operationalCount = machines.filter(m => m.status === 'IN_SERVICE').length
    const outOfServiceCount = machines.filter(m => m.status === 'OUT_OF_SERVICE').length

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'IN_SERVICE':
                return (
                    <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border">
                        <span className="w-2 h-2 rounded-full bg-primary neon-dot-green"></span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Aktiv</span>
                    </span>
                )
            case 'OUT_OF_SERVICE':
                return (
                    <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-destructive/30">
                        <span className="w-2 h-2 rounded-full bg-destructive neon-dot-red"></span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Außer Betrieb</span>
                    </span>
                )
            case 'MAINTENANCE':
                return (
                    <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-yellow-400/30">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 neon-dot-yellow"></span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Wartung</span>
                    </span>
                )
            default:
                return <span>{status}</span>
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-foreground text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight">Maschinen</h1>
                    <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Studio-Ausstattung und Wartungsstatus</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {canCreate && (
                    <>
                    <Link
                        href="/machines/maintenance"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-xs sm:text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                        <span className="hidden sm:inline">Wartung planen</span>
                        <span className="sm:hidden">Wartung</span>
                    </Link>
                    <Button asChild size="sm" className="shadow-lg shadow-primary/30">
                        <Link href="/machines/new">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span className="hidden sm:inline">Neue Maschine</span>
                            <span className="sm:hidden">Neu</span>
                        </Link>
                    </Button>
                    </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <StatCard
                    title="Gesamt Assets"
                    value={machines.length}
                    icon={<span className="material-symbols-outlined">inventory_2</span>}
                />
                <StatCard
                    title="Operativ"
                    value={operationalCount}
                    icon={<span className="material-symbols-outlined text-primary">check_circle</span>}
                />
                <StatCard
                    title="Reparatur"
                    value={outOfServiceCount}
                    icon={<span className="material-symbols-outlined text-destructive">warning</span>}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center justify-between bg-muted/50 p-2 rounded-xl border border-border">
                <form action="/machines" className="relative w-full lg:w-96 group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
                        search
                    </span>
                    <Input
                        name="search"
                        type="search"
                        placeholder="Suche..."
                        className="pl-10 bg-background border-input focus:border-primary"
                    />
                </form>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto">
                    <Link
                        href="/machines"
                        className="flex whitespace-nowrap items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium"
                    >
                        Alle
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </Link>
                    <Link
                        href="?status=IN_SERVICE"
                        className="flex whitespace-nowrap items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-background border border-border text-muted-foreground text-xs sm:text-sm font-medium hover:text-foreground hover:border-muted-foreground transition-colors"
                    >
                        Aktiv
                    </Link>
                    <Link
                        href="?status=MAINTENANCE"
                        className="flex whitespace-nowrap items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-background border border-border text-muted-foreground text-xs sm:text-sm font-medium hover:text-foreground hover:border-muted-foreground transition-colors"
                    >
                        Wartung
                    </Link>
                    <Link
                        href="?status=OUT_OF_SERVICE"
                        className="flex whitespace-nowrap items-center gap-2 h-9 px-3 sm:px-4 rounded-lg bg-background border border-border text-muted-foreground text-xs sm:text-sm font-medium hover:text-foreground hover:border-muted-foreground transition-colors"
                    >
                        Defekt
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {machines.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-border bg-card p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-muted-foreground">search_off</span>
                            <p className="text-foreground text-lg font-semibold">Keine Maschinen gefunden</p>
                        </div>
                    </div>
                ) : (
                    machines.map((machine) => {
                        const isOutOfService = machine.status === 'OUT_OF_SERVICE'
                        const isMaintenance = machine.status === 'MAINTENANCE'
                        const borderColor = isOutOfService
                            ? 'hover:border-destructive/30'
                            : isMaintenance
                            ? 'hover:border-yellow-400/30'
                            : 'hover:border-primary/30'
                        const shadowColor = isOutOfService
                            ? 'shadow-[0_4px_20px_rgba(239,68,68,0.1)]'
                            : isMaintenance
                            ? 'shadow-[0_4px_20px_rgba(234,179,8,0.1)]'
                            : 'shadow-[0_4px_20px_rgba(25,230,94,0.1)]'

                        return (
                            <Link
                                key={machine.id}
                                href={`/machines/${machine.id}`}
                                className={`group flex flex-col bg-card rounded-xl overflow-hidden border border-border ${borderColor} ${shadowColor} transition-all duration-300 transform hover:-translate-y-1`}
                            >
                                <div className="relative h-36 sm:h-48 w-full bg-background">
                                    <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                                         style={{
                                             backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop')`,
                                             ...(isOutOfService && { filter: 'grayscale(100%)' })
                                         }}
                                    ></div>
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(machine.status)}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-4 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-lg font-bold group-hover:text-primary transition-colors ${
                                                isOutOfService ? 'group-hover:text-destructive' :
                                                isMaintenance ? 'group-hover:text-yellow-400' :
                                                ''
                                            }`}>
                                                {machine.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">ID: #{machine.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <MachineActions id={machine.id} name={machine.name} canDelete={canDelete} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="flex flex-col gap-1 p-2 rounded bg-background border border-border">
                                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                                Kategorie
                                            </span>
                                            <span className="text-xs text-foreground font-medium">
                                                {machine.categoryName || '-'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-2 rounded bg-background border border-border">
                                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                                Standort
                                            </span>
                                            <span className="text-xs text-foreground font-medium">
                                                {machine.locationName || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    {machine.nextServiceOn && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Nächste Wartung:</span>
                                            <span className={
                                                new Date(machine.nextServiceOn) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                    ? 'text-destructive font-bold'
                                                    : 'text-foreground font-medium'
                                            }>
                                                {new Date(machine.nextServiceOn).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>

            {machines.length > 0 && (
                <div className="border-t border-border pt-4 pb-2">
                    <p className="text-muted-foreground text-sm">
                        {machines.length} Maschine{machines.length !== 1 ? 'n' : ''} gesamt
                    </p>
                </div>
            )}
        </div>
    )
}
