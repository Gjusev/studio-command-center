import { getContracts, getContractAnalytics, getMembers, getRecentCheckIns } from '@/app/actions/contracts'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { StatCard } from '@/components/ui/stat-card'
import { Panel } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContractActions } from '@/components/contracts/contract-actions'
import { CheckInPanel } from '@/components/contracts/check-in-panel'
import Link from 'next/link'

export default async function ContractsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; tab?: string; search?: string }>
}) {
    const user = await getUserWithPermissions()
    const canManage = user.role === 'studioleiter' || user.permissions.includes('contracts.manage')
    const _params = await searchParams
    const params = _params
    const activeTab = params.tab || 'contracts'

    const [contracts, members, analytics, checkIns] = await Promise.all([
        getContracts({ status: params.status, search: params.search }),
        getMembers(params.search),
        getContractAnalytics(),
        getRecentCheckIns(15),
    ])

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Aktiv'
            case 'EXPIRED': return 'Abgelaufen'
            case 'CANCELLED': return 'Storniert'
            case 'PAUSED': return 'Pausiert'
            default: return status
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge variant="default">Aktiv</Badge>
            case 'EXPIRED': return <Badge variant="outline">Abgelaufen</Badge>
            case 'CANCELLED': return <Badge variant="destructive">Storniert</Badge>
            case 'PAUSED': return <Badge variant="secondary">Pausiert</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MONTHLY': return 'Monatlich'
            case 'QUARTERLY': return 'Vierteljährlich'
            case 'YEARLY': return 'Jährlich'
            case 'DAY_PASS': return 'Tageskarte'
            case 'TRIAL': return 'Probe'
            default: return type
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mitglieder & Verträge</h1>
                    <p className="text-sm text-muted-foreground">Verwaltung von Mitgliedern, Verträgen und Check-ins</p>
                </div>
                {canManage && (
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                        <Link href="/contracts/new-member">
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            <span className="hidden sm:inline">Neues Mitglied</span>
                            <span className="sm:hidden">Mitglied</span>
                        </Link>
                    </Button>
                    <Button size="sm" className="text-xs" asChild>
                        <Link href="/contracts/new-contract">
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            <span className="hidden sm:inline">Neuer Vertrag</span>
                            <span className="sm:hidden">Vertrag</span>
                        </Link>
                    </Button>
                </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                <StatCard
                    title="Aktive Verträge"
                    value={analytics.activeContracts}
                    icon={<span className="material-symbols-outlined">description</span>}
                />
                <StatCard
                    title="Monatlicher Umsatz"
                    value={`${analytics.monthlyRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0 })}€`}
                    icon={<span className="material-symbols-outlined">payments</span>}
                />
                <StatCard
                    title="Mitglieder"
                    value={members.length}
                    icon={<span className="material-symbols-outlined">group</span>}
                />
                <StatCard
                    title="Check-ins (30 Tage)"
                    value={analytics.checkInStats.reduce((a: number, c: any) => a + c.count, 0)}
                    icon={<span className="material-symbols-outlined">login</span>}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 border-b border-border pb-2 overflow-x-auto">
                {['contracts', 'members', 'checkins'].map(tab => (
                    <Link
                        key={tab}
                        href={`/contracts?tab=${tab}`}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                            activeTab === tab
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {tab === 'contracts' ? 'Verträge' : tab === 'members' ? 'Mitglieder' : 'Check-ins'}
                    </Link>
                ))}
            </div>

            {/* Search bar for contracts and members */}
            {(activeTab === 'contracts' || activeTab === 'members') && (
                <form className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <Input
                            name="search"
                            type="search"
                            defaultValue={params.search || ''}
                            placeholder={activeTab === 'contracts' ? 'Name oder E-Mail suchen...' : 'Mitglied suchen...'}
                            className="pl-10"
                        />
                    </div>
                    <input type="hidden" name="tab" value={activeTab} />
                    <Button type="submit" size="sm" variant="outline">
                        <span className="material-symbols-outlined text-[16px]">search</span>
                    </Button>
                    {params.search && (
                        <Link href={`/contracts?tab=${activeTab}`} className="flex items-center px-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Clear
                        </Link>
                    )}
                </form>
            )}

            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
                <Panel title="Alle Verträge">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        {[null, 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED'].map(s => (
                            <Link
                                key={s || 'all'}
                                href={`/contracts?tab=contracts${s ? `&status=${s}` : ''}`}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
                                    (params.status || '') === (s || '')
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {s ? getStatusLabel(s) : 'Alle'}
                            </Link>
                        ))}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Mitglied</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Typ</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Zeitraum</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Preis/Monat</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {contracts.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Keine Verträge vorhanden</td></tr>
                                ) : contracts.map(c => (
                                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{c.memberName}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{getTypeLabel(c.type)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(c.startDate).toLocaleDateString('de-DE')}
                                            {c.endDate && ` – ${new Date(c.endDate).toLocaleDateString('de-DE')}`}
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-medium">
                                            {c.priceMonthly.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ContractActions contractId={c.id} status={c.status} canManage={canManage} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {contracts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Keine Verträge vorhanden</div>
                        ) : contracts.map(c => (
                            <div key={c.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground text-sm">{c.memberName}</span>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(c.status)}
                                        <ContractActions contractId={c.id} status={c.status} canManage={canManage} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{getTypeLabel(c.type)}</span>
                                    <span className="font-medium text-foreground">{c.priceMonthly.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(c.startDate).toLocaleDateString('de-DE')}
                                    {c.endDate && ` – ${new Date(c.endDate).toLocaleDateString('de-DE')}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <Panel title="Mitglieder">
                    {/* Desktop table */}
                    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">E-Mail</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Telefon</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Seit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {members.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Keine Mitglieder vorhanden</td></tr>
                                ) : members.map(m => (
                                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{m.firstName} {m.lastName}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{m.email || '–'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{m.phone || '–'}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(m.createdAt).toLocaleDateString('de-DE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {members.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Keine Mitglieder vorhanden</div>
                        ) : members.map(m => (
                            <div key={m.id} className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                                <p className="font-medium text-foreground text-sm">{m.firstName} {m.lastName}</p>
                                {m.email && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">email</span>{m.email}</p>}
                                {m.phone && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">phone</span>{m.phone}</p>}
                                <p className="text-xs text-muted-foreground">Seit {new Date(m.createdAt).toLocaleDateString('de-DE')}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {/* Check-ins Tab */}
            {activeTab === 'checkins' && (
                <div className="space-y-5">
                    <CheckInPanel members={members} />
                    <Panel title="Letzte Check-ins">
                    {/* Desktop table */}
                    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Mitglied</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Check-in</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Check-out</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Dauer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {checkIns.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Keine Check-ins vorhanden</td></tr>
                                ) : checkIns.map(ci => {
                                    const duration = ci.checkOutAt
                                        ? Math.round((new Date(ci.checkOutAt).getTime() - new Date(ci.checkInAt).getTime()) / 60000)
                                        : null
                                    return (
                                        <tr key={ci.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{ci.memberName}</td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {new Date(ci.checkInAt).toLocaleString('de-DE')}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {ci.checkOutAt ? new Date(ci.checkOutAt).toLocaleString('de-DE') : <Badge variant="outline">Aktiv</Badge>}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {duration !== null ? `${duration} Min.` : '–'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {checkIns.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Keine Check-ins vorhanden</div>
                        ) : checkIns.map(ci => {
                            const duration = ci.checkOutAt
                                ? Math.round((new Date(ci.checkOutAt).getTime() - new Date(ci.checkInAt).getTime()) / 60000)
                                : null
                            return (
                                <div key={ci.id} className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-foreground text-sm">{ci.memberName}</span>
                                        {duration !== null ? (
                                            <span className="text-xs text-muted-foreground">{duration} Min.</span>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px]">Aktiv</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(ci.checkInAt).toLocaleString('de-DE')}
                                        {ci.checkOutAt ? ` → ${new Date(ci.checkOutAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </Panel>
                </div>
            )}
        </div>
    )
}
