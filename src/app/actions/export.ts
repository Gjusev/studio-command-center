'use server'

import { requireUser, requireStudioleiter } from '@/lib/auth/guards'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getConsumables } from '@/app/actions/consumables'
import { getMembers } from '@/app/actions/contracts'
import { getMachines } from '@/app/actions/machines'
import { getPayments, getExpenses } from '@/app/actions/finances'
import { getCompletedTasks } from '@/app/actions/tasks'
import { getEmployees, getEmployeePerformanceStats } from '@/app/actions/employees'

type ExportFormat = 'pdf' | 'excel'

interface ExportResult {
    buffer: string
    filename: string
    mimeType: string
}

// ---- HELPERS ----

function toExcelBuffer(headers: string[], rows: any[][], sheetName: string): string {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = headers.map(() => ({ wch: 20 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return Buffer.from(buf).toString('base64')
}

function toPDFBuffer(title: string, subtitle: string, headers: string[], rows: any[][]): string {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(10)
    doc.text(subtitle, 14, 30)
    autoTable(doc, {
        startY: 38,
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [25, 230, 94] },
    })
    return Buffer.from(doc.output('arraybuffer')).toString('base64')
}

function todayStr() {
    return new Date().toISOString().split('T')[0]
}

function deDate(d: Date | string | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('de-DE')
}

// ---- EXPORT FUNCTIONS ----

export async function exportInventory(format: ExportFormat): Promise<ExportResult> {
    await requireUser()
    const data = await getConsumables({})
    const headers = ['Artikel', 'Kategorie', 'Standort', 'Bestand', 'Min.', 'Einheit', 'Status']
    const rows = data.map(c => [
        c.name, c.categoryName || '-', c.locationName || '-',
        c.stockCurrent.toString(), c.stockMin.toString(), c.unit,
        c.stockCurrent <= c.stockMin ? 'KRITISCH' : 'OK',
    ])
    const filename = `inventar-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Inventar'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Inventarbericht', `Erstellt am: ${deDate(new Date())}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportMembers(format: ExportFormat): Promise<ExportResult> {
    await requireStudioleiter()
    const data = await getMembers()
    const headers = ['Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Aktiv']
    const rows = data.map(m => [m.firstName, m.lastName, m.email || '-', m.phone || '-', m.isActive ? 'Ja' : 'Nein'])
    const filename = `mitglieder-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Mitglieder'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Mitgliederliste', `Erstellt am: ${deDate(new Date())} | Anzahl: ${data.length}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportMachines(format: ExportFormat): Promise<ExportResult> {
    await requireUser()
    const data = await getMachines({})
    const headers = ['Name', 'Marke', 'Modell', 'Kategorie', 'Standort', 'Status', 'Letzte Wartung', 'Nächste Wartung']
    const rows = data.map(m => [
        m.name, m.brand || '-', m.model || '-', m.categoryName || '-', m.locationName || '-',
        m.status, m.lastServiceOn ? deDate(m.lastServiceOn) : '-', m.nextServiceOn ? deDate(m.nextServiceOn) : '-',
    ])
    const filename = `maschinen-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Maschinen'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Maschinenbericht', `Erstellt am: ${deDate(new Date())}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportPayments(format: ExportFormat): Promise<ExportResult> {
    await requireStudioleiter()
    const data = await getPayments()
    const headers = ['Mitglied', 'Betrag', 'Methode', 'Status', 'Fällig', 'Beschreibung']
    const statusLabels: Record<string, string> = { PENDING: 'Ausstehend', PAID: 'Bezahlt', OVERDUE: 'Überfällig', CANCELLED: 'Storniert' }
    const methodLabels: Record<string, string> = { SEPA: 'SEPA', PAYPAL: 'PayPal', CASH: 'Bar', CARD: 'Karte', TRANSFER: 'Überweisung' }
    const rows = data.map(p => [
        p.memberName || p.description || '-', Number(p.amount).toFixed(2) + ' €',
        methodLabels[p.method] || p.method, statusLabels[p.status] || p.status,
        p.dueDate ? deDate(p.dueDate) : '-', p.description || '-',
    ])
    const filename = `zahlungen-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Zahlungen'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Zahlungsbericht', `Erstellt am: ${deDate(new Date())} | Anzahl: ${data.length}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportExpenses(format: ExportFormat): Promise<ExportResult> {
    await requireStudioleiter()
    const data = await getExpenses()
    const catLabels: Record<string, string> = { RENT: 'Miete', EQUIPMENT: 'Geräte', SUPPLIES: 'Material', SALARY: 'Gehälter', MARKETING: 'Marketing', INSURANCE: 'Versicherung', UTILITIES: 'Nebenkosten', SOFTWARE: 'Software', OTHER: 'Sonstiges' }
    const headers = ['Datum', 'Kategorie', 'Beschreibung', 'Betrag', 'Lieferant']
    const rows = data.map(e => [
        deDate(e.expenseDate), catLabels[e.category] || e.category, e.description,
        Number(e.amount).toFixed(2) + ' €', e.supplierName || '-',
    ])
    const filename = `ausgaben-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Ausgaben'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Ausgabenbericht', `Erstellt am: ${deDate(new Date())} | Anzahl: ${data.length}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportTasks(format: ExportFormat): Promise<ExportResult> {
    await requireUser()
    const data = await getCompletedTasks()
    const headers = ['Aufgabe', 'Mitarbeiter', 'Erledigt am', 'Notizen', 'Punkte']
    const rows = data.map(t => [
        t.taskTitle, t.completedBy, deDate(t.completedAt), t.notes || '-', t.points?.toString() || '0',
    ])
    const filename = `aufgaben-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Aufgaben'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Aufgabenbericht', `Erstellt am: ${deDate(new Date())} | Anzahl: ${data.length}`, headers, rows), filename, mimeType: 'application/pdf' }
}

export async function exportEmployeePerformance(format: ExportFormat): Promise<ExportResult> {
    await requireStudioleiter()
    const [employees, stats] = await Promise.all([
        getEmployees(),
        getEmployeePerformanceStats(),
    ])
    const statsMap = new Map(stats.map((s: any) => [s.id, s]))
    const headers = ['Name', 'E-Mail', 'Rolle', 'Aufgaben', 'Punkte']
    const rows = employees.map(e => {
        const s: any = statsMap.get(e.id)
        return [
            e.displayName, e.userEmail || '-', e.role === 'studioleiter' ? 'Studioleiter' : 'Mitarbeiter',
            Number(s?.totalTasks || 0).toString(), Number(s?.totalPoints || 0).toString(),
        ]
    })
    const filename = `team-performance-${todayStr()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    if (format === 'excel') {
        return { buffer: toExcelBuffer(headers, rows, 'Team Performance'), filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }
    return { buffer: toPDFBuffer('Team Performance', `Erstellt am: ${deDate(new Date())}`, headers, rows), filename, mimeType: 'application/pdf' }
}
