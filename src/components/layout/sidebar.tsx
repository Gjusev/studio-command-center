'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { UserMenu } from './user-menu'
import type { Permission } from '@/lib/auth/types'

interface SidebarProps {
    userRole: 'studioleiter' | 'mitarbeiter'
    userName: string
    userEmail: string
    permissions: Permission[]
    mobileOpen?: boolean
    onMobileClose?: () => void
}

interface NavItem {
    name: string
    href: string
    icon: string
    roles: ('studioleiter' | 'mitarbeiter')[]
    permission?: Permission
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', roles: ['studioleiter', 'mitarbeiter'] },
    { name: 'Mitglieder', href: '/contracts', icon: 'groups', roles: ['studioleiter', 'mitarbeiter'], permission: 'contracts.manage' },
    { name: 'Kursplanung', href: '/classes', icon: 'event', roles: ['studioleiter', 'mitarbeiter'], permission: 'classes.manage' },
    { name: 'Finanzen', href: '/finances', icon: 'account_balance', roles: ['studioleiter'], permission: 'finances.view' },
    { name: 'Inventar', href: '/consumables', icon: 'inventory_2', roles: ['studioleiter', 'mitarbeiter'] },
    { name: 'Maschinen', href: '/machines', icon: 'fitness_center', roles: ['studioleiter', 'mitarbeiter'] },
    { name: 'Aufgaben', href: '/tasks', icon: 'badge', roles: ['studioleiter', 'mitarbeiter'] },
    { name: 'Team', href: '/employees', icon: 'group', roles: ['studioleiter'], permission: 'employees.view' },
    { name: 'Berichte', href: '/reports', icon: 'summarize', roles: ['studioleiter'], permission: 'reports.view' },
    { name: 'Einstellungen', href: '/settings', icon: 'settings', roles: ['studioleiter'], permission: 'settings.manage' },
]

function isVisible(item: NavItem, userRole: string, permissions: Permission[]): boolean {
    // Studioleiter always sees everything
    if (userRole === 'studioleiter') return true
    // Check if the item is available for mitarbeiter
    if (!item.roles.includes('mitarbeiter')) {
        // This item is studioleiter-only, but mitarbeiter can see it if they have the permission
        if (item.permission && permissions.includes(item.permission)) return true
        return false
    }
    return true
}

function SidebarContent({ userRole, userName, userEmail, collapsed, onNavigate, permissions }: {
    userRole: string
    userName: string
    userEmail: string
    collapsed: boolean
    onNavigate?: () => void
    permissions: Permission[]
}) {
    const pathname = usePathname()
    const visibleNav = navigation.filter(item => isVisible(item, userRole, permissions))

    return (
        <>
            {/* Logo area */}
            <div className="px-4 pt-5 pb-3">
                <div className="flex items-center gap-3 h-11">
                    <div className="h-9 w-9 rounded-md bg-[var(--lime)] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-black font-bold">fitness_center</span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-display text-[13px] font-bold tracking-tight text-foreground leading-none">STUDIO</span>
                            <span className="font-display text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase leading-none mt-1">Command Center</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 mt-4 overflow-y-auto">
                {visibleNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center gap-3 rounded-md transition-all duration-150 group relative',
                                collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5',
                                isActive
                                    ? 'bg-[var(--lime)]/10 text-[var(--lime)]'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                            title={collapsed ? item.name : undefined}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--lime)]" />
                            )}
                            <span className={cn(
                                "material-symbols-outlined text-[20px] flex-shrink-0",
                                isActive && "icon-fill",
                                !isActive && "group-hover:text-foreground"
                            )}>
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className={cn(
                                    "text-[13px] whitespace-nowrap",
                                    isActive ? "font-bold" : "font-medium"
                                )}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User menu */}
            <div className="px-3 py-4 border-t border-border">
                <UserMenu
                    userName={userName}
                    userRole={userRole as 'studioleiter' | 'mitarbeiter'}
                    userEmail={userEmail}
                    collapsed={collapsed}
                />
            </div>
        </>
    )
}

export function Sidebar({ userRole, userName, userEmail, permissions }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn(
            "hidden md:flex flex-shrink-0 flex-col border-r border-border bg-card h-full z-20 transition-all duration-300",
            collapsed ? "w-[72px]" : "w-[260px]"
        )}>
            <SidebarContent
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                collapsed={collapsed}
                permissions={permissions}
            />
            <div className="px-3 pb-2">
                <div className="h-px bg-border mx-1"></div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        'flex items-center gap-3 rounded-md transition-all duration-150 group w-full',
                        collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5',
                        'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={collapsed ? 'Erweitern' : 'Einklappen'}
                >
                    <span className="material-symbols-outlined text-[20px] flex-shrink-0 group-hover:text-foreground">
                        {collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
                    </span>
                    {!collapsed && (
                        <span className="text-[13px] font-medium whitespace-nowrap">
                            Einklappen
                        </span>
                    )}
                </button>
            </div>
        </aside>
    )
}

export function MobileSidebar({ userRole, userName, userEmail, permissions, open, onClose }: {
    userRole: 'studioleiter' | 'mitarbeiter'
    userName: string
    userEmail: string
    permissions: Permission[]
    open: boolean
    onClose: () => void
}) {

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-card border-r border-border flex flex-col transition-transform duration-300 ease-out md:hidden',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Close button */}
                <div className="flex items-center justify-between px-4 pt-5 pb-2">
                    <div className="flex items-center gap-3 h-11">
                        <div className="h-9 w-9 rounded-md bg-[var(--lime)] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[18px] text-black font-bold">fitness_center</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-[13px] font-bold tracking-tight text-foreground leading-none">STUDIO</span>
                            <span className="font-display text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase leading-none mt-1">Command Center</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <SidebarContent
                    userRole={userRole}
                    userName={userName}
                    userEmail={userEmail}
                    collapsed={false}
                    onNavigate={onClose}
                    permissions={permissions}
                />
            </aside>
        </>
    )
}

export function MobileNavButton({ onClick }: { onClick: () => void }) {
    const pathname = usePathname()
    const _currentPage = navigation.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`))

    return (
        <div className="flex items-center gap-3 md:hidden">
            <button
                onClick={onClick}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                aria-label="Menu öffnen"
            >
                <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            {_currentPage && (
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--lime)] text-[18px]">{_currentPage.icon}</span>
                    <span className="font-display text-sm font-bold text-foreground">{_currentPage.name}</span>
                </div>
            )}
        </div>
    )
}
