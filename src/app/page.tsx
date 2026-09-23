import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/layout/landing-navbar'
import { HeroParticles } from '@/components/landing/hero-particles'
import { FAQAccordion } from '@/components/landing/faq-accordion'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { DemoSection } from '@/components/landing/demo-section'
import { PartnerLogos } from '@/components/landing/partner-logos'
import { CountUpSection } from '@/components/landing/count-up-section'
import { FeatureShowcases } from '@/components/landing/feature-showcases'
import {
    Package,
    Wrench,
    Users,
    TrendingUp,
    BarChart3,
    Bell,
    Smartphone,
    CheckCircle2,
    Star,
    ArrowRight,
    ChevronRight,
} from 'lucide-react'

export default function HomePage() {
    const features = [
        {
            icon: Package,
            title: 'Inventar Management',
            description: 'Bestandsüberwachung in Echtzeit mit automatischen Warnungen bei niedrigem Bestand.',
            stat: '30%',
            statLabel: 'weniger Verschwendung',
        },
        {
            icon: Wrench,
            title: 'Maschinen Wartung',
            description: 'Präventive Wartungspläne, Incident-Tracking und Dokumentation aller Service-Intervalle.',
            stat: '99%',
            statLabel: 'Geräteverfügbarkeit',
        },
        {
            icon: Users,
            title: 'Team Performance',
            description: 'Aufgabenmanagement mit Punktesystem zur Motivation und transparenter Leistungsmessung.',
            stat: '25%',
            statLabel: 'produktiver',
        },
        {
            icon: BarChart3,
            title: 'Analytics Dashboard',
            description: 'Detaillierte Einblicke in Verbrauch, Kosten und Teamleistung für datengetriebene Entscheidungen.',
            stat: '10h',
            statLabel: 'pro Woche gespart',
        },
        {
            icon: Bell,
            title: 'Smart Benachrichtigungen',
            description: 'Automatische Alerts bei niedrigem Bestand, anstehenden Wartungen und fälligen Aufgaben.',
            stat: '24/7',
            statLabel: 'Überwachung',
        },
        {
            icon: Smartphone,
            title: 'Mobile First',
            description: 'Optimiert für alle Geräte. Verwalten Sie Ihr Studio von überall, jederzeit.',
            stat: '100%',
            statLabel: 'responsive',
        },
    ]

    const testimonials = [
        {
            name: 'Studioleiter Demo',
            role: 'Vollzugriff auf alle Module',
            content: 'Studio Command Center gibt mir als Studioleiter die volle Kontrolle über Inventar, Maschinen und mein Team — alles von einem Dashboard aus.',
            result: 'Demo-Zugang verfügbar',
        },
        {
            name: 'Mitarbeiter Demo',
            role: 'Aufgabenerledigung & Einsicht',
            content: 'Ich sehe sofort welche Aufgaben anstehen, kann Maschinen-Wartungen dokumentieren und den Bestand einsehen — einfach und schnell.',
            result: 'Jetzt testen',
        },
    ]

    const pricing = [
        {
            name: 'Starter',
            description: 'Perfekt für kleine Studios',
            price: '29',
            features: [
                'Bis zu 50 Mitglieder',
                'Inventar Management',
                'Maschinen Tracking',
                'Basic Analytics',
                'Email Support',
            ],
            cta: 'Kostenlos starten',
            popular: false,
        },
        {
            name: 'Professional',
            description: 'Für wachsende Studios',
            price: '79',
            features: [
                'Bis zu 200 Mitglieder',
                'Alles aus Starter',
                'Team Management',
                'Advanced Analytics',
                'Priority Support',
                'Custom Reports',
            ],
            cta: 'Jetzt testen',
            popular: true,
        },
        {
            name: 'Enterprise',
            description: 'Für Studio-Ketten',
            price: '199',
            features: [
                'Unbegrenzte Mitglieder',
                'Multi-Location',
                'Alles aus Professional',
                'API Access',
                'Dedicated Manager',
                'White Label Option',
                'Custom Integrations',
            ],
            cta: 'Kontaktieren',
            popular: false,
        },
    ]

    const faqs = [
        {
            question: 'Wie lange dauert die Einrichtung?',
            answer: 'Die meisten Studios sind innerhalb von 15 Minuten einsatzbereit. Wir bieten ein Onboarding-Video und persönliche Unterstützung bei Bedarf.',
        },
        {
            question: 'Kann ich mit meinem Team zusammenarbeiten?',
            answer: 'Ja! Studio Command Center ist für Teams gebaut. Sie können Rollen zuweisen (Studioleiter, Mitarbeiter) und everyone hat den passenden Zugriff.',
        },
        {
            question: 'Werden meine Daten sicher gespeichert?',
            answer: 'Absolut. Wir verwenden Bank-Level-Verschlüsselung und hosten in Deutschland. Ihre Daten gehören Ihnen — immer.',
        },
        {
            question: 'Kann ich jederzeit kündigen?',
            answer: 'Ja, keine langfristigen Verträge. Sie können monatlich kündigen ohne versteckte Gebühren.',
        },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />

            {/* ================================================
                HERO — Particles + gradient + bold
                ================================================ */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(190,255,41,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(190,255,41,0.03),transparent_50%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 bg-grid opacity-30" />

                {/* Particles */}
                <HeroParticles />

                <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24 w-full">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left column — text */}
                        <div className="lg:col-span-7 space-y-8">
                            <ScrollReveal direction="none" delay={0}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-display font-semibold tracking-wider uppercase text-muted-foreground">
                                    <span className="status-dot status-dot-green" />
                                    Demo-Version — Jetzt testen
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={0.1}>
                                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tighter text-balance">
                                    <span className="text-gradient-lime">Dein</span> Studio.
                                    <br />
                                    Zentralisiert.
                                </h1>
                            </ScrollReveal>

                            <ScrollReveal delay={0.2}>
                                <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                                    Die ultimative Management Plattform für Fitness Studios. Inventar, Maschinen
                                    und Teamleistung — alles an einem Ort.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal delay={0.3}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" asChild className="h-12 px-8 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold text-sm tracking-wide group">
                                        <Link href="/signup">
                                            14 Tage kostenlos testen
                                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild className="h-12 px-8 font-display font-semibold text-sm border-border hover:border-[var(--lime)] hover:text-[var(--lime)] transition-colors">
                                        <Link href="/signin">Demo ausprobieren</Link>
                                    </Button>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={0.4}>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                                    {['Keine Kreditkarte', '14 Tage Testphase', 'Jederzeit kündbar'].map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-[var(--lime)]" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right column — floating stat cards */}
                        <div className="lg:col-span-5 hidden lg:block relative">
                            <div className="relative w-full min-h-[400px]">
                                <div className="absolute top-8 right-0 bg-card border border-border rounded-lg p-5 shadow-2xl w-56 animate-fade-in-up">
                                    <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted-foreground mb-2">Aktive Mitglieder</p>
                                    <p className="text-3xl font-display font-bold">1,247</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="w-3 h-3 text-[var(--lime)]" />
                                        <span className="text-xs font-semibold text-[var(--lime)]">+12.3%</span>
                                    </div>
                                </div>

                                <div className="absolute top-44 left-0 bg-card border border-border rounded-lg p-5 shadow-2xl w-52 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                                    <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted-foreground mb-2">Einnahmen</p>
                                    <p className="text-3xl font-display font-bold">48.2k€</p>
                                    <div className="flex items-end gap-1 mt-3 h-8">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-sm bg-[var(--lime)] opacity-60" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-8 right-8 bg-card border border-border rounded-lg p-4 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="status-dot status-dot-green" />
                                        <div>
                                            <p className="text-xs font-display font-semibold">Alle Systeme aktiv</p>
                                            <p className="text-[10px] text-muted-foreground">99.9% Uptime</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================
                PARTNER LOGOS
                ================================================ */}
            <PartnerLogos />

            {/* ================================================
                STATS — Animated counters
                ================================================ */}
            <CountUpSection />

            {/* ================================================
                DEMO SECTION
                ================================================ */}
            <DemoSection />

            {/* ================================================
                FEATURES — Quick overview grid
                ================================================ */}
            <section id="features" className="py-32 relative">
                <div className="mx-auto max-w-7xl px-6">
                    <ScrollReveal>
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Überblick</p>
                            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
                                Alles was dein
                                <br />
                                <span className="text-gradient-lime">Studio braucht.</span>
                            </h2>
                            <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed">
                                Sechs Kernmodule, ein Ziel: dein Studio effizienter, transparenter und profitabler zu machen.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                        {features.map((feature, index) => (
                            <ScrollReveal key={index} delay={index * 0.05}>
                                <div className="bg-card p-8 group hover:bg-surface-raised transition-colors duration-300 relative h-full">
                                    <span className="font-display text-6xl font-bold text-border group-hover:text-[var(--lime)]/10 transition-colors absolute top-4 right-6 leading-none">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-5 group-hover:bg-[var(--lime)]/10 transition-colors">
                                            <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-[var(--lime)] transition-colors" />
                                        </div>
                                        <h3 className="font-display text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{feature.description}</p>
                                        <div className="flex items-baseline gap-2 pt-4 border-t border-border">
                                            <span className="font-display text-2xl font-bold text-[var(--lime)]">{feature.stat}</span>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">{feature.statLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================
                MODULE SHOWCASES — Detailed feature sections
                ================================================ */}
            <section id="modules" className="py-32 bg-card border-y border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className="relative z-10">
                    <ScrollReveal>
                        <div className="mx-auto max-w-7xl px-6 mb-20 text-center">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Module im Detail</p>
                            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95]">
                                Jedes Modul.
                                <br />
                                <span className="text-gradient-lime">Meisterhaft.</span>
                            </h2>
                            <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed">
                                Entdecke jede Funktion in Detail — so wie sie im Alltag deines Studios aussieht.
                            </p>
                        </div>
                    </ScrollReveal>
                    <FeatureShowcases />
                </div>
            </section>

            {/* ================================================
                HOW IT WORKS
                ================================================ */}
            <section className="py-32 border-y border-border">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <ScrollReveal direction="left" className="lg:col-span-5">
                            <div>
                                <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Einfach starten</p>
                                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95] mb-6">
                                    In 3 Schritten zum
                                    <br />
                                    <span className="text-gradient-lime">Erfolg.</span>
                                </h2>
                                <p className="text-muted-foreground leading-relaxed max-w-md">
                                    So einfach startest du mit Studio Command Center. Keine langwierigen Schulungen, keine komplexe Einrichtung.
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="lg:col-span-7 space-y-0">
                            {[
                                { step: '01', title: 'Registrieren', desc: 'Erstelle dein kostenloses Konto in unter 2 Minuten. Keine Kreditkarte erforderlich.' },
                                { step: '02', title: 'Einrichten', desc: 'Füge dein Inventar, Maschinen und Team hinzu. Unser Import-Tool macht es einfach.' },
                                { step: '03', title: 'Starten', desc: 'Loslegen! Dein Studio ist jetzt organisiert, effizient und produktiver.' },
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.1} direction="right">
                                    <div className="flex gap-6 py-6 border-b border-border last:border-0 group">
                                        <span className="font-display text-3xl font-bold text-border group-hover:text-[var(--lime)] transition-colors leading-none pt-1">
                                            {item.step}
                                        </span>
                                        <div>
                                            <h3 className="font-display text-xl font-bold mb-1 tracking-tight">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================
                TESTIMONIALS
                ================================================ */}
            <section id="about" className="py-32">
                <div className="mx-auto max-w-7xl px-6">
                    <ScrollReveal>
                        <div className="mb-20">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Zugangsrollen</p>
                            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95]">
                                Für jedes Teammitglied.
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-12 gap-6">
                        <ScrollReveal className="md:col-span-7" delay={0}>
                            <div className="bg-card border border-border rounded-lg p-8 md:p-10 flex flex-col justify-between min-h-[320px] h-full">
                                <div>
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-[var(--lime)] text-[var(--lime)]" />
                                        ))}
                                    </div>
                                    <blockquote className="font-display text-xl md:text-2xl font-semibold leading-snug tracking-tight mb-6">
                                        &ldquo;{testimonials[0].content}&rdquo;
                                    </blockquote>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="font-display font-bold text-sm">{testimonials[0].name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonials[0].role}</p>
                                    </div>
                                    <span className="font-display text-sm font-bold text-[var(--lime)] bg-[var(--lime)]/10 px-3 py-1.5 rounded-md">
                                        {testimonials[0].result}
                                    </span>
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="md:col-span-5 space-y-6">
                            {testimonials.slice(1).map((t, i) => (
                                <ScrollReveal key={i} delay={(i + 1) * 0.1}>
                                    <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star key={j} className="w-3 h-3 fill-[var(--lime)] text-[var(--lime)]" />
                                                ))}
                                            </div>
                                            <p className="text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-display font-bold text-sm">{t.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.role}</p>
                                            </div>
                                            <span className="text-xs font-display font-bold text-[var(--lime)]">
                                                {t.result}
                                            </span>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================
                PRICING
                ================================================ */}
            <section id="pricing" className="py-32 bg-card border-y border-border">
                <div className="mx-auto max-w-7xl px-6">
                    <ScrollReveal>
                        <div className="text-center mb-20">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">Preise</p>
                            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter">
                                Einfach. Transparent.
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {pricing.map((plan, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <div
                                    className={`relative rounded-lg border p-8 flex flex-col h-full ${
                                        plan.popular
                                            ? 'border-[var(--lime)] bg-background shadow-[0_0_40px_rgba(190,255,41,0.06)]'
                                            : 'border-border bg-background'
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--lime)] text-black text-[10px] font-display font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                                            Beliebt
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="font-display text-lg font-bold tracking-tight">{plan.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                                    </div>
                                    <div className="mb-8">
                                        <span className="font-display text-5xl font-bold tracking-tighter">{plan.price}€</span>
                                        <span className="text-sm text-muted-foreground">/Monat</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-[var(--lime)] shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className={`w-full h-11 font-display font-bold text-sm tracking-wide ${
                                            plan.popular
                                                ? 'bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)]'
                                                : 'bg-transparent border border-border hover:border-[var(--lime)] hover:text-[var(--lime)]'
                                        }`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                        asChild
                                    >
                                        <Link href="/signup">
                                            {plan.cta}
                                            <ChevronRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================
                FAQ — Interactive accordion
                ================================================ */}
            <section id="faq" className="py-32">
                <div className="mx-auto max-w-3xl px-6">
                    <ScrollReveal>
                        <div className="mb-16">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)] mb-4">FAQ</p>
                            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter">
                                Häufige Fragen.
                            </h2>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <FAQAccordion items={faqs} />
                    </ScrollReveal>
                </div>
            </section>

            {/* ================================================
                CONTACT CTA
                ================================================ */}
            <section id="contact" className="py-24 border-y border-border bg-card">
                <div className="mx-auto max-w-3xl px-6">
                    <ScrollReveal>
                        <div className="text-center space-y-6">
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[var(--lime)]">Kontakt</p>
                            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tighter">
                                Noch Fragen?
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Hast du Fragen oder brauchst Hilfe? Kontaktiere uns und wir helfen dir gerne weiter.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                                <Button variant="outline" asChild className="font-display font-bold text-sm border-border hover:border-[var(--lime)] hover:text-[var(--lime)]">
                                    <Link href="/signup">
                                        Jetzt starten
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ================================================
                FINAL CTA
                ================================================ */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--lime)] to-transparent opacity-50" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--lime)] opacity-[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                    <ScrollReveal>
                        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95] mb-6 text-balance">
                            Bereit dein Studio zu
                            <br />
                            <span className="text-gradient-lime">transformieren?</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
                            Starte jetzt deine kostenlose 14-Tage Testphase. Keine Kreditkarte erforderlich.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="h-12 px-8 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold text-sm tracking-wide group">
                                <Link href="/signup">
                                    Kostenlos starten
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="h-12 px-8 font-display font-semibold text-sm border-border">
                                <Link href="/#pricing">Preise ansehen</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ================================================
                FOOTER
                ================================================ */}
            <footer className="border-t border-border py-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid md:grid-cols-12 gap-10 mb-12">
                        <div className="md:col-span-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-md bg-[var(--lime)] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-black font-bold">fitness_center</span>
                                </div>
                                <div>
                                    <span className="font-display font-bold text-sm tracking-tight">STUDIO</span>
                                    <span className="font-display text-xs text-muted-foreground ml-1">Command Center</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-4">
                                Management-Plattform für Fitness Studios. Entwickelt von der Mokka Agentur GbR in Hilchenbach, Deutschland.
                            </p>
                            <a
                                href="https://mokka-agentur.de"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-muted-foreground hover:text-[var(--lime)] transition-colors"
                            >
                                <span className="font-bold">mokka.</span>Agentur
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Produkt</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Features', href: '/#features' },
                                    { label: 'Module', href: '/#modules' },
                                    { label: 'Preise', href: '/#pricing' },
                                    { label: 'FAQ', href: '/#faq' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Zugang</h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Demo ausprobieren
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Registrieren
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Rechtliches</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Impressum', href: '/impressum' },
                                    { label: 'Datenschutz', href: '/datenschutz' },
                                    { label: 'AGB', href: '/agb' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Kontakt</h4>
                            <div className="space-y-2.5">
                                <a href="mailto:info@mokka-agentur.de" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    info@mokka-agentur.de
                                </a>
                                <a href="tel:+491570000000" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    +49 157 0000000
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground font-display">
                            &copy; {new Date().getFullYear()} Mokka Agentur GbR. Alle Rechte vorbehalten.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Entwickelt in Hilchenbach, Deutschland.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
