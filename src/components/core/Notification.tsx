import React, { createContext, useContext, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/** ─────────────────── types ─────────────────── */
export type NotificationType = 'info' | 'success' | 'warning' | 'danger'

export interface NotificationPayload {
    title: React.ReactNode
    description?: React.ReactNode
    /** Auto-dismiss duration in ms (default 4000) */
    duration?: number
    type?: NotificationType
}

interface NotificationEntry extends NotificationPayload {
    id: number
}

interface NotificationContextValue {
    open: (payload: NotificationPayload) => void
    close: (id: number) => void
}

/** ─────────────────── context ─────────────────── */
const NotificationContext = createContext<NotificationContextValue>({
    open: () => undefined,
    close: () => undefined,
})

/** ─────────────────── helpers ─────────────────── */
const TYPE_BG: Record<NotificationType, string> = {
    info:    'bg-status-info',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger:  'bg-status-error',
}

function TypeIcon({ type }: { type: NotificationType }) {
    if (type === 'success') {
        return (
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14 0.25C6.40625 0.25 0.25 6.40625 0.25 14C0.25 21.5937 6.40625 27.75 14 27.75C21.5937 27.75 27.75 21.5937 27.75 14C27.75 6.40625 21.5937 0.25 14 0.25ZM19.96 11.675C20.0697 11.5496 20.1533 11.4034 20.2057 11.2452C20.2582 11.087 20.2784 10.9199 20.2653 10.7537C20.2522 10.5876 20.206 10.4257 20.1295 10.2777C20.0529 10.1296 19.9475 9.99838 19.8194 9.89168C19.6914 9.78497 19.5433 9.70495 19.3839 9.65633C19.2244 9.6077 19.0569 9.59145 18.8911 9.60853C18.7253 9.62562 18.5646 9.67568 18.4184 9.75579C18.2723 9.8359 18.1436 9.94443 18.04 10.075L12.665 16.5237L9.88375 13.7412C9.648 13.5136 9.33224 13.3876 9.0045 13.3904C8.67675 13.3933 8.36324 13.5247 8.13148 13.7565C7.89972 13.9882 7.76825 14.3018 7.76541 14.6295C7.76256 14.9572 7.88855 15.273 8.11625 15.5087L11.8662 19.2587C11.9891 19.3815 12.1361 19.4773 12.298 19.5401C12.4599 19.6028 12.6331 19.6312 12.8066 19.6233C12.98 19.6154 13.15 19.5715 13.3055 19.4943C13.4611 19.4171 13.5988 19.3084 13.71 19.175L19.96 11.675Z"
                    fill="#fff"
                />
            </svg>
        )
    }
    if (type === 'info') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" className="w-5 h-5" aria-hidden="true">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
        )
    }
    if (type === 'warning') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" className="w-5 h-5" aria-hidden="true">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
        )
    }
    // danger
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
    )
}

/** ─────────────────── animated toast item ─────────────────── */
function NotificationItem({
    n,
    onClose,
    reduced,
}: {
    n: NotificationEntry
    onClose: (id: number) => void
    reduced: boolean | null
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: reduced ? 0 : 56, scale: reduced ? 0.97 : 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{   opacity: 0, x: reduced ? 0 : 40, scale: reduced ? 0.97 : 1 }}
            transition={
                reduced
                    ? { duration: 0 }
                    : {
                          opacity: { duration: 0.15 },
                          x: { type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                          layout: { duration: 0.2 },
                      }
            }
        >
            <Toast.Root
                open
                duration={n.duration}
                onOpenChange={(o) => { if (!o) onClose(n.id) }}
                className={[
                    'rounded-xl shadow-md p-3 w-[300px] text-white',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                    TYPE_BG[n.type ?? 'info'],
                ].join(' ')}
            >
                <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0">
                        <TypeIcon type={n.type ?? 'info'} />
                    </span>
                    <Toast.Title className="font-semibold text-sm leading-snug flex-1">
                        {n.title}
                    </Toast.Title>
                    <Toast.Action asChild altText="Close">
                        <button
                            aria-label="Close notification"
                            onClick={() => onClose(n.id)}
                            className="flex-shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
                        >
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M15 5L5 15M5 5l10 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Toast.Action>
                </div>
                {n.description && (
                    <Toast.Description className="mt-1.5 text-xs text-white/80 leading-relaxed pl-7">
                        {n.description}
                    </Toast.Description>
                )}
            </Toast.Root>
        </motion.div>
    )
}

/** ─────────────────── provider ─────────────────── */

/**
 * Wrap your application (or a subtree) in `NotificationProvider` to enable
 * toast notifications. Then call `useNotification()` anywhere inside to
 * trigger them.
 *
 * Toasts slide in from the right and exit to the right.
 * `prefers-reduced-motion` is respected via `useReducedMotion()`.
 *
 * @example
 * // main.tsx / _app.tsx
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 *
 * // Inside a component
 * const notify = useNotification()
 * notify.success({ title: 'Saved!', description: 'Your changes were saved.' })
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationEntry[]>([])
    const reduced = useReducedMotion()

    const open = (payload: NotificationPayload) => {
        setNotifications((prev) => [
            ...prev,
            { duration: 4000, ...payload, id: Date.now() + Math.random() },
        ])
    }

    const close = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{ open, close }}>
            <Toast.Provider swipeDirection="right">
                {children}

                <Toast.Viewport
                    asChild
                    className="fixed top-[56px] right-0 z-[500000] flex flex-col gap-2 w-[350px] p-4 outline-none"
                >
                    <ul>
                        <AnimatePresence initial={false}>
                            {notifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    n={n}
                                    onClose={close}
                                    reduced={reduced}
                                />
                            ))}
                        </AnimatePresence>
                    </ul>
                </Toast.Viewport>
            </Toast.Provider>
        </NotificationContext.Provider>
    )
}

/** ─────────────────── hook ─────────────────── */

/**
 * Imperative notification API. Must be called inside `NotificationProvider`.
 *
 * @example
 * const notify = useNotification()
 * notify.success({ title: 'Done', description: 'Record saved.', duration: 3000 })
 * notify.danger({ title: 'Error', description: err.message })
 */
export function useNotification() {
    const { open } = useContext(NotificationContext)

    return {
        info:    (props: Omit<NotificationPayload, 'type'>) => open({ type: 'info',    ...props }),
        success: (props: Omit<NotificationPayload, 'type'>) => open({ type: 'success', ...props }),
        warning: (props: Omit<NotificationPayload, 'type'>) => open({ type: 'warning', ...props }),
        danger:  (props: Omit<NotificationPayload, 'type'>) => open({ type: 'danger',  ...props }),
    }
}
