import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const reports = [
    {
        title: 'Inventarbericht',
        description: 'Alle Verbrauchsmaterialien mit Bestandslevels und Status',
        icon: 'inventory_2',
        type: 'inventory',
        roles: ['studioleiter', 'mitarbeiter'],
    },
    {
        title: 'Mitgliederliste',
        description: 'Alle registrierten Mitglieder mit Kontaktdaten',
        icon: 'groups',
        type: 'members',
        roles: ['studioleiter'],
    },
    {
        title: 'Maschinenbericht',
        description: 'Alle Maschinen mit Wartungsstatus und Zeitplan',
        icon: 'fitness_center',
        type: 'machines',
        roles: ['studioleiter', 'mitarbeiter'],
    },
    {
        title: 'Zahlungsbericht',
        description: 'Alle Zahlungen mit Status, Methode und Beträgen',
        icon: 'payments',
        type: 'payments',
        roles: ['studioleiter'],
    },
    {
        title: 'Ausgabenbericht',
        description: 'Alle Ausgaben nach Kategorie und Lieferant',
        icon: 'receipt_long',
        type: 'expenses',
        roles: ['studioleiter'],
    },
    {
        title: 'Aufgabenbericht',
        description: 'Alle erledigten Aufgaben mit Punkten und Mitarbeitern',
        icon: 'task_alt',
        type: 'tasks',
        roles: ['studioleiter'],
    },
    {
        title: 'Team Performance',
        description: 'Leistungsübersicht aller Mitarbeiter mit Punkten',
        icon: 'emoji_events',
        type: 'employees',
        roles: ['studioleiter'],
    },
]

export default async function ReportsPage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('reports.view')) {
        redirect('/dashboard')
    }
    const visibleReports = reports.filter(r => r.roles.includes(user.role))

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <span className="material-symbols-outlined text-sm">summarize</span>
                <span>Berichte</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-foreground">Exportieren</span>
            </div>

            <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">Berichte</h1>
                <p className="text-sm text-muted-foreground">Exportieren Sie Berichte als PDF oder Excel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleReports.map(report => (
                    <div key={report.type} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all group">
                        <div className="p-5 md:p-6">
                            <div className="size-11 rounded-xl bg-[var(--lime)]/10 flex items-center justify-center mb-3 group-hover:bg-[var(--lime)]/20 transition-colors">
                                <span className="material-symbols-outlined text-[var(--lime)] text-[22px]">{report.icon}</span>
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-1">{report.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                        </div>
                        <div className="px-5 md:px-6 py-3 border-t border-border bg-muted/50 flex gap-2">
                            <Link
                                href={`/api/reports?type=${report.type}&format=pdf`}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                PDF
                            </Link>
                            <Link
                                href={`/api/reports?type=${report.type}&format=excel`}
                                className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">table</span>
                                Excel
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
