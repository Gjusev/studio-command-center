'use client'

import { useState } from 'react'
import { createMovement } from '@/app/actions/consumables'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MovementFormProps {
    consumableId: string
    currentStock: number
}

export function MovementForm({ consumableId, currentStock }: MovementFormProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [type, setType] = useState<'IN' | 'OUT' | 'ADJUST' | 'WASTE'>('IN')
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await createMovement({
                consumableId,
                type,
                quantity: parseFloat(quantity),
                reason: reason || undefined,
            })
            toast.success('Buchung erfolgreich erstellt')
            setIsOpen(false)
            setQuantity('')
            setReason('')
            router.refresh()
        } catch (error) {
            console.error('Fehler beim Buchen der Bewegung:', error)
            toast.error(error instanceof Error ? error.message : 'Fehler beim Buchen der Bewegung')
        } finally {
            setIsLoading(false)
        }
    }

    const movementTypes = [
        { value: 'IN' as const, label: 'Eingang', icon: 'add_circle', color: 'text-green-600' },
        { value: 'OUT' as const, label: 'Ausgang', icon: 'remove_circle', color: 'text-orange-600' },
        { value: 'ADJUST' as const, label: 'Korrektur', icon: 'sync', color: 'text-blue-600' },
        { value: 'WASTE' as const, label: 'Ausschuss', icon: 'delete', color: 'text-red-600' },
    ]

    const selectedType = movementTypes.find((t) => t.value === type)

    if (!isOpen) {
        return (
            <Panel title="Buchung">
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Neue Buchung erstellen</p>
                    <Button onClick={() => setIsOpen(true)}>
                        <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                        Neue Buchung
                    </Button>
                </div>
            </Panel>
        )
    }

    return (
        <Panel title="Neue Buchung">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Typ */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Typ</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <span className={`material-symbols-outlined mr-2 ${selectedType?.color}`}>
                                        {selectedType?.icon}
                                    </span>
                                    {selectedType?.label}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px]">
                                {movementTypes.map((t) => (
                                    <DropdownMenuItem
                                        key={t.value}
                                        onClick={() => setType(t.value)}
                                        className={type === t.value ? 'bg-muted/50' : ''}
                                    >
                                        <span className={`material-symbols-outlined mr-2 ${t.color}`}>
                                            {t.icon}
                                        </span>
                                        {t.label}
                                        {type === t.value && (
                                            <span className="material-symbols-outlined ml-auto">
                                                check
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Menge */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Menge</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Grund */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-foreground">Grund (optional)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Grund für die Buchung..."
                        />
                    </div>
                </div>

                {/* Preview */}
                {quantity && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Vorschau</p>
                        <p className="text-foreground">
                            Aktueller Bestand: <strong>{currentStock}</strong> →{' '}
                            {type === 'IN' && (
                                <strong className="text-green-600">
                                    {currentStock + parseFloat(quantity)}
                                </strong>
                            )}
                            {type === 'OUT' && (
                                <strong
                                    className={
                                        currentStock - parseFloat(quantity) < 0
                                            ? 'text-red-600'
                                            : 'text-orange-600'
                                    }
                                >
                                    {currentStock - parseFloat(quantity)}
                                </strong>
                            )}
                            {type === 'ADJUST' && (
                                <strong className="text-blue-600">{parseFloat(quantity)}</strong>
                            )}
                            {type === 'WASTE' && (
                                <strong
                                    className={
                                        currentStock - parseFloat(quantity) < 0
                                            ? 'text-red-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {currentStock - parseFloat(quantity)}
                                </strong>
                            )}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button type="submit" disabled={isLoading || !quantity}>
                        {isLoading ? 'Wird gebucht...' : 'Buchen'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false)
                            setQuantity('')
                            setReason('')
                        }}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                </div>
            </form>
        </Panel>
    )
}
