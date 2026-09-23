'use client'

import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { Package, Wrench, ClipboardList, Users, CalendarDays, BarChart3 } from 'lucide-react'

const highlights = [
    { icon: Package, label: 'Inventar', desc: 'Bestandsüberwachung' },
    { icon: Wrench, label: 'Maschinen', desc: 'Wartungsplanung' },
    { icon: ClipboardList, label: 'Aufgaben', desc: 'Team-Management' },
    { icon: Users, label: 'Mitarbeiter', desc: 'Rollen & Rechte' },
    { icon: CalendarDays, label: 'Kursplanung', desc: 'Terminverwaltung' },
    { icon: BarChart3, label: 'Dashboard', desc: 'KPIs & Analytics' },
]

export function CountUpSection() {
    return (
        <section className="py-20 border-y border-border bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {highlights.map((item, i) => (
                        <ScrollReveal key={i} delay={i * 0.05} direction="none">
                            <div className="text-center group">
                                <div className="mx-auto w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-3 group-hover:bg-[var(--lime)]/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-[var(--lime)] transition-colors" />
                                </div>
                                <p className="font-display text-sm font-bold tracking-tight">{item.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
