'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface TaskTemplateFormProps {
    initialData?: any
    onSubmit: (data: any) => Promise<any>
    submitLabel: string
    title: string
}

export function TaskTemplateForm({
    initialData,
    onSubmit,
    submitLabel,
    title,
}: TaskTemplateFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string || null,
            frequency: formData.get('frequency') as string || null,
            points: parseInt(formData.get('points') as string) || 1,
        }

        const newErrors: Record<string, string> = {}
        if (!data.title) newErrors.title = 'Titel ist erforderlich'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsSubmitting(false)
            return
        }

        try {
            await onSubmit(data)
            router.back()
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto">
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

                    <div className="space-y-2">
                        <Label htmlFor="title">Titel *</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={initialData?.title}
                            required
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea
                            id="description"
                            name="description"
                            rows={3}
                            defaultValue={initialData?.description || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequenz</Label>
                        <Input
                            id="frequency"
                            name="frequency"
                            placeholder="z.B. Täglich, Wöchentlich, Monatlich"
                            defaultValue={initialData?.frequency || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="points">Punkte</Label>
                        <Input
                            id="points"
                            name="points"
                            type="number"
                            min="1"
                            defaultValue={initialData?.points || 1}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
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
