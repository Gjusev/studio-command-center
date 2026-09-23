'use client'

import { useEffect, useState } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface AnimatedCounterProps {
    target: number
    suffix?: string
    prefix?: string
    duration?: number
    className?: string
}

export function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000, className = '' }: AnimatedCounterProps) {
    const { ref, isVisible } = useScrollAnimation<HTMLSpanElement>()
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!isVisible) return

        let start = 0
        const startTime = performance.now()

        function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)

            start = Math.floor(eased * target)
            setCount(start)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [isVisible, target, duration])

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toLocaleString('de-DE')}{suffix}
        </span>
    )
}
