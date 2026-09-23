import Link from 'next/link'

export default function ImpressumPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-6 py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Zurück zur Startseite
                </Link>

                <h1 className="font-display text-4xl font-bold tracking-tighter mb-12">Impressum</h1>

                <div className="prose prose-sm prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Diensteanbieter</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Mokka Agentur GbR<br />
                            vertreten durch: Youssef Ouhaghi Ahmian &amp; Jasid Khalaf<br /><br />
                            Untere Wiesenstraße 32<br />
                            57271 Hilchenbach<br />
                            Deutschland
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Kontakt</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Telefon: +49 157 0000000<br />
                            E-Mail: info@mokka-agentur.de<br />
                            Web: <a href="https://mokka-agentur.de" className="text-[var(--lime)] hover:underline" target="_blank" rel="noopener noreferrer">mokka-agentur.de</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Unternehmensdaten</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Rechtsform: nicht eingetragene Gesellschaft bürgerlichen Rechts (GbR)<br />
                            Hauptniederlassung: Hilchenbach, Deutschland<br />
                            Handelsregister: nicht eingetragen<br />
                            Umsatzsteuer-ID: nicht vergeben/beantragt<br />
                            Zuständige Behörde: Stadt Hilchenbach – Bürgerbüro, Markt 13, 57271 Hilchenbach
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Inhaltlich Verantwortlicher</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Youssef Ouhaghi Ahmian (gemäß § 18 Abs. 2 MStV)<br />
                            Untere Wiesenstraße 32, 57271 Hilchenbach
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Haftungsausschluss</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">Urheberrecht</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Die durch die Mokka Agentur GbR erstellten Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung der Mokka Agentur GbR.
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
