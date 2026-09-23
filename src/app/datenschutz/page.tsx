import Link from 'next/link'

export default function DatenschutzPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-6 py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Zurück zur Startseite
                </Link>

                <h1 className="font-display text-4xl font-bold tracking-tighter mb-12">Datenschutzerklärung</h1>

                <div className="prose prose-sm prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">1. Verantwortlicher</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Mokka Agentur GbR<br />
                            vertretungsberechtigte Gesellschafter: Youssef Ouhaghi Ahmian &amp; Jasid Khalaf<br />
                            Untere Wiesenstraße 32, 57271 Hilchenbach, Deutschland<br /><br />
                            Telefon: +49 157 0000000 – E-Mail: info@mokka-agentur.de
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">2. Hosting</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Unsere Systeme laufen auf Servern eines europäischen Hosting-Providers. Es werden Server-Logfiles verarbeitet (IP-Adresse, Datum/Uhrzeit, URL, Referrer, User-Agent, Statuscode), um den sicheren Betrieb zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Sicherstellung von Stabilität und Sicherheit). Logdaten werden automatisch gelöscht, sobald sie nicht mehr erforderlich sind.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">3. Webanalyse (Rybbit)</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Wir setzen Rybbit Analytics (selbst gehostet auf rybbit.mokka-dev.de) zur Reichweitenmessung ein. Rybbit arbeitet <strong className="text-foreground">ohne Cookies</strong> und erfasst ausschließlich anonymisierte Nutzungsdaten (Seitenaufrufe, Referrer, aufgerufene URLs, Browsertyp, Sprache, Bildschirmgröße). IP-Adressen werden gekürzt und anonymisiert. Es findet keine personenbezogene Profilbildung statt.<br /><br />
                            Da keine Cookies gesetzt werden und die Daten vollständig anonymisiert sind, ist eine Einwilligung nicht erforderlich. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Optimierung unseres Angebots). Sie können der Verarbeitung jederzeit widersprechen (E-Mail an info@mokka-agentur.de).
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">4. Consent-Management &amp; Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Für das Einholen und Dokumentieren Ihrer Auswahl verwenden wir CookieConsent (vanilla-cookieconsent). Beim Laden des Banners wird ein technisch notwendiger Cookie gesetzt:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mt-3 space-y-1">
                            <li><strong className="text-foreground">cc_cookie</strong> (Laufzeit: 6 Monate, Zweck: Speicherung Ihrer Einwilligungsentscheidung, Kategorie: notwendig)</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-3">
                            Es werden keine weiteren Cookies gesetzt, solange Sie keine optionale Analyse (z.B. Google Analytics) aktivieren.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">5. Erhebung personenbezogener Daten bei Registrierung</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Bei der Registrierung und Nutzung von Studio Command Center erheben wir folgende personenbezogene Daten: Name, E-Mail-Adresse und gegebenenfalls Studio-Informationen. Diese Daten werden ausschließlich zur Bereitstellung des Dienstes verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">6. Eingesetzte Schriftarten</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Wir nutzen Google Fonts über das Framework <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">next/font/google</code>. Die Schriften werden beim Build heruntergeladen und lokal vom eigenen Server ausgeliefert. Es erfolgt kein Aufruf von Google-Servern beim Seitenbesuch.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">7. Ihre Rechte</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit sowie Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Bitte richten Sie Ihr Anliegen an info@mokka-agentur.de.<br /><br />
                            Beschwerderecht bei der zuständigen Aufsichtsbehörde: LDI Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display text-lg font-bold tracking-tight mb-3">8. Aktualisierung</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Wir passen diese Datenschutzerklärung an, sobald sich Dienstleistungen oder Rechtslagen ändern.
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
