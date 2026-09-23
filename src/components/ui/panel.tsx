import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PanelProps {
    title?: string | ReactNode
    children: ReactNode
    className?: string
    headerClassName?: string
    accent?: boolean
}

export function Panel({ title, children, className, headerClassName, accent }: PanelProps) {
    return (
        <div className={cn(
            'rounded-lg border border-border bg-card overflow-hidden',
            accent && 'border-t-2 border-t-[var(--lime)]',
            className
        )}>
            {title && (
                <div className={cn('px-5 py-3.5 border-b border-border flex justify-between items-center bg-muted/30', headerClassName)}>
                    <h3 className="text-foreground font-display font-bold text-sm uppercase tracking-[0.1em]">{title}</h3>
                </div>
            )}
            <div className="p-5">
                {children}
            </div>
        </div>
    )
}
