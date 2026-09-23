'use client'

import { createContext, useContext } from 'react'
import type { Permission, UserRole } from '@/lib/auth/types'

const PermissionsContext = createContext<{
    permissions: Permission[]
    role: UserRole
}>({ permissions: [], role: 'mitarbeiter' })

export function PermissionsProvider({
    children,
    permissions,
    role,
}: {
    children: React.ReactNode
    permissions: Permission[]
    role: UserRole
}) {
    return (
        <PermissionsContext.Provider value={{ permissions, role }}>
            {children}
        </PermissionsContext.Provider>
    )
}

export function usePermissions() {
    return useContext(PermissionsContext)
}

export function useHasPermission(permission: Permission): boolean {
    const { role, permissions } = usePermissions()
    if (role === 'studioleiter') return true
    return permissions.includes(permission)
}

export function useHasAnyPermission(...perms: Permission[]): boolean {
    const { role, permissions } = usePermissions()
    if (role === 'studioleiter') return true
    return perms.some(p => permissions.includes(p))
}
