'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface SimpleFormProps {
    fields: {
        name: string
        label: string
        type?: 'text' | 'textarea' | 'email'
        required?: boolean
    }[]
    onSubmit: (data: any) => Promise<any>
    submitLabel: string
    title: string
    initialData?: any
    id?: string
}

export function SimpleForm({ fields, onSubmit, submitLabel, title, initialData, id }: SimpleFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data: any = {}

        fields.forEach((field) => {
            data[field.name] = formData.get(field.name)
        })

        // Validación básica
        const newErrors: Record<string, string> = {}
        fields.forEach((field) => {
            if (field.required && !data[field.name]) {
                newErrors[field.name] = `${field.label} ist erforderlich`
            }
        })

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

                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && ' *'}
                            </Label>
                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    rows={3}
                                    defaultValue={initialData?.[field.name] || ''}
                                />
                            ) : (
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || 'text'}
                                    defaultValue={initialData?.[field.name] || ''}
                                />
                            )}
                            {errors[field.name] && (
                                <p className="text-sm text-destructive">{errors[field.name]}</p>
                            )}
                        </div>
                    ))}

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
