'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface AssignTaskFormProps {
    templates: { id: string; title: string; points: number }[]
    employees: { id: string; userId: string; displayName: string }[]
    onSubmit: (data: any) => Promise<any>
}

export function AssignTaskForm({ templates, employees, onSubmit }: AssignTaskFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedTaskTemplateId, setSelectedTaskTemplateId] = useState('')
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            taskTemplateId: formData.get('taskTemplateId') as string,
            assignedToUserId: formData.get('assignedToUserId') as string,
            dueDate: formData.get('dueDate') as string || null,
        }

        const newErrors: Record<string, string> = {}
        if (!data.taskTemplateId) newErrors.taskTemplateId = 'Aufgabe ist erforderlich'
        if (!data.assignedToUserId) newErrors.assignedToUserId = 'Mitarbeiter ist erforderlich'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsSubmitting(false)
            return
        }

        try {
            await onSubmit(data)
            router.push('/tasks')
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Aufgabe zuweisen</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.form && (
                        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                            {errors.form}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="taskTemplateId">Aufgabe *</Label>
                        <input type="hidden" name="taskTemplateId" value={selectedTaskTemplateId} />
                        <Select value={selectedTaskTemplateId} onValueChange={setSelectedTaskTemplateId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Aufgabe auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.title} ({template.points} Punkte)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.taskTemplateId && <p className="text-sm text-destructive">{errors.taskTemplateId}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assignedToUserId">Mitarbeiter *</Label>
                        <input type="hidden" name="assignedToUserId" value={selectedEmployeeId} />
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Mitarbeiter auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.userId}>
                                        {employee.displayName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.assignedToUserId && <p className="text-sm text-destructive">{errors.assignedToUserId}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                        <Input id="dueDate" name="dueDate" type="date" />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Wird gespeichert...' : 'Zuweisen'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
