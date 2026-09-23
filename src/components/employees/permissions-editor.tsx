'use client'

import { useState, useEffect } from 'react'
import { setPermissionsForUser } from '@/app/actions/permissions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Client-safe: permission labels and groups must be duplicated here
// since importing from guards.ts pulls in server-only modules
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

interface PermissionsEditorProps {
    userId: string
    displayName: string
    currentPermissions: string[]
}

export function PermissionsEditor({ userId, displayName, currentPermissions }: PermissionsEditorProps) {
    const [permissions, setPermissions] = useState<string[]>(currentPermissions)
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        setHasChanges(
            permissions.length !== currentPermissions.length ||
            permissions.some(p => !currentPermissions.includes(p))
        )
    }, [permissions, currentPermissions])

    function togglePermission(perm: string) {
        setPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        )
    }

    function toggleGroup(perms: string[]) {
        const allEnabled = perms.every(p => permissions.includes(p))
        if (allEnabled) {
            setPermissions(prev => prev.filter(p => !perms.includes(p)))
        } else {
            setPermissions(prev => [...new Set([...prev, ...perms])])
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            await setPermissionsForUser(userId, permissions as any)
            setHasChanges(false)
            toast.success('Berechtigungen gespeichert')
        } catch (error) {
            toast.error('Fehler beim Speichern der Berechtigungen')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="p-6 border-b border-border">
                <h2 className="text-foreground text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    Berechtigungen
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Verwalten Sie die Berechtigungen von {displayName}
                </p>
            </div>
            <div className="p-6 space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                    const allEnabled = group.permissions.every(p => permissions.includes(p))
                    const someEnabled = group.permissions.some(p => permissions.includes(p))

                    return (
                        <div key={group.label} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">{group.label}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group.permissions)}
                                    className={cn(
                                        "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                                        allEnabled
                                            ? "bg-primary/20 text-primary"
                                            : someEnabled
                                                ? "bg-yellow-400/20 text-yellow-400"
                                                : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {allEnabled ? 'Alle an' : someEnabled ? 'Teilweise' : 'Alle aus'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {group.permissions.map((perm) => (
                                    <label
                                        key={perm}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                            permissions.includes(perm)
                                                ? "border-primary/50 bg-primary/10"
                                                : "border-border bg-background hover:border-primary/30"
                                        )}
                                    >
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={permissions.includes(perm)}
                                                onChange={() => togglePermission(perm)}
                                                className="sr-only"
                                            />
                                            <div className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                permissions.includes(perm)
                                                    ? "bg-primary border-primary"
                                                    : "border-border"
                                            )}>
                                                {permissions.includes(perm) && (
                                                    <span className="material-symbols-outlined text-[14px] text-primary-foreground">check</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground">{PERMISSION_LABELS[perm]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            {hasChanges && (
                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Änderungen gespeichert?</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPermissions(currentPermissions)}
                            className="px-3 py-2 border border-border text-foreground hover:bg-muted text-xs font-medium rounded-lg transition-all"
                        >
                            Zurücksetzen
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                            ) : (
                                <span className="material-symbols-outlined text-[14px]">save</span>
                            )}
                            Speichern
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
