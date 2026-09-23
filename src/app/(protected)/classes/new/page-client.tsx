'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClassSchedule } from '@/app/actions/classes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ClassType { id: string; name: string; durationMinutes: number; maxCapacity: number }
interface Employee { id: string; displayName: string }
interface Location { id: string; name: string }

export default function NewClassPage({
    classTypes, employees, locations
}: {
    classTypes: ClassType[]; employees: Employee[]; locations: Location[]
}) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [classTypeId, setClassTypeId] = useState(classTypes[0]?.id || '')
    const [trainerId, setTrainerId] = useState('')
    const [locationId, setLocationId] = useState('')
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [recurrence, setRecurrence] = useState('NONE')
    const [maxCapacity, setMaxCapacity] = useState('')
    const [notes, setNotes] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const startDT = `${date}T${startTime}:00`
            const endDT = `${date}T${endTime}:00`
            await createClassSchedule({
                classTypeId, trainerId: trainerId || undefined, locationId: locationId || undefined,
                title: title || undefined, startTime: startDT, endTime: endDT,
                recurrence, maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
                notes: notes || undefined,
            })
            toast.success('Kurs erfolgreich erstellt')
            router.push('/classes')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Fehler beim Erstellen')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-foreground">Neuer Kurs</h1>
                <p className="text-muted-foreground">Planen Sie einen neuen Kurs</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-6 space-y-5">
                    {/* Class Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Kursart *</label>
                        <select value={classTypeId} onChange={e => setClassTypeId(e.target.value)} required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                            {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name} ({ct.durationMinutes} Min.)</option>)}
                        </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Titel (optional)</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                            placeholder="z.B. Yoga für Anfänger" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Datum *</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                        </div>
                        {/* Recurrence */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Wiederholung</label>
                            <select value={recurrence} onChange={e => setRecurrence(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                                <option value="NONE">Einmalig</option>
                                <option value="WEEKLY">Wöchentlich</option>
                                <option value="BIWEEKLY">Alle 2 Wochen</option>
                                <option value="MONTHLY">Monatlich</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Startzeit *</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                        </div>
                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Endzeit *</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Trainer */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Trainer</label>
                            <select value={trainerId} onChange={e => setTrainerId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                                <option value="">Kein Trainer</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.displayName}</option>)}
                            </select>
                        </div>
                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Standort</label>
                            <select value={locationId} onChange={e => setLocationId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                                <option value="">Kein Standort</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Max Capacity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Max. Teilnehmer (optional)</label>
                        <input type="number" min="1" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                            placeholder="Übernimmt Standard der Kursart" />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Notizen (optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                            placeholder="Zusätzliche Hinweise..." />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-muted/50 flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Wird erstellt...' : 'Kurs erstellen'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
