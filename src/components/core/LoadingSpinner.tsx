import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import Portal from '../layout/Portal'

export interface LoadingSpinnerProps {
    /** Text revealed letter-by-letter beneath the spinner. */
    prompt: string
    /**
     * Optional override for the spinner ring colour. Accepts any CSS colour.
     * Defaults to the accent token so it picks up theme overrides.
     */
    spinnerColor?: string
    /**
     * Optional override for the prompt text colour.
     * Defaults to the foreground token (light/dark aware).
     */
    textColor?: string
    /**
     * Backdrop opacity (0 – 1). Defaults to 0.92 — close enough to opaque to
     * block UI underneath while still hinting at the previous state.
     */
    backdropOpacity?: number
}

// Framer variants drive the staggered letter reveal — no refs, no setTimeout,
// no classList mutation, no DOM access at all. The container schedules each
// child to start 60 ms after the previous one; each child fades + lifts in
// over 250 ms. With `useReducedMotion` the container falls back to an instant
// reveal so the prompt is still visible.
const containerVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06 } },
}

const letterVariants: Variants = {
    hidden:  { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

/**
 * Full-screen loading overlay with a spinning ring and a staggered text
 * reveal. Portaled into `document.body` so it always covers the actual
 * viewport regardless of where it's rendered in the React tree.
 *
 * Honours `prefers-reduced-motion`: the spinner still rotates (continuous
 * spin is informative, not decorative) but the letter stagger collapses to
 * an instant reveal.
 *
 * @example
 * {isLoading && <LoadingSpinner prompt="Loading vessels…" />}
 *
 * @example
 * <LoadingSpinner
 *   prompt="Saving"
 *   spinnerColor="#10b981"
 *   backdropOpacity={0.7}
 * />
 */
export default function LoadingSpinner({
    prompt,
    spinnerColor,
    textColor,
    backdropOpacity = 0.92,
}: LoadingSpinnerProps) {
    const reduced = useReducedMotion()
    const letters = Array.from(prompt)

    return (
        <Portal>
            <div
                role="status"
                aria-live="polite"
                aria-label={prompt}
                className="fixed inset-0 z-[8000000] flex flex-col items-center justify-center gap-6 bg-background"
                style={{ opacity: backdropOpacity }}
            >
                {/* Spinning ring — Tailwind `animate-spin` is a built-in
                    `animation: spin 1s linear infinite`. The ring is two
                    transparent edges + two coloured edges so it reads as
                    a rotating arc. `currentColor` lets `spinnerColor`
                    drive the ring via `style.color`. */}
                <div
                    className="w-20 h-20 rounded-2xl border-[6px] border-transparent border-t-current border-r-current animate-spin"
                    style={{ color: spinnerColor ?? 'var(--color-accent)' }}
                    aria-hidden="true"
                />

                {/* Letter-by-letter reveal */}
                <motion.div
                    className="text-3xl font-bold tracking-tight select-none"
                    style={{ color: textColor ?? 'var(--color-foreground)' }}
                    variants={containerVariants}
                    initial={reduced ? 'visible' : 'hidden'}
                    animate="visible"
                >
                    {letters.map((letter, index) => (
                        <motion.span
                            key={index}
                            // Preserve whitespace runs (spaces in prompts) so
                            // the layout doesn't collapse multi-word prompts.
                            className="inline-block whitespace-pre"
                            variants={letterVariants}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.div>
            </div>
        </Portal>
    )
}
