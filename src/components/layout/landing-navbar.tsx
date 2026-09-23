'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function LandingNavbar() {
    const _pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { theme, toggleTheme } = useTheme()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'glass-header shadow-sm' : 'bg-transparent'}`}>
            <div className="mx-auto max-w-7xl px-6">
                <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 rounded-lg bg-[var(--lime)] flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-[var(--lime)]/20">
                            <span className="material-symbols-outlined text-lg text-black font-bold">fitness_center</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-sm font-bold tracking-tight text-foreground leading-none">STUDIO</span>
                            <span className="font-display text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase leading-none mt-0.5">Command Center</span>
                        </div>
                    </Link>

                    {/* Navigation Links — desktop */}
                    <div className="hidden lg:flex items-center gap-1">
                        {[
                            { href: '/#features', label: 'Features' },
                            { href: '/#modules', label: 'Module' },
                            { href: '/#pricing', label: 'Preise' },
                            { href: '/#about', label: 'Kunden' },
                            { href: '/#faq', label: 'FAQ' },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons + Theme Toggle */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[var(--lime)]/50 hover:bg-muted/50 transition-all"
                            aria-label="Theme wechseln"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground h-9 px-4">
                            <Link href="/signin">Anmelden</Link>
                        </Button>
                        <Button size="sm" asChild className="h-9 px-5 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold tracking-wide rounded-lg shadow-lg shadow-[var(--lime)]/20">
                            <Link href="/signup">Registrieren</Link>
                        </Button>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Theme wechseln"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            className="text-foreground p-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined">
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-border glass-header">
                    <div className="px-6 py-5 space-y-1">
                        {[
                            { href: '/#features', label: 'Features' },
                            { href: '/#modules', label: 'Module' },
                            { href: '/#pricing', label: 'Preise' },
                            { href: '/#about', label: 'Kunden' },
                            { href: '/#faq', label: 'FAQ' },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-sm text-muted-foreground hover:text-foreground py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 mt-2 border-t border-border space-y-2">
                            <Button variant="ghost" size="sm" asChild className="w-full justify-center h-10">
                                <Link href="/signin">Anmelden</Link>
                            </Button>
                            <Button size="sm" asChild className="w-full justify-center h-10 bg-[var(--lime)] text-black hover:bg-[var(--lime-dark)] font-display font-bold rounded-lg">
                                <Link href="/signup">Registrieren</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
