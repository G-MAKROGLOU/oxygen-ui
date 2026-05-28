import React, { createContext, useContext, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/** ─────────────────── types ─────────────────── */
export type NotificationType = 'info' | 'success' | 'warning' | 'danger'

export type NotificationPosition =
    | 'top-right'    | 'top-left'    | 'top-center'
    | 'bottom-right' | 'bottom-left' | 'bottom-center'

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
    open:  (payload: NotificationPayload) => void
    close: (id: number) => void
}

/** ─────────────────── context ─────────────────── */
const NotificationContext = createContext<NotificationContextValue>({
    open:  () => undefined,
    close: () => undefined,
})

/** ─────────────────── helpers ─────────────────── */
const TYPE_BG: Record<NotificationType, string> = {
    info:    'bg-status-info',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger:  'bg-status-error',
}

// Viewport positioning classes per position
const VIEWPORT_CLASSES: Record<NotificationPosition, string> = {
    'top-right':     'fixed top-14 right-0     flex flex-col       items-end',
    'top-left':      'fixed top-14 left-0      flex flex-col       items-start',
    'top-center':    'fixed top-14 left-1/2    flex flex-col       items-center -translate-x-1/2',
    'bottom-right':  'fixed bottom-4 right-0   flex flex-col-reverse items-end',
    'bottom-left':   'fixed bottom-4 left-0    flex flex-col-reverse items-start',
    'bottom-center': 'fixed bottom-4 left-1/2  flex flex-col-reverse items-center -translate-x-1/2',
}

// Initial animation state per position.
// All positions use y + scale only — no x translation — so the card always
// stays within the viewport boundary and the animation is fully visible.
// Horizontal slide (x: ±40) was the previous approach; it caused the card to
// start outside the right edge of the fixed container, making the animation
// invisible and creating a horizontal scrollbar in the Storybook iframe.
function getInitialMotion(pos: NotificationPosition, reduced: boolean | null) {
    if (reduced) return { opacity: 0, y: 0, scale: 1 }
    const bottom = pos.startsWith('bottom')
    return {
        opacity: 0,
        y:     bottom ? 10 : -10,  // drop in from above (top) or rise from below (bottom)
        scale: 0.94,
    }
}

function TypeIcon({ type }: { type: NotificationType }) {
    if (type === 'success') {
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        )
    }
    if (type === 'info') {
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        )
    }
    if (type === 'warning') {
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        )
    }
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}

/** ─────────────────── animated toast item ─────────────────── */
function NotificationItem({
    n,
    pos,
    onClose,
    reduced,
}: {
    n: NotificationEntry
    pos: NotificationPosition
    onClose: (id: number) => void
    reduced: boolean | null
}) {
    const [hovered, setHovered] = useState(false)
    const initial  = getInitialMotion(pos, reduced)
    const center   = pos.endsWith('center')
    const duration = n.duration ?? 4000
    // Only show the progress bar when there is a finite, positive auto-dismiss
    // duration and the user has not requested reduced motion.
    const showProgress = !reduced && isFinite(duration) && duration > 0

    return (
        <motion.div
            layout
            initial={initial}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={initial}
            transition={
                reduced
                    ? { duration: 0 }
                    : {
                          opacity: { duration: 0.18 },
                          y:       { type: 'tween', duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                          scale:   { type: 'tween', duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                          layout:  { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                      }
            }
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Toast.Root
                open
                duration={duration}
                onOpenChange={(o) => { if (!o) onClose(n.id) }}
                className={[
                    'w-[300px] rounded-md shadow-lg overflow-hidden',
                    center ? 'mx-auto' : '',
                    'focus:outline-none',
                    TYPE_BG[n.type ?? 'info'],
                ].join(' ')}
            >
                {/* Content row ──────────────────────────────────────────────── */}
                <div className="flex items-start gap-3 p-3 pr-2.5">
                    <span className="mt-0.5 flex-shrink-0 text-white/90">
                        <TypeIcon type={n.type ?? 'info'} />
                    </span>

                    <div className="flex-1 min-w-0">
                        <Toast.Title className="text-sm font-semibold text-white leading-snug">
                            {n.title}
                        </Toast.Title>
                        {n.description && (
                            <Toast.Description className="mt-0.5 text-xs text-white/75 leading-relaxed">
                                {n.description}
                            </Toast.Description>
                        )}
                    </div>

                    <Toast.Action asChild altText="Close">
                        <button
                            aria-label="Close"
                            onClick={() => onClose(n.id)}
                            className="flex-shrink-0 mt-0.5 rounded p-1 text-white/60 hover:text-white hover:bg-white/15 transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </Toast.Action>
                </div>

                {/* Countdown progress bar ────────────────────────────────────
                    Lives inside overflow-hidden, so the bottom corners are
                    clipped to match the card's border-radius automatically.
                    The fill is a CSS animation (scaleX 1→0) so it costs zero
                    JS — no intervals, no RAF. animationPlayState mirrors
                    Radix's own hover-pause, keeping both in exact sync.      */}
                {showProgress && (
                    <div className="relative h-[3px] bg-white/20 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-white/60 [transform-origin:left]"
                            style={{
                                animation: `notification-progress ${duration}ms linear forwards`,
                                animationPlayState: hovered ? 'paused' : 'running',
                            }}
                        />
                    </div>
                )}
            </Toast.Root>
        </motion.div>
    )
}

/** ─────────────────── provider ─────────────────── */

/**
 * Wrap your app in `NotificationProvider`, then call `useNotification()` anywhere inside.
 *
 * @param position  One of 6 viewport positions (default: `top-right`)
 *
 * @example
 * <NotificationProvider position="bottom-right">
 *   <App />
 * </NotificationProvider>
 */
export function NotificationProvider({
    children,
    position = 'top-right',
}: {
    children: React.ReactNode
    position?: NotificationPosition
}) {
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
            <Toast.Provider swipeDirection={
                position.endsWith('right') ? 'right' :
                position.endsWith('left')  ? 'left'  : 'up'
            }>
                {children}

                <Toast.Viewport
                    asChild
                    className={[
                        VIEWPORT_CLASSES[position],
                        'z-[500000] gap-2 w-[332px] p-4 outline-none',
                    ].join(' ')}
                >
                    <ul>
                        <AnimatePresence initial={false}>
                            {notifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    n={n}
                                    pos={position}
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
export function useNotification() {
    const { open } = useContext(NotificationContext)
    return {
        info:    (props: Omit<NotificationPayload, 'type'>) => open({ type: 'info',    ...props }),
        success: (props: Omit<NotificationPayload, 'type'>) => open({ type: 'success', ...props }),
        warning: (props: Omit<NotificationPayload, 'type'>) => open({ type: 'warning', ...props }),
        danger:  (props: Omit<NotificationPayload, 'type'>) => open({ type: 'danger',  ...props }),
    }
}
