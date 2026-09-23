'use client'

import { useState } from 'react'
import { cancelClassSchedule } from '@/app/actions/classes'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CancelClassButton({ classId }: { classId: string }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    async function handleCancel() {
        setIsPending(true)
        try {
            await cancelClassSchedule(classId)
            toast.success('Kurs abgesagt')
            setShowConfirm(false)
            router.refresh()
        } catch (e: any) { toast.error(e.message || 'Fehler') }
        finally { setIsPending(false) }
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-destructive font-medium">Wirklich absagen?</span>
                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isPending}>{isPending ? '...' : 'Ja'}</Button>
                <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>Nein</Button>
            </div>
        )
    }

    return (
        <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Kurs absagen
        </Button>
    )
}
