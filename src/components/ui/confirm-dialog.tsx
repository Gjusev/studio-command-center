'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
    title: string
    description: string
    onConfirm: () => Promise<void> | void
    trigger?: React.ReactNode
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    className?: string
}

export function ConfirmDialog({
    title,
    description,
    onConfirm,
    trigger,
    confirmText = 'Löschen',
    cancelText = 'Abbrechen',
    variant = 'destructive',
    className
}: ConfirmDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)

    const handleConfirm = async () => {
        setIsConfirming(true)
        try {
            await onConfirm()
            setIsOpen(false)
        } catch (error) {
            console.error('Confirm action failed:', error)
        } finally {
            setIsConfirming(false)
        }
    }

    // If no trigger provided, render as standalone dialog
    if (!trigger) {
        if (!isOpen) return null

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                <div className={cn(
                    "relative bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4",
                    className
                )}>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{description}</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isConfirming}
                                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50",
                                    variant === 'destructive'
                                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {isConfirming ? 'Wird gelöscht...' : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // With trigger - wrap trigger in button
    return (
        <div className="relative">
            <div onClick={() => setIsOpen(true)}>
                {trigger}
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={cn(
                        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md",
                        className
                    )}>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{description}</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isConfirming}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isConfirming}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50",
                                        variant === 'destructive'
                                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {isConfirming ? 'Wird gelöscht...' : confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
