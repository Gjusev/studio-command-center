'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface MachineFormProps {
    categories: { id: string; name: string }[]
    locations: { id: string; name: string }[]
    initialData?: any
    onSubmit: (data: any) => Promise<any>
    submitLabel: string
    title: string
    studioId?: string
    machineId?: string
    id?: string
}

export function MachineForm({
    categories,
    locations,
    initialData,
    onSubmit,
    submitLabel,
    title,
    studioId: _studioId,
    machineId: _machineId,
    id,
}: MachineFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || '')
    const [selectedLocationId, setSelectedLocationId] = useState(initialData?.locationId || '')
    const [selectedStatus, setSelectedStatus] = useState(initialData?.status || 'IN_SERVICE')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            categoryId: formData.get('categoryId') as string || null,
            locationId: formData.get('locationId') as string || null,
            brand: formData.get('brand') as string || null,
            model: formData.get('model') as string || null,
            serialNo: formData.get('serialNo') as string || null,
            purchasedOn: formData.get('purchasedOn') as string || null,
            purchaseCost: parseFloat(formData.get('purchaseCost') as string) || null,
            status: formData.get('status') as any,
            lastServiceOn: formData.get('lastServiceOn') as string || null,
            nextServiceOn: formData.get('nextServiceOn') as string || null,
            notes: formData.get('notes') as string || null,
            photoUrl: formData.get('photoUrl') as string || null,
        }

        // Validación básica
        const newErrors: Record<string, string> = {}
        if (!data.name) newErrors.name = 'Name ist erforderlich'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsSubmitting(false)
            return
        }

        try {
            if (id) {
                await onSubmit({ id, ...data })
            } else {
                await onSubmit(data)
            }
            router.push('/machines')
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.form && (
                        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                            {errors.form}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData?.name}
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Kategorie</Label>
                            <input type="hidden" name="categoryId" value={selectedCategoryId || ''} />
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="locationId">Standort</Label>
                            <input type="hidden" name="locationId" value={selectedLocationId || ''} />
                            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">Hersteller</Label>
                            <Input
                                id="brand"
                                name="brand"
                                defaultValue={initialData?.brand || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="model">Modell</Label>
                            <Input
                                id="model"
                                name="model"
                                defaultValue={initialData?.model || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serialNo">Seriennummer</Label>
                            <Input
                                id="serialNo"
                                name="serialNo"
                                defaultValue={initialData?.serialNo || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <input type="hidden" name="status" value={selectedStatus} />
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IN_SERVICE">In Betrieb</SelectItem>
                                    <SelectItem value="OUT_OF_SERVICE">Außer Betrieb</SelectItem>
                                    <SelectItem value="MAINTENANCE">Wartung</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchasedOn">Kaufdatum</Label>
                            <Input
                                id="purchasedOn"
                                name="purchasedOn"
                                type="date"
                                defaultValue={initialData?.purchasedOn || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchaseCost">Kaufpreis (€)</Label>
                            <Input
                                id="purchaseCost"
                                name="purchaseCost"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={initialData?.purchaseCost || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastServiceOn">Letzte Wartung</Label>
                            <Input
                                id="lastServiceOn"
                                name="lastServiceOn"
                                type="date"
                                defaultValue={initialData?.lastServiceOn || ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nextServiceOn">Nächste Wartung</Label>
                            <Input
                                id="nextServiceOn"
                                name="nextServiceOn"
                                type="date"
                                defaultValue={initialData?.nextServiceOn || ''}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="photoUrl">Foto URL</Label>
                            <Input
                                id="photoUrl"
                                name="photoUrl"
                                type="url"
                                placeholder="https://..."
                                defaultValue={initialData?.photoUrl || ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notizen</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Zusätzliche Informationen..."
                            rows={3}
                            defaultValue={initialData?.notes || ''}
                        />
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
                            {isSubmitting ? 'Wird gespeichert...' : submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
