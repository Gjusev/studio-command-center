'use client'

import { useState } from 'react'
import { inviteUser } from '@/app/actions/users'
import { useRouter } from 'next/navigation'

// Client-safe permission definitions (duplicated from guards.ts to avoid server-only imports)
const PERMISSION_LABELS: Record<string, string> = {
    "consumables.create": "Inventar erstellen",
    "consumables.edit": "Inventar bearbeiten",
    "consumables.delete": "Inventar löschen",
    "machines.create": "Maschinen erstellen",
    "machines.edit": "Maschinen bearbeiten",
    "machines.delete": "Maschinen löschen",
    "tasks.assign": "Aufgaben zuweisen",
    "tasks.manage_templates": "Aufgabenvorlagen verwalten",
    "employees.view": "Team einsehen",
    "classes.manage": "Kurse verwalten",
    "contracts.manage": "Mitglieder verwalten",
    "finances.view": "Finanzen einsehen",
    "reports.view": "Berichte einsehen",
    "settings.manage": "Einstellungen verwalten",
}

const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
    { label: "Inventar", permissions: ["consumables.create", "consumables.edit", "consumables.delete"] },
    { label: "Maschinen", permissions: ["machines.create", "machines.edit", "machines.delete"] },
    { label: "Aufgaben", permissions: ["tasks.assign", "tasks.manage_templates"] },
    { label: "Team", permissions: ["employees.view"] },
    { label: "Kurse", permissions: ["classes.manage"] },
    { label: "Mitglieder", permissions: ["contracts.manage"] },
    { label: "Finanzen", permissions: ["finances.view"] },
    { label: "Berichte", permissions: ["reports.view"] },
    { label: "Einstellungen", permissions: ["settings.manage"] },
]

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function InviteUserDialog() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [role, setRole] = useState<'studioleiter' | 'mitarbeiter'>('mitarbeiter')
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [inviteToken, setInviteToken] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await inviteUser({
                email,
                displayName,
                role,
                permissions: role === 'mitarbeiter' ? selectedPermissions as any : undefined,
            })
            setInviteToken(result.token || null)
            router.refresh()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Fehler beim Einladen des Benutzers')
        } finally {
            setIsLoading(false)
        }
    }

    function togglePermission(perm: string) {
        setSelectedPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        )
    }

    function copyInviteLink() {
        const link = `${window.location.origin}/signup?invite=${inviteToken}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleClose() {
        setIsOpen(false)
        setEmail('')
        setDisplayName('')
        setRole('mitarbeiter')
        setSelectedPermissions([])
        setInviteToken(null)
        setError('')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true) }}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>
                    <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
                    Benutzer einladen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {inviteToken ? 'Einladung erstellt!' : 'Neuen Benutzer einladen'}
                    </DialogTitle>
                    <DialogDescription>
                        {inviteToken
                            ? 'Teilen Sie diesen Link mit dem neuen Mitarbeiter.'
                            : 'Der Benutzer kann sich mit dem Einladungscode registrieren.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {inviteToken ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-3">
                            <p className="text-sm font-medium text-foreground">
                                <span className="material-symbols-outlined text-primary text-[16px] align-middle mr-1">link</span>
                                Einladungslink:
                            </p>
                            <div className="flex gap-2">
                                <code className="flex-1 p-2 rounded bg-background border border-border text-xs break-all">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/signup?invite=${inviteToken}` : `/signup?invite=${inviteToken}`}
                                </code>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={copyInviteLink}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="text-center">
                            <Button variant="outline" onClick={handleClose}>
                                Schließen
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* E-Mail */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">E-Mail *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="benutzer@beispiel.de"
                            />
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Name *</label>
                            <input
                                type="text"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Max Mustermann"
                            />
                        </div>

                        {/* Rolle - radio buttons instead of DropdownMenu */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Rolle</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    className={cn(
                                        "relative flex cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50",
                                        role === 'mitarbeiter'
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-background"
                                    )}
                                    onClick={() => {
                                        setRole('mitarbeiter')
                                    }}
                                >
                                    <input type="radio" name="invite-role" value="mitarbeiter" checked={role === 'mitarbeiter'} className="sr-only" readOnly />
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px] text-muted-foreground">badge</span>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Mitarbeiter</span>
                                            <span className="text-[10px] text-muted-foreground">Zugewiesene Aufgaben</span>
                                        </div>
                                    </div>
                                    {role === 'mitarbeiter' && (
                                        <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[16px]">check_circle</span>
                                    )}
                                </label>
                                <label
                                    className={cn(
                                        "relative flex cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50",
                                        role === 'studioleiter'
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-background"
                                    )}
                                    onClick={() => {
                                        setRole('studioleiter')
                                        setSelectedPermissions([])
                                    }}
                                >
                                    <input type="radio" name="invite-role" value="studioleiter" checked={role === 'studioleiter'} className="sr-only" readOnly />
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px] text-muted-foreground">shield_person</span>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Studioleiter</span>
                                            <span className="text-[10px] text-muted-foreground">Voller Zugriff</span>
                                        </div>
                                    </div>
                                    {role === 'studioleiter' && (
                                        <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[16px]">check_circle</span>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Permissions (only for mitarbeiter) */}
                        {role === 'mitarbeiter' && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Berechtigungen</label>
                                <div className="space-y-3 max-h-48 overflow-y-auto p-3 rounded-lg border border-border">
                                    {PERMISSION_GROUPS.map((group) => (
                                        <div key={group.label}>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{group.label}</p>
                                            <div className="space-y-1">
                                                {group.permissions.map((perm) => (
                                                    <label
                                                        key={perm}
                                                        className="flex items-center gap-2 cursor-pointer py-0.5"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(perm)}
                                                            onChange={() => togglePermission(perm)}
                                                            className="rounded border-border text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-xs text-foreground">{PERMISSION_LABELS[perm]}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={isLoading || !email || !displayName}>
                                {isLoading ? 'Wird gesendet...' : 'Einladen'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
