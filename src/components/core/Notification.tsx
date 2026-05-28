import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Portal from '../layout/Portal'

/** ─────────────────── types ─────────────────── */
export type NotificationType = 'info' | 'success' | 'warning' | 'danger'

export type NotificationPosition =
    | 'top-right'    | 'top-left'    | 'top-center'
    | 'bottom-right' | 'bottom-left' | 'bottom-center'

export interface NotificationPayload {
    title: React.ReactNode
    description?: React.ReactNode
    /** Auto-dismiss duration in ms (default 4000). Pass `Infinity` to disable auto-dismiss. */
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

// Viewport positioning classes per position. The viewport is portaled to
// `document.body`, so these `fixed` positions always resolve against the
// real viewport.
const VIEWPORT_CLASSES: Record<NotificationPosition, string> = {
    'top-right':     'fixed top-4    right-4   flex flex-col         items-end',
    'top-left':      'fixed top-4    left-4    flex flex-col         items-start',
    'top-center':    'fixed top-4    left-1/2  flex flex-col         items-center -translate-x-1/2',
    'bottom-right':  'fixed bottom-4 right-4   flex flex-col-reverse items-end',
    'bottom-left':   'fixed bottom-4 left-4    flex flex-col-reverse items-start',
    'bottom-center': 'fixed bottom-4 left-1/2  flex flex-col-reverse items-center -translate-x-1/2',
}

// Initial motion state per position: drop in from above for top-* and rise
// from below for bottom-*. The y offset is large (±28px) so the trajectory
// is clearly visible; opacity completes faster than the y/scale tween so
// the card is already opaque while it still has travel left.
function getInitialMotion(pos: NotificationPosition, reduced: boolean | null) {
    if (reduced) return { opacity: 0, y: 0, scale: 1 }
    const bottom = pos.startsWith('bottom')
    return { opacity: 0, y: bottom ? 28 : -28, scale: 0.92 }
}

function getExitMotion(pos: NotificationPosition, reduced: boolean | null) {
    if (reduced) return { opacity: 0, y: 0, scale: 1 }
    const bottom = pos.startsWith('bottom')
    return { opacity: 0, y: bottom ? 18 : -18, scale: 0.94 }
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

/** ─────────────────── animated toast item ───────────────────
 *
 * Renders a single notification as a `motion.div` direct child of
 * `AnimatePresence` — no Radix Toast wrapping. The previous Radix-based
 * implementation entangled `Toast.Root`/`Toast.Viewport` lifecycles with
 * Framer Motion's exit detection in a way that suppressed enter/exit
 * animations in some configurations. A pure Framer + portal pattern is
 * simpler, more controllable, and visibly animates.
 *
 * Auto-dismiss uses a per-item `setTimeout` that pauses on hover/focus
 * and resumes on leave/blur. Tracks elapsed time so the remaining
 * duration is correct after a pause.
 */
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
    const [paused, setPaused] = useState(false)
    const duration = n.duration ?? 4000
    const isAutoDismissing = isFinite(duration) && duration > 0
    const showProgress = !reduced && isAutoDismissing

    // Timer management — careful with refs so React 18 strict-mode double
    // mount doesn't double-schedule the dismissal.
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const startTimeRef = useRef<number>(0)
    const remainingRef = useRef<number>(duration)

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const scheduleDismiss = useCallback((ms: number) => {
        clearTimer()
        if (!isAutoDismissing) return
        startTimeRef.current = Date.now()
        timerRef.current = setTimeout(() => onClose(n.id), ms)
    }, [clearTimer, isAutoDismissing, n.id, onClose])

    // Start the timer on mount
    useEffect(() => {
        if (paused || !isAutoDismissing) return
        scheduleDismiss(remainingRef.current)
        return clearTimer
    }, [paused, isAutoDismissing, scheduleDismiss, clearTimer])

    // When the user hovers / focuses, capture how much time was left and
    // pause. On leave, resume with the remaining time.
    const onPauseStart = () => {
        if (!isAutoDismissing) return
        const elapsed = Date.now() - startTimeRef.current
        remainingRef.current = Math.max(0, remainingRef.current - elapsed)
        setPaused(true)
    }
    const onPauseEnd = () => {
        if (!isAutoDismissing) return
        setPaused(false)
    }

    return (
        <motion.div
            layout
            // pointer-events-auto re-enables clicks on the toast card itself;
            // the parent viewport is pointer-events-none so empty space doesn't
            // block interaction with the page underneath.
            className="pointer-events-auto"
            initial={getInitialMotion(pos, reduced)}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={getExitMotion(pos, reduced)}
            transition={
                reduced
                    ? { duration: 0 }
                    : {
                          // Opacity finishes in 0.15 s; y/scale take 0.34 s.
                          // Card is opaque while still travelling — movement
                          // is clearly visible to the user.
                          opacity: { duration: 0.15 },
                          y:       { type: 'tween', duration: 0.34, ease: [0.16, 1, 0.3, 1] },
                          scale:   { type: 'tween', duration: 0.34, ease: [0.16, 1, 0.3, 1] },
                          layout:  { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }
            }
            onMouseEnter={onPauseStart}
            onMouseLeave={onPauseEnd}
            onFocus={onPauseStart}
            onBlur={onPauseEnd}
            role={n.type === 'danger' || n.type === 'warning' ? 'alert' : 'status'}
            aria-live={n.type === 'danger' || n.type === 'warning' ? 'assertive' : 'polite'}
        >
            <div
                className={[
                    'w-[300px] rounded-md shadow-lg overflow-hidden focus:outline-none',
                    TYPE_BG[n.type ?? 'info'],
                ].join(' ')}
            >
                {/* Content row */}
                <div className="flex items-start gap-3 p-3 pr-2.5">
                    <span className="mt-0.5 flex-shrink-0 text-white/90">
                        <TypeIcon type={n.type ?? 'info'} />
                    </span>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-snug">
                            {n.title}
                        </div>
                        {n.description && (
                            <div className="mt-0.5 text-xs text-white/75 leading-relaxed">
                                {n.description}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label="Close notification"
                        onClick={() => onClose(n.id)}
                        className="flex-shrink-0 mt-0.5 rounded p-1 text-white/60 hover:text-white hover:bg-white/15 transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Countdown progress bar — `notification-progress` keyframe
                    drives a scaleX 1→0. animationPlayState pauses with our
                    hover/focus state so the visual matches the actual timer. */}
                {showProgress && (
                    <div className="relative h-[3px] bg-white/20 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-white/60 [transform-origin:left]"
                            style={{
                                animation: `notification-progress ${duration}ms linear forwards`,
                                animationPlayState: paused ? 'paused' : 'running',
                            }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    )
}

/** ─────────────────── provider ─────────────────── */

/**
 * Wrap your app in `NotificationProvider`, then call `useNotification()`
 * anywhere inside to show toast notifications.
 *
 * @param position One of 6 viewport positions (default `'top-right'`).
 *
 * @example
 * <NotificationProvider position="bottom-right">
 *   <App />
 * </NotificationProvider>
 *
 * // anywhere inside:
 * const { success, danger } = useNotification()
 * success({ title: 'Saved', description: 'Changes were stored.' })
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

    const open = useCallback((payload: NotificationPayload) => {
        setNotifications((prev) => [
            ...prev,
            { duration: 4000, ...payload, id: Date.now() + Math.random() },
        ])
    }, [])

    const close = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    return (
        <NotificationContext.Provider value={{ open, close }}>
            {children}

            {/* Portaled into <body> so `position: fixed` resolves against the
                real viewport — see Portal.tsx for the why. */}
            <Portal>
                <ul
                    role="region"
                    aria-label="Notifications"
                    className={[
                        VIEWPORT_CLASSES[position],
                        'z-[500000] gap-2 w-[316px] outline-none pointer-events-none m-0 p-0 list-none',
                    ].join(' ')}
                >
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
            </Portal>
        </NotificationContext.Provider>
    )
}

/** ─────────────────── hook ─────────────────── */

/**
 * Returns four type-specific show functions.
 *
 * @example
 * const { info, success, warning, danger } = useNotification()
 * danger({ title: 'Save failed', description: 'Could not reach the server.' })
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
