import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 rounded-xl bg-[var(--lime)]/20 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[32px] text-[var(--lime)]">fitness_center</span>
                </div>
                <h1 className="text-6xl font-black text-foreground mb-2">404</h1>
                <h2 className="text-xl font-bold text-foreground mb-3">Seite nicht gefunden</h2>
                <p className="text-muted-foreground mb-8">
                    Die angeforderte Seite existiert nicht oder wurde verschoben.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--lime)] text-black font-bold hover:bg-[var(--lime)]/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Zum Dashboard
                </Link>
            </div>
        </div>
    )
}
