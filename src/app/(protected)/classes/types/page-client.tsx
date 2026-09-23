'use client'

import { useState } from 'react'
import { createClassType, updateClassType } from '@/app/actions/classes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ClassType { id: string; name: string; description: string | null; durationMinutes: number; maxCapacity: number; color: string }

export default function ClassTypesPage({ initialTypes }: { initialTypes: ClassType[] }) {
    const [types, setTypes] = useState(initialTypes)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState('60')
    const [capacity, setCapacity] = useState('20')
    const [color, setColor] = useState('#3B82F6')
    const [isSubmitting, setIsSubmitting] = useState(false)

    function startEdit(t: ClassType) {
        setEditingId(t.id)
        setName(t.name)
        setDescription(t.description || '')
        setDuration(t.durationMinutes.toString())
        setCapacity(t.maxCapacity.toString())
        setColor(t.color)
        setShowForm(true)
    }

    function resetForm() {
        setName(''); setDescription(''); setDuration('60'); setCapacity('20'); setColor('#3B82F6')
        setShowForm(false); setEditingId(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingId) {
                await updateClassType(editingId, { name, description: description || undefined, durationMinutes: parseInt(duration), maxCapacity: parseInt(capacity), color })
                setTypes(prev => prev.map(t => t.id === editingId ? { ...t, name, description, durationMinutes: parseInt(duration), maxCapacity: parseInt(capacity), color } : t))
                toast.success('Kursart aktualisiert')
            } else {
                const result = await createClassType({ name, description: description || undefined, durationMinutes: parseInt(duration), maxCapacity: parseInt(capacity), color })
                if (result.success) {
                    setTypes(prev => [...prev, { id: result.id, name, description, durationMinutes: parseInt(duration), maxCapacity: parseInt(capacity), color, isActive: true }])
                    toast.success('Kursart erstellt')
                }
            }
            resetForm()
        } catch (_err) {
            toast.error('Fehler beim Speichern')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Kursarten</h1>
                    <p className="text-muted-foreground">Verwalten Sie Ihre Kurskategorien</p>
                </div>
                <Button onClick={() => { if (showForm && !editingId) resetForm(); else { resetForm(); setShowForm(true) } }}>
                    <span className="material-symbols-outlined text-[18px]">{showForm && !editingId ? 'close' : 'add'}</span>
                    {showForm && !editingId ? 'Abbrechen' : 'Neue Kursart'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" placeholder="z.B. Yoga, HIIT" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Farbe</label>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)}
                                className="w-full h-10 rounded-lg border border-border bg-background cursor-pointer" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Beschreibung (optional)</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dauer (Min.)</label>
                            <input type="number" min="15" value={duration} onChange={e => setDuration(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max. Teilnehmer</label>
                            <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Wird gespeichert...' : editingId ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                </form>
            )}

            <div className="space-y-3">
                {types.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                        <span className="material-symbols-outlined text-4xl block mb-2">category</span>
                        Noch keine Kursarten. Erstellen Sie Ihre erste!
                    </div>
                ) : (
                    types.map(t => (
                        <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors group">
                            <div className="w-4 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                            <div className="flex-1">
                                <p className="font-bold text-foreground">{t.name}</p>
                                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-foreground">{t.durationMinutes} Min.</p>
                                <p className="text-muted-foreground">Max. {t.maxCapacity}</p>
                            </div>
                            <button onClick={() => startEdit(t)}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Bearbeiten">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
