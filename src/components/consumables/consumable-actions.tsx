'use client'

import { useRouter } from 'next/navigation'
import { deleteConsumable } from '@/app/actions/consumables'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ConsumableActionsProps {
    id: string
    name: string
    canDelete?: boolean
}

export function ConsumableActions({ id, name, canDelete = false }: ConsumableActionsProps) {
    const router = useRouter()

    if (!canDelete) return null

    const handleDelete = async () => {
        await deleteConsumable(id)
        router.refresh()
    }

    return (
        <ConfirmDialog
            title="Verbrauchsmaterial löschen?"
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
