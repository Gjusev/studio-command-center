'use client'

import { ScrollReveal } from '@/components/landing/scroll-reveal'
import {
    Package,
    Wrench,
    ClipboardList,
    Users,
    CalendarDays,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Clock,
    UserCheck,
    Eye,
} from 'lucide-react'

interface FeatureShowcaseProps {
    badge: string
    title: string
    highlight: string
    description: string
    mockup: React.ReactNode
    bullets: string[]
    reversed?: boolean
}

function FeatureShowcase({ badge, title, highlight, description, mockup, bullets, reversed }: FeatureShowcaseProps) {
    return (
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? 'direction-reversed' : ''}`}>
            <div className={reversed ? 'lg:order-2' : ''}>
                <ScrollReveal direction={reversed ? 'right' : 'left'}>
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-3">{badge}</p>
                    <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter leading-[0.95] mb-4">
                        {title} <span className="text-gradient-lime">{highlight}</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">{description}</p>
                    <ul className="space-y-3">
                        {bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-[var(--lime)] shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{b}</span>
                            </li>
                        ))}
                    </ul>
                </ScrollReveal>
            </div>
            <div className={reversed ? 'lg:order-1' : ''}>
                <ScrollReveal direction={reversed ? 'left' : 'right'} delay={0.15}>
                    {mockup}
                </ScrollReveal>
            </div>
        </div>
    )
}

function MockCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-border bg-card p-5 shadow-xl shadow-black/10 ${className}`}>
            {children}
        </div>
    )
}

function MockProgress({ value, max = 100, label, color = 'bg-[var(--lime)]' }: { value: number; max?: number; label?: string; color?: string }) {
    return (
        <div>
            {label && <div className="flex justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className="text-[10px] font-display font-bold">{value}%</span>
            </div>}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
        </div>
    )
}

