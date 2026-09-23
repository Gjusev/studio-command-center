import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formatiert Datum für deutsche Anzeige
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-'

    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

/**
 * Formatiert Zeitpunkt für deutsche Anzeige
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '-'

    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Formatiert Geld in Euro
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '-'

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

/**
 * Formatiert Dezimalzahlen
 */
export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
    if (num === null || num === undefined) return '-'

    return num.toLocaleString('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}
