"use client"

import { Suspense, useState } from "react"
import { signIn } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const DEMO_ACCOUNTS = DEMO_ENABLED
  ? {
      studioleiter: { email: "admin@teststudio.de", password: "TestPass123!" },
      mitarbeiter: { email: "mitarbeiter@teststudio.de", password: "TestPass123!" },
    }
  : null

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })

      if (result.error) {
        setError(result.error.message || "Anmeldefehler")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: "studioleiter" | "mitarbeiter") => {
    if (!DEMO_ACCOUNTS) return
    setError("")
    setDemoLoading(role)

    try {
      const account = DEMO_ACCOUNTS[role]
      const result = await signIn.email({
        email: account.email,
        password: account.password,
        callbackURL: callbackUrl,
      })

      if (result.error) {
        setError(result.error.message || "Demo-Anmeldefehler")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
    } finally {
      setDemoLoading(null)
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
            Verwalte dein
            <br />
            <span className="text-gradient-lime">Studio.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Die ultimative Management Plattform für Fitness Studios. Inventar, Maschinen und Teamleistung an einem Ort.
          </p>
          {/* Decorative dots */}
          <div className="flex gap-2 pt-4">
            <div className="w-8 h-[3px] rounded-full bg-[var(--lime)]" />
            <div className="w-4 h-[3px] rounded-full bg-border" />
            <div className="w-4 h-[3px] rounded-full bg-border" />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Studio Command Center</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
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

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Willkommen zurück</h1>
            <p className="text-sm text-muted-foreground">Melde dich bei deinem Konto an</p>
          </div>

          {/* Demo Login Buttons */}
          {DEMO_ENABLED && DEMO_ACCOUNTS && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <p className="text-[11px] font-display font-semibold uppercase tracking-[0.15em] text-muted-foreground">Demo-Zugang</p>
            <Button
              type="button"
              onClick={() => handleDemoLogin("studioleiter")}
              disabled={!!demoLoading || loading}
              className="w-full h-11 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold text-sm tracking-wide gap-2"
            >
              {demoLoading === "studioleiter" ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Anmelden...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Als Studioleiter einloggen
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDemoLogin("mitarbeiter")}
              disabled={!!demoLoading || loading}
              className="w-full h-11 font-display font-bold text-sm tracking-wide gap-2 border-[var(--lime)]/30 text-[var(--lime)] hover:bg-[var(--lime)]/10"
            >
              {demoLoading === "mitarbeiter" ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Anmelden...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  Als Mitarbeiter einloggen
                </>
              )}
            </Button>
          </div>
          )}

          {/* Divider */}
          {DEMO_ENABLED && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-display font-semibold uppercase tracking-[0.15em] text-muted-foreground">oder</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-display">{error}</div>
            )}
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
            <div className="space-y-2">
              <Label htmlFor="password" className="font-display text-[11px] font-semibold uppercase tracking-wider">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 font-body"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !!demoLoading}
              className="w-full h-11 font-display font-bold text-sm tracking-wide"
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link href="/signup" className="text-[var(--lime)] hover:underline font-display font-semibold">
                Registrieren
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-display text-sm text-muted-foreground">Laden...</div>}>
      <SignInForm />
    </Suspense>
  )
}
