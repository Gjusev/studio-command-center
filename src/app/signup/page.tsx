"use client"

import { Suspense, useState, useEffect } from "react"
import { signUp } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { cn } from "@/lib/utils"

type SignupMode = "new-studio" | "join-studio"

interface InvitationData {
    displayName: string
    role: string
    studioName: string
}

function SignUpForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get("invite")

    const [mode, setMode] = useState<SignupMode>(inviteToken ? "join-studio" : "new-studio")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [studioName, setStudioName] = useState("")
    const [inviteCode, setInviteCode] = useState(inviteToken || "")
    const [invitation, setInvitation] = useState<InvitationData | null>(null)
    const [inviteError, setInviteError] = useState("")
    const [inviteLoading, setInviteLoading] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Auto-validate invite token from URL
    useEffect(() => {
        if (inviteToken) {
            validateInviteCode(inviteToken)
        }
    }, [inviteToken])

    async function validateInviteCode(token: string) {
        if (!token.trim()) return
        setInviteLoading(true)
        setInviteError("")

        try {
            const res = await fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`)
            if (!res.ok) {
                const data = await res.json()
                setInviteError(data.error || "Einladung nicht gefunden")
                setInvitation(null)
                return
            }

            const data: InvitationData = await res.json()
            setInvitation(data)
            setName(data.displayName)
        } catch {
            setInviteError("Fehler beim Validieren der Einladung")
            setInvitation(null)
        } finally {
            setInviteLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwörter stimmen nicht überein")
            return
        }

        if (password.length < 8) {
            setError("Passwort muss mindestens 8 Zeichen lang sein")
            return
        }

        if (mode === "new-studio" && !studioName.trim()) {
            setError("Bitte geben Sie einen Studio-Namen ein")
            return
        }

        setLoading(true)

        try {
            const result = await signUp.email({
                name,
                email,
                password,
                callbackURL: "/dashboard",
            })

            if (result.error) {
                setError(result.error.message || "Registrierungsfehler")
                return
            }

            // If joining a studio via invitation, claim it
            if (mode === "join-studio" && inviteCode && result.data?.user?.id) {
                try {
                    await fetch("/api/invitations/claim", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: inviteCode, userId: result.data.user.id }),
                    })
                } catch (claimError) {
                    console.error("Failed to claim invitation:", claimError)
                }
            }

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Ein Fehler ist aufgetreten")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12 relative">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-[var(--lime)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-black font-bold">fitness_center</span>
                        </div>
                        <div>
                            <span className="font-display text-sm font-bold tracking-tight text-foreground">STUDIO</span>
                            <span className="font-display text-xs text-muted-foreground ml-1">Command Center</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="font-display text-4xl font-bold tracking-tighter leading-[0.95]">
                        Starte jetzt
                        <br />
                        <span className="text-gradient-lime">kostenlos.</span>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                        14 Tage Testphase. Keine Kreditkarte erforderlich. Jederzeit kündbar.
                    </p>
                    {/* Benefit list */}
                    <div className="space-y-3 pt-4">
                        {['Inventar Management', 'Maschinen Tracking', 'Team Performance', 'Analytics Dashboard'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-[var(--lime)] text-[16px]">check_circle</span>
                                <span className="text-muted-foreground">{item}</span>
                            </div>
                        ))}
                    </div>
                    {/* Decorative dots */}
                    <div className="flex gap-2 pt-4">
                        <div className="w-4 h-[3px] rounded-full bg-border" />
                        <div className="w-4 h-[3px] rounded-full bg-border" />
                        <div className="w-8 h-[3px] rounded-full bg-[var(--lime)]" />
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs text-muted-foreground">&copy; 2025 Studio Command Center</p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="h-9 w-9 rounded-md bg-[var(--lime)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-black font-bold">fitness_center</span>
                        </div>
                        <div>
                            <span className="font-display text-sm font-bold tracking-tight">STUDIO</span>
                            <span className="font-display text-xs text-muted-foreground ml-1">Command Center</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Konto erstellen</h1>
                        <p className="text-sm text-muted-foreground">
                            {mode === "new-studio" ? "Erstelle dein Studio und Administratorkonto" : "Tritt einem Studio bei"}
                        </p>
                    </div>

                    {/* Mode selector */}
                    {!inviteToken && (
                        <div className="flex rounded-lg border border-border overflow-hidden mb-6">
                            <button
                                type="button"
                                onClick={() => setMode("new-studio")}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-display font-bold uppercase tracking-wider transition-colors",
                                    mode === "new-studio"
                                        ? "bg-[var(--lime)] text-black"
                                        : "bg-card text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Neues Studio
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("join-studio")}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-display font-bold uppercase tracking-wider transition-colors border-l border-border",
                                    mode === "join-studio"
                                        ? "bg-[var(--lime)] text-black"
                                        : "bg-card text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Beitreten
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-display">{error}</div>
                        )}

                        {/* Join studio: invite code */}
                        {mode === "join-studio" && (
                            <div className="space-y-2">
                                <Label className="font-display text-[11px] font-semibold uppercase tracking-wider">Einladungscode</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Einladungscode eingeben"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        className="h-11 font-body"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => validateInviteCode(inviteCode)}
                                        disabled={inviteLoading || !inviteCode.trim()}
                                        className="h-11 px-3 shrink-0"
                                    >
                                        {inviteLoading ? (
                                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        )}
                                    </Button>
                                </div>
                                {inviteError && (
                                    <p className="text-destructive text-xs">{inviteError}</p>
                                )}
                                {invitation && (
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                                            <span className="text-sm font-bold text-foreground">Einladung bestätigt</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Studio: <span className="text-foreground font-medium">{invitation.studioName}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Rolle: <span className="text-foreground font-medium">{invitation.role === 'studioleiter' ? 'Studioleiter' : 'Mitarbeiter'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New studio: studio name */}
                        {mode === "new-studio" && (
                            <div className="space-y-2">
                                <Label htmlFor="studio" className="font-display text-[11px] font-semibold uppercase tracking-wider">Studio Name</Label>
                                <Input
                                    id="studio"
                                    type="text"
                                    placeholder="Mein Fitness Studio"
                                    value={studioName}
                                    onChange={(e) => setStudioName(e.target.value)}
                                    required
                                    className="h-11 font-body"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-display text-[11px] font-semibold uppercase tracking-wider">Dein Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Max Mustermann"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11 font-body"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-display text-[11px] font-semibold uppercase tracking-wider">E-Mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@studio.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 font-body"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-display text-[11px] font-semibold uppercase tracking-wider">Passwort</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min. 8 Zeichen"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 font-body"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-display text-[11px] font-semibold uppercase tracking-wider">Bestätigen</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-11 font-body"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || (mode === "join-studio" && !invitation)}
                            className="w-full h-11 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold text-sm tracking-wide"
                        >
                            {loading ? "Wird registriert..." : mode === "new-studio" ? "Kostenlos starten" : "Studio beitreten"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Bereits ein Konto?{" "}
                            <Link href="/signin" className="text-[var(--lime)] hover:underline font-display font-semibold">
                                Anmelden
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-display text-sm text-muted-foreground">Laden...</div>}>
            <SignUpForm />
        </Suspense>
    )
}
