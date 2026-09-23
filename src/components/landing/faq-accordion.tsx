'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="space-y-0">
            {items.map((faq, index) => (
                <div
                    key={index}
                    className="border-b border-border first:pt-0"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between py-6 text-left group"
                    >
                        <h3 className="font-display text-base font-bold tracking-tight pr-4 group-hover:text-[var(--lime)] transition-colors">
                            {faq.question}
                        </h3>
                        <ChevronDown
                            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                                openIndex === index ? 'rotate-180 text-[var(--lime)]' : ''
                            }`}
                        />
                    </button>
                    <div
                        className={`grid transition-all duration-300 ease-in-out ${
                            openIndex === index
                                ? 'grid-rows-[1fr] opacity-100 pb-6'
                                : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
