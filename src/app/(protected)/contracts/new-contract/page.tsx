'use client'

import { useState, useEffect } from 'react'
import { createContract, getMembers, createMember } from '@/app/actions/contracts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function NewContractPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [members, setMembers] = useState<{ id: string; firstName: string; lastName: string; email: string | null }[]>([])
    const [filtered, setFiltered] = useState<{ id: string; firstName: string; lastName: string; email: string | null }[]>([])
    const [search, setSearch] = useState('')
    const [selectedMember, setSelectedMember] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [showNewMember, setShowNewMember] = useState(false)
    const [selectedType, setSelectedType] = useState('MONTHLY')
    const [endDate, setEndDate] = useState('')

    // New member fields
    const [newFirstName, setNewFirstName] = useState('')
    const [newLastName, setNewLastName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPhone, setNewPhone] = useState('')

    useEffect(() => { getMembers().then(setMembers) }, [])

    useEffect(() => {
        if (!search.trim()) { setFiltered([]); setShowDropdown(false); return }
        const q = search.toLowerCase()
        const results = members.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
            (m.email && m.email.toLowerCase().includes(q))
        )
        setFiltered(results.slice(0, 10))
        setShowDropdown(results.length > 0)
    }, [search, members])

    function selectMember(m: { id: string; firstName: string; lastName: string }) {
        setSelectedMember(m.id)
        setSearch(`${m.firstName} ${m.lastName}`)
        setShowDropdown(false)
        setShowNewMember(false)
    }

    function handleNoResult() {
        setShowNewMember(true)
        // Parse name from search
        const parts = search.trim().split(/\s+/)
        setNewFirstName(parts[0] || '')
        setNewLastName(parts.slice(1).join(' ') || '')
    }

    const typeOptions = [
        { value: 'MONTHLY', label: 'Monatlich', price: 49.90 },
        { value: 'QUARTERLY', label: 'Vierteljährlich', price: 129.90 },
        { value: 'YEARLY', label: 'Jährlich', price: 499 },
        { value: 'DAY_PASS', label: 'Tageskarte', price: 15 },
        { value: 'TRIAL', label: 'Probezeit', price: 0 },
    ]

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            let memberId = selectedMember

            // Auto-create member if in new member mode
            if (showNewMember && !selectedMember) {
                if (!newFirstName || !newLastName) {
                    toast.error('Vorname und Nachname sind erforderlich')
                    setIsSubmitting(false)
                    return
                }
                const res = await createMember({
                    firstName: newFirstName,
                    lastName: newLastName,
                    email: newEmail || undefined,
                    phone: newPhone || undefined,
                })
                if (res.success) memberId = res.id
                else { toast.error('Fehler beim Erstellen des Mitglieds'); setIsSubmitting(false); return }
            }

            if (!memberId) { toast.error('Bitte ein Mitglied auswählen oder erstellen'); setIsSubmitting(false); return }

            const result = await createContract({
                memberId,
                type: selectedType,
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate') || undefined,
                priceMonthly: parseFloat(formData.get('priceMonthly') as string) || 0,
                deposit: parseFloat(formData.get('deposit') as string) || undefined,
                notes: (formData.get('notes') as string) || undefined,
            })
            if (result.success) {
                toast.success('Vertrag erfolgreich erstellt')
                router.push('/contracts')
                router.refresh()
            }
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Erstellen')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Neuer Vertrag</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-5">
                        {/* Member search / select */}
                        <div className="space-y-2">
                            <Label>Mitglied *</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Name oder E-Mail suchen..."
                                    value={selectedMember ? search : search}
                                    onChange={(e) => { setSearch(e.target.value); if (selectedMember) { setSelectedMember('') } }}
                                    onFocus={() => { if (filtered.length) setShowDropdown(true) }}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                />
                                {selectedMember && (
                                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                                        onClick={() => { setSelectedMember(''); setSearch('') }}>
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}

                                {/* Dropdown */}
                                {showDropdown && !selectedMember && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {filtered.map(m => (
                                            <button key={m.id} type="button" className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted flex items-center justify-between gap-2"
                                                onMouseDown={() => selectMember(m)}>
                                                <span className="font-medium">{m.firstName} {m.lastName}</span>
                                                {m.email && <span className="text-xs text-muted-foreground truncate">{m.email}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected indicator */}
                            {selectedMember && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                    <span className="text-sm font-medium text-primary">{search}</span>
                                    <input type="hidden" name="memberId" value={selectedMember} />
                                </div>
                            )}

                            {/* No result -> create new member */}
                            {!selectedMember && search.trim().length >= 2 && !showDropdown && members.length > 0 && (
                                <div className="mt-2">
                                    <button type="button" className="text-sm text-primary hover:underline flex items-center gap-1"
                                        onClick={handleNoResult}>
                                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                                        Neues Mitglied &quot;{search}&quot; anlegen
                                    </button>
                                </div>
                            )}
                            {!selectedMember && <input type="hidden" name="memberId" value="" />}
                        </div>

                        {/* Inline new member form */}
                        {showNewMember && !selectedMember && (
                            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Neues Mitglied erstellen</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Vorname *" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} />
                                    <Input placeholder="Nachname *" value={newLastName} onChange={e => setNewLastName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="email" placeholder="E-Mail (optional)" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                                    <Input placeholder="Telefon (optional)" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* Type */}
                        <div className="space-y-2">
                            <Label>Vertragstyp *</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {typeOptions.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className={`p-3 rounded-lg border text-left transition-all ${selectedType === t.value
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                                            : 'border-border hover:border-muted-foreground/30'
                                            }`}
                                        onClick={() => setSelectedType(t.value)}
                                    >
                                        <span className="text-sm font-medium block">{t.label}</span>
                                        <span className="text-xs text-muted-foreground">{t.price > 0 ? `${t.price.toFixed(2)} €` : 'Kostenlos'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Startdatum *</Label>
                                <Input id="startDate" name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Enddatum <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="endDate" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="priceMonthly">Preis / Monat (€) *</Label>
                                <Input id="priceMonthly" name="priceMonthly" type="number" step="0.01" min="0" required
                                    defaultValue={typeOptions.find(t => t.value === selectedType)?.price || 49.90} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Kaution (€) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="deposit" name="deposit" type="number" step="0.01" min="0" placeholder="0.00" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notizen <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                            <Textarea id="notes" name="notes" rows={3} placeholder="Besondere Vereinbarungen..." />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
                            <Button type="submit" disabled={isSubmitting || (!selectedMember && !showNewMember)}>
                                {isSubmitting ? 'Wird erstellt...' : 'Vertrag erstellen'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
