export function PageSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-muted rounded-md" />
                    <div className="h-4 w-32 bg-muted rounded-md" />
                </div>
                <div className="h-9 w-32 bg-muted rounded-md" />
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted rounded-xl" />
                ))}
            </div>
            {/* Main panel */}
            <div className="h-64 bg-muted rounded-xl" />
            {/* Secondary panel */}
            <div className="h-48 bg-muted rounded-xl" />
        </div>
    )
}
