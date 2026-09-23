'use client'

import { useState, useTransition } from 'react'
import { cancelContract, pauseContract, reactivateContract } from '@/app/actions/contracts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ContractActionsProps {
    contractId: string
    status: string
    canManage?: boolean
}

export function ContractActions({ contractId, status, canManage = false }: ContractActionsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showCancel, setShowCancel] = useState(false)
    const [reason, setReason] = useState('')

    if (!canManage) return null

    function handlePause() {
        startTransition(async () => {
            await pauseContract(contractId)
            toast.success('Vertrag pausiert')
            router.refresh()
        })
    }

    function handleReactivate() {
        startTransition(async () => {
            await reactivateContract(contractId)
            toast.success('Vertrag reaktiviert')
            router.refresh()
        })
    }

    function handleCancel() {
        startTransition(async () => {
            await cancelContract(contractId, reason || undefined)
            toast.success('Vertrag gekündigt')
            setShowCancel(false)
            router.refresh()
        })
    }

    return (
        <div className="relative">
            <div className="flex items-center gap-1">
                {status === 'ACTIVE' && (
                    <>
                        <button onClick={handlePause} disabled={isPending}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                            title="Pausieren">
                            <span className="material-symbols-outlined text-[18px]">pause</span>
                        </button>
                        <button onClick={() => setShowCancel(true)} disabled={isPending}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            title="Kündigen">
                            <span className="material-symbols-outlined text-[18px]">block</span>
                        </button>
                    </>
                )}
                {status === 'PAUSED' && (
                    <button onClick={handleReactivate} disabled={isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                        title="Reaktivieren">
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                )}
                {status === 'CANCELLED' && (
                    <button onClick={handleReactivate} disabled={isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                        title="Reaktivieren">
                        <span className="material-symbols-outlined text-[18px]">replay</span>
                    </button>
                )}
                {status === 'EXPIRED' && (
                    <span className="text-xs text-muted-foreground">Abgelaufen</span>
                )}
            </div>

            {/* Cancel dialog */}
            {showCancel && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCancel(false)} />
                    <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-50 p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground">Vertrag kündigen</p>
                        <input
                            type="text"
                            placeholder="Kündigungsgrund (optional)"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowCancel(false)} className="flex-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors">Abbrechen</button>
                            <button onClick={handleCancel} disabled={isPending} className="flex-1 px-2 py-1.5 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50">Kündigen</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
