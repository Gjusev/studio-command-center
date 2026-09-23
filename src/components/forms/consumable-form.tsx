'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ConsumableFormProps {
    categories: { id: string; name: string }[]
    locations: { id: string; name: string }[]
    suppliers: { id: string; name: string }[]
    initialData?: any
    onSubmit: (data: any) => Promise<any>
    submitLabel: string
    title: string
    id?: string
}

export function ConsumableForm({
    categories,
    locations,
    suppliers,
    initialData,
    onSubmit,
    submitLabel,
    title,
    id,
}: ConsumableFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || '')
    const [selectedLocationId, setSelectedLocationId] = useState(initialData?.locationId || '')
    const [selectedSupplierId, setSelectedSupplierId] = useState(initialData?.supplierId || '')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            categoryId: formData.get('categoryId') as string || null,
            locationId: formData.get('locationId') as string || null,
            supplierId: formData.get('supplierId') as string || null,
            unit: formData.get('unit') as string,
            stockCurrent: parseFloat(formData.get('stockCurrent') as string) || 0,
            stockMin: parseFloat(formData.get('stockMin') as string) || 0,
            unitCost: parseFloat(formData.get('unitCost') as string) || null,
            expiresOn: formData.get('expiresOn') as string || null,
            notes: formData.get('notes') as string || null,
        }

        // Validación básica
        const newErrors: Record<string, string> = {}
        if (!data.name) newErrors.name = 'Name ist erforderlich'
        if (!data.unit) newErrors.unit = 'Einheit ist erforderlich'

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
            toast.success('Erfolgreich gespeichert')
            router.push('/consumables')
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
            toast.error(error.message || 'Fehler beim Speichern')
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
                        <div className="space-y-2">
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
                            <Label htmlFor="unit">Einheit *</Label>
                            <Input
                                id="unit"
                                name="unit"
                                placeholder="z.B. kg, Liter, Stück"
                                defaultValue={initialData?.unit}
                                required
                            />
                            {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
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
                            <Label htmlFor="supplierId">Lieferant</Label>
                            <input type="hidden" name="supplierId" value={selectedSupplierId || ''} />
                            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((sup) => (
                                        <SelectItem key={sup.id} value={sup.id}>
                                            {sup.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="stockCurrent">Aktueller Bestand</Label>
                            <Input
                                id="stockCurrent"
                                name="stockCurrent"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={initialData?.stockCurrent || 0}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stockMin">Mindestbestand</Label>
                            <Input
                                id="stockMin"
                                name="stockMin"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={initialData?.stockMin || 0}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitCost">Einheitspreis (€)</Label>
                            <Input
                                id="unitCost"
                                name="unitCost"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optional"
                                defaultValue={initialData?.unitCost || ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiresOn">Ablaufdatum</Label>
                        <Input
                            id="expiresOn"
                            name="expiresOn"
                            type="date"
                            defaultValue={initialData?.expiresOn || ''}
                        />
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
