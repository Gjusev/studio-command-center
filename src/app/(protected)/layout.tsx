import { getUserWithPermissions } from '@/lib/auth/guards'
import { ProtectedShell } from './shell'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUserWithPermissions()

    return (
        <ProtectedShell
            userRole={user.role}
            userName={user.displayName}
            userEmail={user.email}
            permissions={user.permissions}
        >
            {children}
        </ProtectedShell>
    )
}
