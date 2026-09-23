'use client'

import { useRouter } from 'next/navigation'
import { deleteMachine } from '@/app/actions/machines'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface MachineActionsProps {
    id: string
    name: string
    canDelete?: boolean
}

export function MachineActions({ id, name, canDelete = false }: MachineActionsProps) {
    const router = useRouter()

    if (!canDelete) return null

    const handleDelete = async () => {
        await deleteMachine(id)
        router.refresh()
    }

    return (
        <ConfirmDialog
            title="Maschine löschen?"
            description={`Möchten Sie "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
            onConfirm={handleDelete}
            confirmText="Löschen"
            cancelText="Abbrechen"
            trigger={
                <button
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Löschen"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            }
        />
    )
}
