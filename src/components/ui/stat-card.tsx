import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatCardProps {
    title: string | ReactNode
    value: string | number
    icon?: ReactNode
    trend?: { value: string | number; positive?: boolean; label?: string }
    className?: string
    accent?: boolean
}

export function StatCard({ title, value, icon, trend, className, accent }: StatCardProps) {
    return (
        <div className={cn(
            'relative flex flex-col gap-1.5 md:gap-2 rounded-lg p-3.5 md:p-5 bg-card border border-border transition-all overflow-hidden group',
            accent && 'border-l-[var(--lime)] border-l-2',
            className
        )}>
            {/* Subtle top accent line */}
            {accent && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--lime)] via-transparent to-transparent opacity-60" />
            )}

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-[9px] md:text-[11px] font-display font-semibold uppercase tracking-[0.1em] md:tracking-[0.15em] leading-tight">
                    {title}
                </p>
                {icon && (
                    <span className="text-muted-foreground group-hover:text-[var(--lime)] transition-colors [&_span]:text-[16px] md:[&_span]:text-[20px]">
                        {icon}
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-2 md:gap-3">
                <p className="text-foreground text-xl md:text-3xl font-display font-bold leading-none tracking-tight">
                    {value}
                </p>
                {trend && (
                    <span className={cn(
                        'text-[10px] md:text-xs font-display font-semibold flex items-center',
                        trend.positive ? 'text-[var(--lime)]' : 'text-destructive'
                    )}>
                        {typeof trend.value === 'number' && trend.value > 0 && '+'}
                        {trend.value}
                        {trend.label && <span className="ml-1">{trend.label}</span>}
                    </span>
                )}
            </div>
        </div>
    )
}
