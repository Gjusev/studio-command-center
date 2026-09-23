'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface UserMenuProps {
    userName: string
    userRole: 'studioleiter' | 'mitarbeiter'
    userEmail: string
    collapsed?: boolean
}

export function UserMenu({ userName, userRole, userEmail, collapsed = false }: UserMenuProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOut()
            router.push('/signin')
        } catch (error) {
            console.error('Logout failed:', error)
            setIsLoggingOut(false)
        }
    }

    if (collapsed) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="size-9 rounded-md bg-[var(--lime)]/10 flex items-center justify-center text-[var(--lime)] border border-[var(--lime)]/20 hover:bg-[var(--lime)]/20 transition-colors"
                    title={`${userName} (${userRole === 'studioleiter' ? 'Studio Lead' : 'Mitarbeiter'})`}
                >
                    <span className="font-display text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <div className="absolute bottom-0 left-0 mb-2 w-52 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                            <div className="p-3 border-b border-border">
                                <p className="font-display text-sm font-bold text-foreground">{userName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                                <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                                    {userRole === 'studioleiter' ? 'Studio Lead' : 'Mitarbeiter'}
                                </p>
                            </div>
                            <div className="p-1">
                                <button onClick={() => { setIsOpen(false); router.push('/profile') }}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors">
                                    Profil
                                </button>
                                {userRole === 'studioleiter' && (
                                    <button onClick={() => { setIsOpen(false); router.push('/settings') }}
                                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors">
                                        Einstellungen
                                    </button>
                                )}
                                <div className="h-px bg-border my-1 mx-2" />
                                <button onClick={handleLogout} disabled={isLoggingOut}
                                    className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50">
                                    {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer w-full"
            >
                <div className="size-9 rounded-md bg-[var(--lime)]/10 flex items-center justify-center text-[var(--lime)] border border-[var(--lime)]/20 flex-shrink-0">
                    <span className="font-display text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="font-display text-[13px] font-bold text-foreground truncate">{userName}</p>
                    <p className="text-[10px] font-display font-medium uppercase tracking-wider text-muted-foreground">
                        {userRole === 'studioleiter' ? 'Studio Lead' : 'Mitarbeiter'}
                    </p>
                </div>
                <span className={cn(
                    "material-symbols-outlined text-muted-foreground text-[18px] transition-transform duration-200",
                    isOpen && "rotate-180"
                )}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                        <div className="p-3 border-b border-border">
                            <p className="font-display text-sm font-bold text-foreground">{userName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <div className="p-1">
                            <button onClick={() => { setIsOpen(false); router.push('/profile') }}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors">
                                Profil
                            </button>
                            {userRole === 'studioleiter' && (
                                <button onClick={() => { setIsOpen(false); router.push('/settings') }}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors">
                                    Einstellungen
                                </button>
                            )}
                            <div className="h-px bg-border my-1 mx-2" />
                            <button onClick={handleLogout} disabled={isLoggingOut}
                                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50">
                                {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
