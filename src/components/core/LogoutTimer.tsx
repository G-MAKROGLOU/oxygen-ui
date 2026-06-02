import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Modal from './Modal'
import Button from '../inputs/Button'

export interface LogoutTimerProps {
    /** Idle time in ms before the warning appears (e.g. `15 * 60_000`). */
    timeout: number
    /** Countdown shown in the warning before auto-logout, in ms. Default `60_000`. */
    countdown?: number
    /** Fired when the countdown elapses or the user signs out explicitly. */
    onLogout: () => void
    /** Fired when the user chooses to stay (the session is extended). */
    onContinue?: () => void
    /** Fired when the warning first appears (e.g. for analytics). */
    onWarning?: () => void
    /** Activity events that reset the idle timer. */
    events?: string[]
    /** Master switch — when false the timer is fully disabled. Default `true`. */
    enabled?: boolean
    /** Warning dialog heading. Default `'Still there?'`. */
    title?: React.ReactNode
    /** Warning dialog body. Default explains the inactivity sign-out. */
    description?: React.ReactNode
    /** "Stay" button label. Default `'Stay signed in'`. */
    continueLabel?: React.ReactNode
    /** "Sign out" button label. Default `'Sign out now'`. */
    logoutLabel?: React.ReactNode
}

const DEFAULT_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel']

const formatTime = (ms: number) => {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Inactivity / session-timeout guard. After `timeout` ms with no user activity
 * it raises a warning dialog that counts down for `countdown` ms; if the user
 * doesn't respond, `onLogout` fires. "Stay signed in" extends the session;
 * "Sign out now" logs out immediately. Activity resets the idle timer — but not
 * while the warning is up, so the user must make a choice.
 *
 * Mount it once near the app root, alongside (or just inside) your
 * {@link SecureLayout}.
 *
 * @example
 * <LogoutTimer
 *   timeout={15 * 60_000}      // warn after 15 min idle
 *   countdown={60_000}         // 60s to respond
 *   onLogout={() => navigate('/logout')}
 * />
 */
export default function LogoutTimer({
    timeout,
    countdown = 60_000,
    onLogout,
    onContinue,
    onWarning,
    events = DEFAULT_EVENTS,
    enabled = true,
    title = 'Still there?',
    description = 'You’ll be signed out soon due to inactivity.',
    continueLabel = 'Stay signed in',
    logoutLabel = 'Sign out now',
}: LogoutTimerProps) {
    const reduced = useReducedMotion()
    const [warning, setWarning] = useState(false)
    const [remaining, setRemaining] = useState(countdown)

    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tick = useRef<ReturnType<typeof setInterval> | null>(null)
    const deadline = useRef(0)
    const warningRef = useRef(false)
    const lastReset = useRef(0)

    // Keep latest callbacks without re-binding the activity listeners.
    const cbs = useRef({ onLogout, onContinue, onWarning })
    cbs.current = { onLogout, onContinue, onWarning }

    const clearTimers = useCallback(() => {
        if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null }
        if (tick.current) { clearInterval(tick.current); tick.current = null }
    }, [])

    const logout = useCallback(() => {
        clearTimers()
        warningRef.current = false
        setWarning(false)
        cbs.current.onLogout()
    }, [clearTimers])

    const startIdle = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current)
        idleTimer.current = setTimeout(() => {
            // Enter the warning phase.
            warningRef.current = true
            deadline.current = Date.now() + countdown
            setRemaining(countdown)
            setWarning(true)
            cbs.current.onWarning?.()
            tick.current = setInterval(() => {
                const left = deadline.current - Date.now()
                if (left <= 0) logout()
                else setRemaining(left)
            }, 250)
        }, timeout)
    }, [timeout, countdown, logout])

    const stay = useCallback(() => {
        if (tick.current) { clearInterval(tick.current); tick.current = null }
        warningRef.current = false
        setWarning(false)
        cbs.current.onContinue?.()
        startIdle()
    }, [startIdle])

    useEffect(() => {
        if (!enabled) {
            clearTimers()
            warningRef.current = false
            setWarning(false)
            return
        }
        const onActivity = () => {
            // Don't let background activity dismiss an active warning — the user
            // must choose. Throttle resets to avoid thrashing the timer.
            if (warningRef.current) return
            const now = Date.now()
            if (now - lastReset.current < 500) return
            lastReset.current = now
            startIdle()
        }
        startIdle()
        events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
        return () => {
            events.forEach((e) => window.removeEventListener(e, onActivity))
            clearTimers()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, timeout, countdown, events.join(','), startIdle, clearTimers])

    return (
        <Modal open={warning} onClose={stay} hasFooter={false} title={title} size="sm">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-foreground-secondary">{description}</p>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl font-semibold tabular-nums text-foreground" aria-live="polite">
                        {formatTime(remaining)}
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                        <motion.div
                            key={warning ? deadline.current : 'idle'}
                            className="h-full bg-accent"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: reduced ? 0 : countdown / 1000, ease: 'linear' }}
                        />
                    </div>
                </div>

                <div className="mt-1 flex justify-end gap-2">
                    <Button content={logoutLabel} variant="secondary" size="sm" onClick={logout} />
                    <Button content={continueLabel} size="sm" onClick={stay} />
                </div>
            </div>
        </Modal>
    )
}
