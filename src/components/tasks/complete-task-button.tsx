'use client'

import { useState } from 'react'
import { completeTask } from '@/app/actions/tasks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface CompleteTaskButtonProps {
    assignmentId: string
    taskTemplateId: string
    taskTitle: string
}

export function CompleteTaskButton({ assignmentId, taskTemplateId, taskTitle }: CompleteTaskButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            await completeTask({
                assignmentId,
                taskTemplateId,
            })
            toast.success(`"${taskTitle}" als erledigt markiert`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Abschließen')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button size="sm" variant="outline" onClick={handleComplete} disabled={isLoading} className="gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            {isLoading ? '...' : 'Erledigt'}
        </Button>
    )
}
