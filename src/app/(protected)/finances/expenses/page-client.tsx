'use client'

import { useState } from 'react'
import { createExpense, deleteExpense } from '@/app/actions/finances'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Expense { id: string; category: string; amount: number; description: string; expenseDate: string; supplierName: string | null }
interface Supplier { id: string; name: string }

export default function ExpensesPage({ initialExpenses, suppliers }: { initialExpenses: Expense[]; suppliers: Supplier[] }) {
    const [expenses, setExpenses] = useState(initialExpenses)
    const [categoryFilter, setCategoryFilter] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [category, setCategory] = useState('OTHER')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
    const [supplierId, setSupplierId] = useState('')

    const categories: Record<string, string> = {
        RENT: 'Miete', EQUIPMENT: 'Geräte', SUPPLIES: 'Material', SALARY: 'Gehälter',
        MARKETING: 'Marketing', INSURANCE: 'Versicherung', UTILITIES: 'Nebenkosten',
        SOFTWARE: 'Software', OTHER: 'Sonstiges',
    }

    const filtered = categoryFilter === 'ALL' ? expenses : expenses.filter(e => e.category === categoryFilter)

    const categoryCounts: Record<string, number> = { ALL: expenses.length }
    expenses.forEach(e => { categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1 })
    const usedCategories = [...new Set(expenses.map(e => e.category))]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createExpense({ category, amount: parseFloat(amount), description, expenseDate, supplierId: supplierId || undefined })
            toast.success('Ausgabe erstellt')
            setShowForm(false); setAmount(''); setDescription('')
            window.location.reload()
        } catch { toast.error('Fehler') }
        finally { setIsSubmitting(false) }
    }

    async function handleDelete(id: string) {
        try {
            await deleteExpense(id)
            toast.success('Ausgabe gelöscht')
            setExpenses(prev => prev.filter(e => e.id !== id))
            setDeleteConfirm(null)
        } catch { toast.error('Fehler') }
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">Ausgaben</h1>
                    <p className="text-sm text-muted-foreground">Ausgaben erfassen und verwalten</p>
                </div>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                    <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Abbrechen' : 'Neue Ausgabe'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kategorie *</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                                {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Betrag (€) *</label>
                            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Beschreibung *</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Datum</label>
                            <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lieferant (optional)</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                                <option value="">Kein Lieferant</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} size="sm">{isSubmitting ? 'Wird erstellt...' : 'Ausgabe erstellen'}</Button>
                </form>
            )}

            {/* Category filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setCategoryFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${categoryFilter === 'ALL' ? 'bg-[var(--lime)] text-black' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
                    Alle ({categoryCounts.ALL})
                </button>
                {usedCategories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-[var(--lime)] text-black' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
                        {categories[cat] || cat} ({categoryCounts[cat] || 0})
                    </button>
                ))}
            </div>

            {/* Delete confirmation dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-card rounded-xl border border-border p-6 mx-4 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-destructive text-[24px]">warning</span>
                            <h3 className="font-bold text-foreground">Ausgabe löschen?</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Abbrechen</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirm)}>Löschen</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Datum</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Kategorie</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Beschreibung</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Betrag</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Keine Ausgaben</td></tr>
                        ) : filtered.map(e => (
                            <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-3 text-sm text-muted-foreground">{new Date(e.expenseDate).toLocaleDateString('de-DE')}</td>
                                <td className="px-6 py-3"><Badge variant="outline" className="text-xs">{categories[e.category] || e.category}</Badge></td>
                                <td className="px-6 py-3 text-sm text-foreground">{e.description}</td>
                                <td className="px-6 py-3 text-sm font-bold text-foreground">{Number(e.amount).toFixed(2)} €</td>
                                <td className="px-6 py-3 text-right">
                                    <button onClick={() => setDeleteConfirm(e.id)} className="text-xs text-destructive hover:underline">Löschen</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Keine Ausgaben</div>
                ) : filtered.map(e => (
                    <div key={e.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground text-sm truncate">{e.description}</span>
                            <Badge variant="outline" className="text-[10px] flex-shrink-0">{categories[e.category] || e.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">{Number(e.amount).toFixed(2)} €</span>
                            <span className="text-xs text-muted-foreground">{new Date(e.expenseDate).toLocaleDateString('de-DE')}</span>
                        </div>
                        {e.supplierName && <p className="text-xs text-muted-foreground">Lieferant: {e.supplierName}</p>}
                        <div className="flex justify-end pt-1">
                            <button onClick={() => setDeleteConfirm(e.id)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">delete</span>Löschen
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
