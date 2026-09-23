'use client'

import { useState, useTransition } from 'react'
import { checkInMember } from '@/app/actions/contracts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Member { id: string; firstName: string; lastName: string }

export function CheckInPanel({ members }: { members: Member[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState('')
    const [showList, setShowList] = useState(false)

    const filtered = search.trim().length >= 1
        ? members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
        : []

    // Find member currently checked in (no checkout)
    function handleCheckIn(memberId: string) {
        startTransition(async () => {
            try {
                await checkInMember(memberId)
                toast.success('Check-in erfolgreich')
                setSearch('')
                setShowList(false)
                router.refresh()
            } catch (e: any) { toast.error(e.message || 'Fehler') }
        })
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm">Quick Check-in</h3>
                <span className="material-symbols-outlined text-[var(--lime)] text-[18px]">login</span>
            </div>
            <div className="p-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                    </span>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/30 placeholder-muted-foreground"
                        placeholder="Mitglied suchen für Check-in..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setShowList(true) }}
                        onFocus={() => setShowList(true)}
                    />
                    {showList && filtered.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {filtered.map(m => (
                                <button key={m.id} type="button"
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--lime)]/10 flex items-center justify-between group"
                                    onMouseDown={() => handleCheckIn(m.id)}
                                    disabled={isPending}>
                                    <span className="font-medium">{m.firstName} {m.lastName}</span>
                                    <span className="material-symbols-outlined text-[16px] text-muted-foreground group-hover:text-[var(--lime)] transition-colors">login</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {showList && search.trim().length >= 2 && filtered.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
                            Kein Mitglied gefunden
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
