'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createMachineEvent } from '@/app/actions/machines'
import { toast } from 'sonner'

interface Machine {
    id: string
    name: string
    status: string
}

export default function MaintenancePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [machines, setMachines] = useState<Machine[]>([])
    const [machinesLoaded, setMachinesLoaded] = useState(false)
    const [selectedMachineId, setSelectedMachineId] = useState('')

    if (!machinesLoaded) {
        import('@/app/actions/machines').then(({ getMachines }) => {
            getMachines().then((m) => {
                setMachines(m)
                setMachinesLoaded(true)
            })
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            machineId: selectedMachineId,
            type: formData.get('type') as string,
            status: 'OPEN',
            description: formData.get('description') as string,
            cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
            downtimeMinutes: formData.get('downtimeMinutes') ? parseInt(formData.get('downtimeMinutes') as string) : null,
        }

        const newErrors: Record<string, string> = {}
        if (!data.machineId) newErrors.machineId = 'Maschine ist erforderlich'
        if (!data.description) newErrors.description = 'Beschreibung ist erforderlich'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsSubmitting(false)
            return
        }

        try {
            await createMachineEvent(data)
            toast.success('Wartungsereignis erstellt')
            router.push('/machines')
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
            toast.error(error.message || 'Fehler beim Speichern')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Wartung planen</h1>
                <p className="text-muted-foreground">
                    Neues Wartungsereignis erstellen
                </p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Wartungsereignis</CardTitle>
                </CardHeader>
                <CardContent>
                    {!machinesLoaded ? (
                        <p className="text-muted-foreground text-sm">Laden...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.form && (
                                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                                    {errors.form}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Maschine *</Label>
                                <input type="hidden" name="machineId" value={selectedMachineId} />
                                <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Maschine auswählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {machines.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.machineId && <p className="text-sm text-destructive">{errors.machineId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Typ *</Label>
                                <Select name="type" defaultValue="MAINTENANCE">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MAINTENANCE">Wartung</SelectItem>
                                        <SelectItem value="INSPECTION">Inspektion</SelectItem>
                                        <SelectItem value="INCIDENT">Vorfall</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Beschreibung *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Beschreibung des Ereignisses..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Kosten (€)</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="downtimeMinutes">Ausfallzeit (Min.)</Label>
                                    <Input
                                        id="downtimeMinutes"
                                        name="downtimeMinutes"
                                        type="number"
                                        min="0"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Wird gespeichert...' : 'Erstellen'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
