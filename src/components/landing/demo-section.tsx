'use client'

import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package, Wrench, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function DemoSection() {
    return (
        <section id="demo" className="py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--lime)] opacity-[0.02] rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Demo</p>
                        <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95]">
                            Sieh es in <span className="text-gradient-lime">Aktion.</span>
                        </h2>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <div className="max-w-4xl mx-auto">
                        {/* Mock browser window */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/20">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                </div>
                                <div className="flex-1 mx-8">
                                    <div className="h-7 rounded-md bg-muted/50 flex items-center px-3">
                                        <span className="text-[11px] text-muted-foreground font-mono">app.studio-command-center.de/dashboard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mock dashboard content */}
                            <div className="p-6 bg-background">
                                {/* Top bar */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="h-5 w-32 bg-foreground/10 rounded mb-2" />
                                        <div className="h-3 w-48 bg-muted rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-20 bg-muted rounded-md" />
                                        <div className="h-8 w-8 bg-[var(--lime)]/20 rounded-md" />
                                    </div>
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {[
                                        { icon: Package, label: 'Inventar', value: '142', change: '+5' },
                                        { icon: Wrench, label: 'Maschinen', value: '23', change: '99%' },
                                        { icon: Users, label: 'Team', value: '8', change: '+2' },
                                        { icon: BarChart3, label: 'Umsatz', value: '48.2k', change: '+12%' },
                                    ].map((card, i) => (
                                        <div key={i} className="p-3 rounded-lg border border-border bg-card">
                                            <div className="flex items-center gap-2 mb-2">
                                                <card.icon className="w-3.5 h-3.5 text-[var(--lime)]" />
                                                <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{card.label}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-display text-lg font-bold">{card.value}</span>
                                                <span className="text-[10px] text-[var(--lime)] font-semibold">{card.change}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart placeholder */}
                                <div className="h-32 rounded-lg border border-border bg-card p-4">
                                    <div className="h-3 w-20 bg-muted rounded mb-3" />
                                    <div className="flex items-end gap-1 h-16">
                                        {[35, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t bg-[var(--lime)]/30 hover:bg-[var(--lime)]/50 transition-colors" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA below demo */}
                        <div className="text-center mt-10">
                            <Button size="lg" asChild className="h-12 px-8 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold text-sm tracking-wide group">
                                <Link href="/signin">
                                    Demo ausprobieren
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
