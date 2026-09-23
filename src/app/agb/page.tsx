import Link from 'next/link'

export default function AGBPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-6 py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Zurück zur Startseite
                </Link>

                <h1 className="font-display text-4xl font-bold tracking-tighter mb-12">Allgemeine Geschäftsbedingungen</h1>

                <div className="prose prose-sm prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">1. Geltungsbereich</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung von Studio Command Center, einer Webanwendung der Mokka Agentur GbR. Mit der Nutzung unserer Dienste akzeptieren Sie diese AGB.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">2. Leistungsbeschreibung</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Studio Command Center ist eine webbasierte Management-Plattform für Fitness-Studios. Die Plattform bietet Funktionen zur Verwaltung von Inventar, Maschinen, Mitarbeitern, Kursen, Verträgen und Finanzen. Die genauen Funktionen können sich im Laufe der Zeit ändern.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">3. Registrierung und Nutzerkonto</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Die Nutzung von Studio Command Center setzt die Registrierung voraus. Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vertraulich zu behandeln. Der Nutzer ist für alle Aktivitäten verantwortlich, die unter seinem Konto durchgeführt werden.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">4. Verfügbarkeit</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Wir bemühen uns, Studio Command Center möglichst unterbrechungsfrei zur Verfügung zu stellen. Eine ununterbrochene Verfügbarkeit kann jedoch nicht garantiert werden. Wartungsarbeiten, Störungen und Weiterentwicklungen können zu temporären Einschränkungen führen.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">5. Nutzungsrechte</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Dem Nutzer wird ein einfaches, nicht übertragbares Recht zur Nutzung von Studio Command Center für die Dauer der Vertragsbeziehung eingeräumt. Eine Weitergabe der Zugangsdaten an Dritte ist untersagt.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">6. Haftung</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Die Haftung der Mokka Agentur GbR ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Die Haftung für mittelbare Schäden, insbesondere entgangenen Gewinn, ist ausgeschlossen. Die vorstehenden Haftungsbeschränkungen gelten nicht bei Verletzung von Leben, Körper oder Gesundheit.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">7. Datenschutz</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Die Erhebung und Verarbeitung personenbezogener Daten richtet sich nach unserer <Link href="/datenschutz" className="text-[var(--lime)] hover:underline">Datenschutzerklärung</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">8. Schlussbestimmungen</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Hilchenbach, sofern der Nutzer Kaufmann ist. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-border">
                    <p className="text-xs text-muted-foreground">Studio Command Center ist ein Produkt der Mokka Agentur GbR.</p>
                </div>
            </div>
        </div>
    )
}
