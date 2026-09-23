'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    warning: { icon: 'warning', color: 'text-yellow-500' },
    error: { icon: 'error', color: 'text-destructive' },
    success: { icon: 'check_circle', color: 'text-green-500' },
    info: { icon: 'info', color: 'text-blue-500' },
}

export function NotificationBell() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [unread, setUnread] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getUnreadCount().then(setUnread)
    }, [])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    async function openDropdown() {
        if (!isOpen) {
            setIsOpen(true)
            setLoading(true)
            const notifs = await getNotifications(20)
            setNotifications(notifs)
            setLoading(false)
        } else {
            setIsOpen(false)
        }
    }

    async function handleMarkRead(id: string) {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnread(prev => Math.max(0, prev - 1))
    }

    async function handleMarkAllRead() {
        await markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnread(0)
    }

    async function handleDelete(id: string) {
        await deleteNotification(id)
        const notif = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (notif && !notif.isRead) setUnread(prev => Math.max(0, prev - 1))
    }

    function handleClickNotif(notif: any) {
        if (!notif.isRead) handleMarkRead(notif.id)
        if (notif.actionUrl) {
            setIsOpen(false)
            router.push(notif.actionUrl)
        }
    }

    function timeAgo(date: Date) {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Gerade'
        if (mins < 60) return `vor ${mins} Min.`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `vor ${hours} Std.`
        const days = Math.floor(hours / 24)
        return `vor ${days} Tag${days > 1 ? 'en' : ''}`
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={openDropdown}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="font-bold text-foreground text-sm">Benachrichtigungen</h3>
                        {unread > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Alle gelesen
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">Laden...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-3xl text-muted-foreground block mb-2">notifications_off</span>
                                <p className="text-muted-foreground text-sm">Keine Benachrichtigungen</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.info
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group ${!n.isRead ? 'bg-primary/5' : ''}`}
                                        onClick={() => handleClickNotif(n)}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0 ${typeInfo.color}`}>
                                            {typeInfo.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
