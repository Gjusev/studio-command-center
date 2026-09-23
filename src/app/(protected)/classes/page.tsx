import { getUserWithPermissions } from '@/lib/auth/guards'
import { getClassSchedule, getClassTypes } from '@/app/actions/classes'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const DAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 - 20:00

function getWeekDates(referenceDate: Date) {
    const day = referenceDate.getDay()
    const monday = new Date(referenceDate)
    monday.setDate(referenceDate.getDate() - ((day + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
    })
}

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: Promise<{ week?: string }>
}) {
    const user = await getUserWithPermissions()
    const canManage = user.role === 'studioleiter' || user.permissions.includes('classes.manage')

    const params = await searchParams
    const refDate = params.week ? new Date(params.week) : new Date()
    const weekDates = getWeekDates(refDate)
    const [schedule, classTypes] = await Promise.all([
        getClassSchedule({
            dateFrom: weekDates[0].toISOString(),
            dateTo: new Date(weekDates[6].getTime() + 86400000).toISOString(),
        }),
        getClassTypes(),
    ])

    // Group classes by day
    const classesByDay: Record<number, typeof schedule> = {}
    for (let i = 0; i < 7; i++) classesByDay[i] = []
    for (const cls of schedule) {
        const dayIdx = new Date(cls.startTime).getDay()
        if (!classesByDay[dayIdx]) classesByDay[dayIdx] = []
        classesByDay[dayIdx].push(cls)
    }

    const prevWeek = new Date(weekDates[0])
    prevWeek.setDate(prevWeek.getDate() - 7)
    const nextWeek = new Date(weekDates[0])
    nextWeek.setDate(nextWeek.getDate() + 7)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">Kursplanung</h1>
                    <p className="text-sm text-muted-foreground">Verwalten Sie Ihren Wochenkursplan</p>
                </div>
                {canManage && (
                <div className="flex gap-2 sm:gap-3">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/classes/types">
                            <span className="material-symbols-outlined text-[16px]">category</span>
                            <span className="hidden sm:inline">Kursarten</span>
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="shadow-lg shadow-primary/20">
                        <Link href="/classes/new">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            <span className="hidden sm:inline">Neuer Kurs</span>
                        </Link>
                    </Button>
                </div>
                )}
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card rounded-xl border border-border px-3 sm:px-4 py-3">
                <Link
                    href={`/classes?week=${prevWeek.toISOString().split('T')[0]}`}
                    className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    <span className="hidden sm:inline">Vorwoche</span>
                </Link>
                <div className="text-center">
                    <p className="font-bold text-foreground text-sm sm:text-base">
                        KW {getISOWeek(weekDates[0])}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {weekDates[0].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – {weekDates[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <Link
                    href={`/classes?week=${nextWeek.toISOString().split('T')[0]}`}
                    className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <span className="hidden sm:inline">Nächste</span>
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
            </div>

            {/* Timetable Grid - Desktop */}
            <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-8 min-w-[900px]">
                    {/* Time column header */}
                    <div className="border-b border-r border-border p-3 bg-muted/50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Uhrzeit</span>
                    </div>
                    {/* Day headers */}
                    {weekDates.map((date, i) => {
                        const isToday = date.getTime() === today.getTime()
                        return (
                            <div key={i} className={`border-b border-r border-border p-3 text-center ${isToday ? 'bg-primary/10' : 'bg-muted/50'} last:border-r-0`}>
                                <p className={`text-xs font-semibold uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{DAY_SHORT[i === 0 ? 1 : i === 6 ? 0 : i + 1]}</p>
                                <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{date.getDate()}</p>
                            </div>
                        )
                    })}

                    {/* Time rows */}
                    {HOURS.map(hour => (
                        <TimeRow
                            key={hour}
                            hour={hour}
                            weekDates={weekDates}
                            classesByDay={classesByDay}
                            classTypes={classTypes}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile / Tablet: Daily view */}
            <div className="lg:hidden space-y-4">
                {weekDates.map((date, i) => {
                    const jsDay = ((i + 1) % 7)
                    const dayClasses = (classesByDay[jsDay] || []).filter((c: any) => !c.isCancelled)
                    const isToday = date.getTime() === today.getTime()
                    const dayName = DAY_SHORT[i === 0 ? 1 : i === 6 ? 0 : i + 1]

                    return (
                        <div key={i} className={`rounded-xl border overflow-hidden ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
                            <div className={`px-4 py-2.5 border-b flex items-center justify-between ${isToday ? 'border-primary/20 bg-primary/10' : 'border-border bg-muted/50'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>{dayName}</span>
                                    <span className={`text-sm ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{date.getDate()}.{date.getMonth() + 1}.</span>
                                </div>
                                {dayClasses.length > 0 && (
                                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{dayClasses.length} Kurse</span>
                                )}
                            </div>
                            {dayClasses.length === 0 ? (
                                <div className="px-4 py-4 text-center text-muted-foreground text-sm">Keine Kurse</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {dayClasses.map((cls: any) => (
                                        <ClassCard key={cls.id} cls={cls} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="rounded-xl border border-border bg-card p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Kurse diese Woche</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{schedule.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Kursarten</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{classTypes.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Buchungen</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                        {schedule.reduce((sum, c) => sum + c.currentBookings, 0)}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 md:p-4">
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Absagen</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                        {schedule.filter(c => c.isCancelled).length}
                    </p>
                </div>
            </div>
        </div>
    )
}

function TimeRow({ hour, weekDates, classesByDay, classTypes: _classTypes }: {
    hour: number; weekDates: Date[]; classesByDay: Record<number, any[]>; classTypes: any[]
}) {
    return (
        <>
            {/* Time label */}
            <div className="border-r border-b border-border p-2 text-center">
                <span className="text-xs text-muted-foreground font-medium">{hour}:00</span>
            </div>
            {/* Day cells */}
            {weekDates.map((date, i) => {
                const jsDay = ((i + 1) % 7) // Mon=1...Sat=6, Sun=0
                const dayClasses = (classesByDay[jsDay] || []).filter(c => {
                    const startHour = new Date(c.startTime).getHours()
                    return startHour === hour && !c.isCancelled
                })
                return (
                    <div key={i} className="border-r border-b border-border p-1 min-h-[60px] last:border-r-0">
                        {dayClasses.map(cls => (
                            <ClassBlock key={cls.id} cls={cls} />
                        ))}
                    </div>
                )
            })}
        </>
    )
}

function ClassBlock({ cls }: { cls: any }) {
    return (
        <Link
            href={`/classes/${cls.id}`}
            className="block rounded-lg p-2 text-xs mb-1 transition-all hover:scale-105 cursor-pointer"
            style={{
                backgroundColor: cls.classTypeColor + '20',
                borderLeft: `3px solid ${cls.classTypeColor}`,
            }}
        >
            <p className="font-bold text-foreground truncate">{cls.title || cls.classTypeName}</p>
            <p className="text-muted-foreground">{new Date(cls.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-muted-foreground">{cls.currentBookings}/{cls.maxCapacity}</p>
        </Link>
    )
}

function ClassCard({ cls }: { cls: any }) {
    return (
        <div className="rounded-xl border border-border p-4" style={{ borderLeftColor: cls.classTypeColor, borderLeftWidth: '4px' }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-foreground">{cls.title || cls.classTypeName}</p>
                    <p className="text-sm text-muted-foreground">
                        {new Date(cls.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – {new Date(cls.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {cls.trainerName && <p className="text-xs text-muted-foreground mt-1">Trainer: {cls.trainerName}</p>}
                </div>
                <span className="text-sm font-medium text-foreground">{cls.currentBookings}/{cls.maxCapacity}</span>
            </div>
        </div>
    )
}

function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
