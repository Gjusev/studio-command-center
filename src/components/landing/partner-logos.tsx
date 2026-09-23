'use client'

import { ScrollReveal } from '@/components/landing/scroll-reveal'

export function PartnerLogos() {
    return (
        <section className="py-12 border-b border-border">
            <div className="mx-auto max-w-7xl px-6">
                <ScrollReveal>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
                        <span className="text-xs font-display font-medium tracking-wider uppercase">Ein Produkt von</span>
                        <a
                            href="https://mokka-agentur.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-border hover:border-[var(--lime)]/30 hover:bg-muted/30 transition-all group"
                        >
                            <span className="font-display text-base font-bold tracking-tight group-hover:text-[var(--lime)] transition-colors">mokka.</span>
                            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground group-hover:text-muted-foreground/70 transition-colors">Agentur</span>
                        </a>
                        <span className="text-xs text-muted-foreground/50">Webentwicklung & digitale Lösungen aus Siegen</span>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
