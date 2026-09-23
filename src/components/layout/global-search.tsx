'use client'

import { useState, useEffect, useRef } from 'react'
import { globalSearch, type SearchResult } from '@/app/actions/search'
import { useRouter } from 'next/navigation'

export function GlobalSearch() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (query.trim().length < 2) { setResults([]); setOpen(false); return }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const r = await globalSearch(query.trim())
                setResults(r)
                setOpen(true)
            } catch { setResults([]) }
            finally { setLoading(false) }
        }, 300)
    }, [query])

    function handleSelect(result: SearchResult) {
        setOpen(false)
        setQuery('')
        router.push(result.url)
    }

    const typeIcons: Record<string, string> = {
        Verbrauchsmaterial: 'inventory_2',
        Maschine: 'fitness_center',
        Mitglied: 'person',
        Mitarbeiter: 'group',
    }

    return (
        <div ref={containerRef} className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--lime)] transition-colors text-[18px]">search</span>
            <input
                className="bg-muted border border-input focus:border-[var(--lime)] text-foreground text-sm rounded-md pl-10 pr-4 py-2 w-56 focus:outline-none focus:ring-1 focus:ring-[var(--lime)]/30 transition-all placeholder-muted-foreground/60 font-body"
                placeholder="Suche..."
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => { if (results.length > 0) setOpen(true) }}
            />

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Suche...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Keine Ergebnisse</div>
                    ) : (
                        results.map(r => (
                            <button key={`${r.type}-${r.id}`}
                                onClick={() => handleSelect(r)}
                                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border last:border-0"
                            >
                                <span className="material-symbols-outlined text-[18px] text-muted-foreground">{typeIcons[r.type] || 'search'}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{r.type}{r.subtitle ? ` · ${r.subtitle}` : ''}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