function InventoryMockup() {
    const items = [
        { name: 'Protein Shake Vanilla', stock: 12, max: 50, unit: 'Stück', low: true },
        { name: 'Handtuch Rolle', stock: 85, max: 100, unit: 'Stück', low: false },
        { name: 'Desinfektionsmittel', stock: 3, max: 20, unit: 'Liter', low: true },
        { name: 'Fitnessbänder Set', stock: 24, max: 30, unit: 'Stück', low: false },
    ]

    return (
        <div className="space-y-3">
            {/* Header */}
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Inventar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-display font-semibold">2 Niedrig</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lime)]/10 text-[var(--lime)] font-display font-semibold">142 Gesamt</span>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${item.low ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-border bg-background'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-display font-semibold">{item.name}</span>
                                <span className="text-[10px] text-muted-foreground">{item.stock} {item.unit}</span>
                            </div>
                            <MockProgress value={item.stock} max={item.max} color={item.low ? 'bg-red-400' : 'bg-[var(--lime)]'} />
                            {item.low && (
                                <div className="flex items-center gap-1 mt-1.5">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    <span className="text-[10px] text-red-400 font-medium">Bestand niedrig</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </MockCard>
        </div>
    )
}

function TasksMockup() {
    const tasks = [
        { title: 'Maschinenprüfung Zone A', assignee: 'Thomas W.', points: 15, status: 'pending', priority: 'high' },
        { title: 'Inventur Handtuchbestand', assignee: 'Lisa S.', points: 10, status: 'done', priority: 'medium' },
        { title: 'Reinigung Kursraum 2', assignee: 'Max K.', points: 5, status: 'progress', priority: 'low' },
        { title: 'Lieferung entgegennehmen', assignee: 'Sarah M.', points: 20, status: 'pending', priority: 'high' },
    ]

    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
        done: { bg: 'bg-[var(--lime)]/10', text: 'text-[var(--lime)]', label: 'Erledigt' },
        progress: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'In Arbeit' },
        pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Offen' },
    }

    return (
        <div className="space-y-3">
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Aufgaben</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">Heute, 4 offen</span>
                </div>

                <div className="space-y-2">
                    {tasks.map((task, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border bg-background flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                task.status === 'done' ? 'border-[var(--lime)] bg-[var(--lime)]/20' : 'border-border'
                            }`}>
                                {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-[var(--lime)]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-display font-semibold truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{task.assignee}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${statusStyles[task.status].bg} ${statusStyles[task.status].text} font-display font-semibold`}>
                                    {statusStyles[task.status].label}
                                </span>
                                <span className="text-[10px] font-display font-bold text-[var(--lime)]">+{task.points}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team leaderboard */}
                <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">Punktestand diese Woche</p>
                    <div className="flex gap-2">
                        {[
                            { name: 'Thomas', pts: 145, pct: 100 },
                            { name: 'Sarah', pts: 120, pct: 83 },
                            { name: 'Max', pts: 95, pct: 66 },
                        ].map((m, i) => (
                            <div key={i} className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-medium">{m.name}</span>
                                    <span className="text-[10px] font-display font-bold">{m.pts}pts</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-[var(--lime)]" style={{ width: `${m.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </MockCard>
        </div>
    )
}

function MachinesMockup() {
    const machines = [
        { name: 'Laufband Pro X1', status: 'active', nextService: '12 Tage', hours: 1847 },
        { name: 'Crosstrainer Elite', status: 'maintenance', nextService: 'Heute', hours: 2103 },
        { name: 'Beinpresse 3000', status: 'active', nextService: '28 Tage', hours: 982 },
    ]

    const statusStyles: Record<string, { dot: string; label: string }> = {
        active: { dot: 'status-dot-green', label: 'Aktiv' },
        maintenance: { dot: 'status-dot-yellow', label: 'Wartung' },
    }

    return (
        <div className="space-y-3">
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Maschinen</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">23 Geräte</span>
                </div>

                <div className="space-y-2">
                    {machines.map((m, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border bg-background">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={statusStyles[m.status].dot} />
                                    <span className="text-xs font-display font-semibold">{m.name}</span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-display font-semibold ${
                                    m.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[var(--lime)]/10 text-[var(--lime)]'
                                }`}>
                                    {statusStyles[m.status].label}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{m.hours.toLocaleString()} Betriebsstunden</span>
                                <span className={m.nextService === 'Heute' ? 'text-yellow-400 font-semibold' : ''}>
                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                    Nächste Wartung: {m.nextService}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Maintenance timeline */}
                <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">Wartungsplan nächste 30 Tage</p>
                    <div className="flex items-end gap-1 h-12">
                        {[0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0].map((v, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-t ${v === 0 ? 'bg-muted/50 h-2' : v === 1 ? 'bg-[var(--lime)]/40 h-4' : v === 2 ? 'bg-[var(--lime)]/70 h-8' : 'bg-[var(--lime)] h-12'}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground">Woche 1</span>
                        <span className="text-[9px] text-muted-foreground">Woche 4</span>
                    </div>
                </div>
            </MockCard>
        </div>
    )
}

function TeamMockup() {
    return (
        <div className="space-y-3">
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Team</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">8 Mitglieder</span>
                </div>

                {/* Role cards */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-3 rounded-lg border border-border bg-background">
                        <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="w-3.5 h-3.5 text-[var(--lime)]" />
                            <span className="text-[10px] font-display font-bold uppercase tracking-wider">Studioleiter</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Voller Zugriff auf alle Module und Einstellungen</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background">
                        <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-display font-bold uppercase tracking-wider">Mitarbeiter</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Aufgaben erledigen, Inventar einsehen</p>
                    </div>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                    <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">Berechtigungen</p>
                    {[
                        { perm: 'Inventar verwalten', admin: true, user: false },
                        { perm: 'Aufgaben erledigen', admin: true, user: true },
                        { perm: 'Berichte einsehen', admin: true, user: false },
                        { perm: 'Maschinen warten', admin: true, user: true },
                    ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                            <span className="text-[11px]">{p.perm}</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] ${p.admin ? 'text-[var(--lime)]' : 'text-muted-foreground'}`}>
                                    {p.admin ? 'Ja' : 'Nein'}
                                </span>
                                <span className={`text-[10px] ${p.user ? 'text-[var(--lime)]' : 'text-muted-foreground'}`}>
                                    {p.user ? 'Ja' : 'Nein'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </MockCard>
        </div>
    )
}

function ClassesMockup() {
    const classes = [
        { time: '08:00', name: 'Yoga Flow', trainer: 'Lisa S.', spots: 4, max: 12, type: 'Yoga' },
        { time: '10:00', name: 'HIIT Burn', trainer: 'Thomas W.', spots: 0, max: 15, type: 'HIIT' },
        { time: '14:00', name: 'Spin Cycle', trainer: 'Max K.', spots: 8, max: 20, type: 'Cardio' },
        { time: '18:00', name: 'Strength Base', trainer: 'Sarah M.', spots: 6, max: 10, type: 'Kraft' },
    ]

    return (
        <div className="space-y-3">
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Kursplanung</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">Heute, 4 Kurse</span>
                </div>

                <div className="space-y-2">
                    {classes.map((c, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border bg-background">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-muted-foreground w-10">{c.time}</span>
                                    <span className="text-xs font-display font-semibold">{c.name}</span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-display font-semibold ${
                                    c.spots === 0 ? 'bg-red-500/10 text-red-400' : 'bg-[var(--lime)]/10 text-[var(--lime)]'
                                }`}>
                                    {c.spots === 0 ? 'Ausgebucht' : `${c.spots} Plätze`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{c.trainer}</span>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: c.max }).map((_, j) => (
                                        <div key={j} className={`w-1 h-3 rounded-sm ${j < (c.max - c.spots) ? 'bg-[var(--lime)]/60' : 'bg-muted'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </MockCard>
        </div>
    )
}

function DashboardMockup() {
    return (
        <div className="space-y-3">
            <MockCard>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[var(--lime)]" />
                        <span className="font-display text-sm font-bold">Dashboard</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Live</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: 'Mitglieder', value: '342', change: '+8' },
                        { label: 'Umsatz', value: '28.4k', change: '+15%' },
                        { label: 'Auslastung', value: '87%', change: '+3%' },
                    ].map((kpi, i) => (
                        <div key={i} className="p-2.5 rounded-lg border border-border bg-background text-center">
                            <p className="text-[9px] text-muted-foreground font-display uppercase tracking-wider">{kpi.label}</p>
                            <p className="font-display text-base font-bold mt-0.5">{kpi.value}</p>
                            <p className="text-[9px] text-[var(--lime)] font-semibold">{kpi.change}</p>
                        </div>
                    ))}
                </div>

                {/* Revenue chart */}
                <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">Monatlicher Umsatz</p>
                    <div className="flex items-end gap-1 h-16">
                        {[35, 42, 38, 55, 48, 62, 58, 72, 65, 80, 75, 90].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-[var(--lime)]/30 hover:bg-[var(--lime)]/50 transition-colors cursor-default" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[8px] text-muted-foreground">Jan</span>
                        <span className="text-[8px] text-muted-foreground">Dez</span>
                    </div>
                </div>
            </MockCard>
        </div>
    )
}

export function FeatureShowcases() {
    return (
        <section className="py-32 relative">
            <div className="mx-auto max-w-7xl px-6 space-y-32">
                {/* Dashboard */}
                <FeatureShowcase
                    badge="Dashboard"
                    title="Alles im."
                    highlight="Blick."
                    description="Dein zentrales Kommandozentrum. KPIs, Auslastung, Umsatz und Teamleistung — alles auf einen Blick erfasst."
                    bullets={[
                        'Echtzeit-KPIs mit Trend-Indikatoren',
                        'Umsatz- und Auslastungsdiagramme',
                        'Schnellzugriff auf alle Module',
                        'Benachrichtigungen und Alarme direkt im Dashboard',
                    ]}
                    mockup={<DashboardMockup />}
                />

                {/* Inventar */}
                <FeatureShowcase
                    badge="Inventar"
                    title="Bestand im."
                    highlight="Griff."
                    description="Behalte immer den Überblick über dein gesamtes Inventar. Automatische Warnungen bei niedrigem Bestand verhindern Engpässe."
                    bullets={[
                        'Echtzeit-Bestandsüberwachung mit Fortschrittsbalken',
                        'Automatische Warnungen bei niedrigem Bestand',
                        'Verbrauchsverlauf und Nachbestell-Empfehlungen',
                        'Kategoriebasierte Organisation',
                    ]}
                    mockup={<InventoryMockup />}
                    reversed
                />

                {/* Aufgaben */}
                <FeatureShowcase
                    badge="Aufgaben"
                    title="Team."
                    highlight="Effizient."
                    description="Weise Aufgaben zu, verfolge den Fortschritt und motiviere dein Team mit einem transparenten Punktesystem."
                    bullets={[
                        'Aufgaben mit Prioritäten und Fristen',
                        'Punktesystem zur Mitarbeitermotivation',
                        'Echtzeit-Status: Offen, In Arbeit, Erledigt',
                        'Wöchentlicher Team-Leaderboard',
                    ]}
                    mockup={<TasksMockup />}
                />

                {/* Maschinen */}
                <FeatureShowcase
                    badge="Maschinen"
                    title="Wartung."
                    highlight="Planbar."
                    description='Präventive Wartungspläne halten deine Geräte am Laufen. Keine Überraschungen mehr bei Betriebsstunden-Checks.'
                    bullets={[
                        'Status-Überwachung aller Geräte',
                        'Automatische Wartungsplanung',
                        'Betriebsstunden-Tracking',
                        'Wartungs-Timeline mit Vorschau',
                    ]}
                    mockup={<MachinesMockup />}
                    reversed
                />

                {/* Kursplanung */}
                <FeatureShowcase
                    badge="Kursplanung"
                    title="Kurse."
                    highlight="Organisiert."
                    description="Plane und verwalte deine Kurse mit Teilnehmer-Tracking, Trainer-Zuweisung und Auslastungsübersicht."
                    bullets={[
                        'Wochenplan mit Kursübersicht',
                        'Teilnehmer-Tracking pro Kurs',
                        'Automatische Ausgebucht-Markierung',
                        'Trainer-Zuweisung und Kapazitätsplanung',
                    ]}
                    mockup={<ClassesMockup />}
                />

                {/* Team */}
                <FeatureShowcase
                    badge="Team"
                    title="Rollen &."
                    highlight="Rechte."
                    description="Verwalte dein Team mit differenzierten Rollen und Berechtigungen. Jeder Mitarbeiter sieht nur was er braucht."
                    bullets={[
                        'Rollen: Studioleiter und Mitarbeiter',
                        'Granulare Berechtigungen pro Modul',
                        'Einladungssystem für neue Mitarbeiter',
                        'Aktivitäts- und Performance-Tracking',
                    ]}
                    mockup={<TeamMockup />}
                    reversed
                />
            </div>
        </section>
    )
}
