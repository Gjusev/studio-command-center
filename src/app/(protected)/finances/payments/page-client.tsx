'use client'

import { useState } from 'react'
import { createPayment, updatePaymentStatus } from '@/app/actions/finances'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Payment { id: string; memberName: string | null; amount: number; method: string; status: string; dueDate: string | null; description: string | null }
interface Member { id: string; firstName: string; lastName: string }

export default function PaymentsPage({ initialPayments, members }: { initialPayments: Payment[]; members: Member[] }) {
    const [payments, setPayments] = useState(initialPayments)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [memberId, setMemberId] = useState('')
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('SEPA')
    const [dueDate, setDueDate] = useState('')
    const [description, setDescription] = useState('')

    const filtered = statusFilter === 'ALL' ? payments : payments.filter(p => p.status === statusFilter)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createPayment({ memberId: memberId || undefined, amount: parseFloat(amount), method, dueDate: dueDate || undefined, description: description || undefined })
            toast.success('Zahlung erstellt')
            setShowForm(false); setAmount(''); setDueDate(''); setDescription('')
            window.location.reload()
        } catch (_err) { toast.error('Fehler') }
        finally { setIsSubmitting(false) }
    }

    async function handleStatusChange(id: string, status: string) {
        try {
            await updatePaymentStatus(id, status)
            toast.success('Status aktualisiert')
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p))
        } catch { toast.error('Fehler') }
    }

    const statusConfig: Record<string, { label: string; variant: 'default' | 'outline' | 'destructive' | 'secondary' }> = {
        PENDING: { label: 'Ausstehend', variant: 'outline' },
        PAID: { label: 'Bezahlt', variant: 'default' },
        OVERDUE: { label: 'Überfällig', variant: 'destructive' },
        CANCELLED: { label: 'Storniert', variant: 'secondary' },
    }
    const methodLabels: Record<string, string> = { SEPA: 'SEPA', PAYPAL: 'PayPal', CASH: 'Bar', CARD: 'Karte', TRANSFER: 'Überweisung', OTHER: 'Sonstige' }

    const statusCounts = { ALL: payments.length, PENDING: payments.filter(p => p.status === 'PENDING').length, PAID: payments.filter(p => p.status === 'PAID').length, OVERDUE: payments.filter(p => p.status === 'OVERDUE').length }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">Zahlungen</h1>
                    <p className="text-sm text-muted-foreground">Einnahmen verwalten</p>
                </div>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                    <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Abbrechen' : 'Neue Zahlung'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mitglied</label>
                            <select value={memberId} onChange={e => setMemberId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                                <option value="">Allgemein</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Betrag (€) *</label>
                            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Zahlungsmethode</label>
                            <select value={method} onChange={e => setMethod(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                                {Object.entries(methodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fälligkeitsdatum</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Beschreibung (optional)</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="z.B. Mitgliedsbeitrag Januar" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} size="sm">{isSubmitting ? 'Wird erstellt...' : 'Erstellen'}</Button>
                </form>
            )}

            {/* Status filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.entries(statusCounts).map(([key, count]) => (
                    <button key={key} onClick={() => setStatusFilter(key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${statusFilter === key ? 'bg-[var(--lime)] text-black' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
                        {key === 'ALL' ? 'Alle' : statusConfig[key]?.label || key} ({count})
                    </button>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Mitglied</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Betrag</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Methode</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Fällig</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Keine Zahlungen gefunden</td></tr>
                        ) : filtered.map(p => {
                            const sc = statusConfig[p.status] || statusConfig.PENDING
                            return (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3 text-sm text-foreground font-medium">{p.memberName || p.description || '-'}</td>
                                    <td className="px-6 py-3 text-sm font-bold text-foreground">{Number(p.amount).toFixed(2)} €</td>
                                    <td className="px-6 py-3 text-sm text-muted-foreground">{methodLabels[p.method] || p.method}</td>
                                    <td className="px-6 py-3"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                                    <td className="px-6 py-3 text-sm text-muted-foreground">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('de-DE') : '-'}</td>
                                    <td className="px-6 py-3 text-right">
                                        {p.status === 'PENDING' && (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleStatusChange(p.id, 'PAID')} className="text-xs font-medium text-green-500 hover:underline">Als bezahlt</button>
                                                <button onClick={() => handleStatusChange(p.id, 'OVERDUE')} className="text-xs font-medium text-destructive hover:underline">Überfällig</button>
                                            </div>
                                        )}
                                        {p.status === 'OVERDUE' && (
                                            <button onClick={() => handleStatusChange(p.id, 'PAID')} className="text-xs font-medium text-green-500 hover:underline">Als bezahlt</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Keine Zahlungen gefunden</div>
                ) : filtered.map(p => {
                    const sc = statusConfig[p.status] || statusConfig.PENDING
                    return (
                        <div key={p.id} className="p-3 rounded-lg border border-border bg-background space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground text-sm truncate">{p.memberName || p.description || '-'}</span>
                                <Badge variant={sc.variant} className="text-[10px] flex-shrink-0">{sc.label}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">{Number(p.amount).toFixed(2)} €</span>
                                <span className="text-xs text-muted-foreground">{methodLabels[p.method] || p.method}</span>
                            </div>
                            {p.dueDate && <p className="text-xs text-muted-foreground">Fällig: {new Date(p.dueDate).toLocaleDateString('de-DE')}</p>}
                            {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => handleStatusChange(p.id, 'PAID')} className="text-xs font-medium text-green-500 hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check</span>Als bezahlt
                                    </button>
                                    {p.status === 'PENDING' && (
                                        <button onClick={() => handleStatusChange(p.id, 'OVERDUE')} className="text-xs font-medium text-destructive hover:underline flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">warning</span>Überfällig
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
