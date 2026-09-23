'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface ScrollRevealProps {
    children: React.ReactNode
    className?: string
    delay?: number
    direction?: 'up' | 'left' | 'right' | 'none'
}

export function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: ScrollRevealProps) {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>()

    const transforms: Record<string, string> = {
        up: 'translateY(24px)',
        left: 'translateX(-24px)',
        right: 'translateX(24px)',
        none: 'none',
    }

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'none' : transforms[direction],
                transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}
