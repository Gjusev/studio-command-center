'use client'

import { useState } from 'react'
import { deactivateUser, activateUser, updateEmployeeRole } from '@/app/actions/users'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'

interface EmployeeActionsProps {
    employeeId: string
    userId: string | null
    employeeName: string
    currentRole: 'studioleiter' | 'mitarbeiter'
    isActive: boolean
}

export function EmployeeActions({
    employeeId: _employeeId,
    userId,
    employeeName,
    currentRole,
    isActive,
}: EmployeeActionsProps) {
    const router = useRouter()
    const [_isDeactivating, setIsDeactivating] = useState(false)
    const [isActivating, setIsActivating] = useState(false)
    const [isUpdatingRole, setIsUpdatingRole] = useState(false)
    const [open, setOpen] = useState(false)

    const closeDropdown = () => setOpen(false)

    const handleDeactivate = async () => {
        if (!userId) return
        closeDropdown()
        setIsDeactivating(true)
        try {
            await deactivateUser(userId)
            router.refresh()
        } catch (error) {
            console.error('Fehler beim Deaktivieren:', error)
        } finally {
            setIsDeactivating(false)
        }
    }

    const handleActivate = async () => {
        if (!userId) return
        closeDropdown()
        setIsActivating(true)
        try {
            await activateUser(userId)
            router.refresh()
        } catch (error) {
            console.error('Fehler beim Aktivieren:', error)
        } finally {
            setIsActivating(false)
        }
    }

    const handleRoleChange = async (newRole: 'studioleiter' | 'mitarbeiter') => {
        if (newRole === currentRole) return
        if (!userId) return

        closeDropdown()
        setIsUpdatingRole(true)
        try {
            await updateEmployeeRole(userId, newRole)
            router.refresh()
        } catch (error) {
            console.error('Fehler beim Ändern der Rolle:', error)
        } finally {
            setIsUpdatingRole(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {/* Status Badge */}
            <Badge
                variant={isActive ? 'default' : 'outline'}
                className={
                    isActive
                        ? 'border border-primary/20 bg-primary/10 text-primary'
                        : 'border border-destructive/20 bg-destructive/10 text-destructive'
                }
            >
                {isActive ? 'Aktiv' : 'Inaktiv'}
            </Badge>

            {/* Actions Dropdown */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!userId}>
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Role Management */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                        Rolle ändern
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => handleRoleChange('studioleiter')}
                        disabled={isUpdatingRole || currentRole === 'studioleiter'}
                        className={currentRole === 'studioleiter' ? 'bg-muted/50' : ''}
                    >
                        <span className="material-symbols-outlined mr-2 text-[18px]">shield</span>
                        Studioleiter
                        {currentRole === 'studioleiter' && (
                            <span className="material-symbols-outlined ml-auto text-[18px]">check</span>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleRoleChange('mitarbeiter')}
                        disabled={isUpdatingRole || currentRole === 'mitarbeiter'}
                        className={currentRole === 'mitarbeiter' ? 'bg-muted/50' : ''}
                    >
                        <span className="material-symbols-outlined mr-2 text-[18px]">person</span>
                        Mitarbeiter
                        {currentRole === 'mitarbeiter' && (
                            <span className="material-symbols-outlined ml-auto text-[18px]">check</span>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Activation/Deactivation */}
                    {isActive ? (
                        <ConfirmDialog
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <span className="material-symbols-outlined mr-2 text-[18px]">block</span>
                                    Deaktivieren
                                </DropdownMenuItem>
                            }
                            title="Mitarbeiter deaktivieren"
                            description={`Möchten Sie ${employeeName} wirklich deaktivieren? Der Benutzer wird sich nicht mehr anmelden können.`}
                            confirmText="Deaktivieren"
                            onConfirm={handleDeactivate}
                            variant="destructive"
                        />
                    ) : (
                        <DropdownMenuItem
                            onClick={handleActivate}
                            disabled={isActivating}
                        >
                            <span className="material-symbols-outlined mr-2 text-[18px]">check_circle</span>
                            Aktivieren
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
