"use client"

import { useState, useEffect, useTransition } from "react"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [, startTransition] = useTransition()
  const router = useRouter()


  async function loadNotifications() {
    const data = await getNotifications()
    setNotifications(data as Notification[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  function getIcon(type: string) {
    switch(type) {
      case "LEAVE_APPLIED": return "edit_calendar"
      case "LEAVE_APPROVED": return "check_circle"
      case "LEAVE_REJECTED": return "cancel"
      case "PAYSLIP_GENERATED": return "receipt_long"
      case "ATTENDANCE_ALERT": return "schedule"
      default: return "notifications"
    }
  }

  function getColor(type: string) {
    switch(type) {
      case "LEAVE_APPROVED": return "text-emerald-500"
      case "LEAVE_REJECTED": return "text-red-500"
      case "PAYSLIP_GENERATED": return "text-pink-500"
      case "ATTENDANCE_ALERT": return "text-amber-500"
      default: return "text-primary"
    }
  }

  function handleNotificationClick(n: Notification) {
    startTransition(async () => {
      if (!n.isRead) {
        await markNotificationRead(n.id)
        setNotifications(prev => prev.map(x => x.id === n.id ? {...x, isRead: true} : x))
      }
      if (n.link) {
        router.push(n.link)
      }
      setOpen(false)
    })
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(x => ({...x, isRead: true})))
    })
  }

  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-secondary dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-[360px] z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-on-surface dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-secondary dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 ${getColor(n.type)}`}>
                      <span className="material-symbols-outlined text-[16px]">{getIcon(n.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-on-surface dark:text-white leading-tight ${!n.isRead ? "text-slate-900" : ""}`}>{n.title}</p>
                      <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                        {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
