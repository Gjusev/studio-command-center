'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar, MobileSidebar, MobileNavButton } from '@/components/layout/sidebar'
import { ThemeToggle } from '@/components/theme-provider'
import { NotificationBell } from '@/components/layout/notification-bell'
import { GlobalSearch } from '@/components/layout/global-search'
import { PermissionsProvider } from '@/components/layout/permissions-provider'
import type { Permission } from '@/lib/auth/types'

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/contracts': 'Mitglieder',
    '/classes': 'Kursplanung',
    '/finances': 'Finanzen',
    '/consumables': 'Inventar',
    '/machines': 'Maschinen',
    '/tasks': 'Aufgaben',
    '/employees': 'Team',
    '/reports': 'Berichte',
    '/settings': 'Einstellungen',
    '/profile': 'Profil',
}

function getPageTitle(pathname: string): string {
    // Exact match first
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
    // Sub-path match
    const match = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path + '/'))
    return match ? match[1] : ''
}

export function ProtectedShell({
    children,
    userRole,
    userName,
    userEmail,
    permissions,
}: {
    children: React.ReactNode
    userRole: 'studioleiter' | 'mitarbeiter'
    userName: string
    userEmail: string
    permissions: Permission[]
}) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const pageTitle = getPageTitle(pathname)

    return (
        <PermissionsProvider permissions={permissions} role={userRole}>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} permissions={permissions} />
            <MobileSidebar
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                permissions={permissions}
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 glass-header sticky top-0 z-30 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <MobileNavButton onClick={() => setMobileOpen(true)} />
                        {pageTitle && (
                            <h2 className="hidden md:block font-display text-sm font-bold tracking-[0.1em] uppercase text-muted-foreground">{pageTitle}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        <div className="hidden md:block">
                            <GlobalSearch />
                        </div>
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
        </PermissionsProvider>
    )
}
