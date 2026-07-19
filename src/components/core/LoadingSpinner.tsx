import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import Portal from '../layout/Portal'

export type LoadingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

export interface LoadingSpinnerProps {
    /**
     * Text revealed letter-by-letter beneath the spinner. Optional, pass
     * `undefined` for a pure spinner with no caption (e.g. inline mode).
     */
    prompt?: string
    /** Spinner size variant. Defaults to `'md'`. */
    size?: LoadingSpinnerSize
    /**
     * When `true`, renders inline at the call site (no portal, no fullscreen
     * overlay, no backdrop). Useful inside cards, table rows, drawers, or
     * empty-state slots. Defaults to `false` (fullscreen overlay).
     */
    inline?: boolean
    /**
     * Optional override for the spinner ring colour. Accepts any CSS colour.
     * Defaults to the `--color-accent` token so it picks up theme overrides.
     */
    spinnerColor?: string
    /**
     * Optional override for the prompt text colour.
     * Defaults to the `--color-foreground` token (light/dark aware).
     */
    textColor?: string
    /**
     * Backdrop opacity (0 – 1) for the fullscreen overlay. Defaults to 0.8 -
     * close enough to opaque to block UI underneath while still hinting at the
     * previous state. Ignored when `inline` is true.
     */
    backdropOpacity?: number
    /** Extra classes merged onto the spinner root. */
    className?: string
}

// ── Size → dimensions table ─────────────────────────────────────────────────
// Outer ring, inner ring, centre dot, ring stroke width, text size.
const SIZE_MAP = {
    // xs is sized to fit beside button text (~14px), async AutoComplete,
    // Button loading prop, inline status badges, etc.
    xs: { outer: 'w-3.5 h-3.5', inner: 'w-1.5 h-1.5', dot: 'w-0.5 h-0.5', stroke: 'border-[1.5px]', text: 'text-[10px]' },
    sm: { outer: 'w-8 h-8',     inner: 'w-4 h-4',    dot: 'w-1 h-1',     stroke: 'border-2',        text: 'text-xs'    },
    md: { outer: 'w-20 h-20',   inner: 'w-12 h-12',  dot: 'w-2 h-2',     stroke: 'border-[3px]',    text: 'text-2xl'   },
    lg: { outer: 'w-32 h-32',   inner: 'w-20 h-20',  dot: 'w-3 h-3',     stroke: 'border-4',        text: 'text-4xl'   },
} as const satisfies Record<LoadingSpinnerSize, {
    outer: string; inner: string; dot: string; stroke: string; text: string
}>

// ── Letter-stagger variants ─────────────────────────────────────────────────
// 60 ms stagger, 250 ms fade + lift per glyph. With `useReducedMotion` the
// container falls back to instant reveal, the prompt stays visible.
const containerVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.05 } },
}

const letterVariants: Variants = {
    hidden:  { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
}

// ── Spinner core (rings + dot) ──────────────────────────────────────────────
// Two concentric arcs rotating at different speeds in opposite directions,
// with a centred breathing dot. Each ring uses two opposing border edges so
// the rotation reads as a 180° arc traversal, sharper than a full ring.
// All three elements rotate around the same centre via `relative + absolute`.
function SpinnerCore({ size, color }: { size: LoadingSpinnerSize; color?: string }) {
    const dims = SIZE_MAP[size]
    const ringColor = color ?? 'var(--color-accent)'
    return (
        <div className="relative flex items-center justify-center" style={{ color: ringColor }}>
            {/* Outer arc, slower clockwise */}
            <div
                className={`${dims.outer} ${dims.stroke} rounded-full border-transparent border-t-current border-r-current animate-spin`}
                style={{ animationDuration: '1.4s' }}
                aria-hidden="true"
            />
            {/* Inner arc, faster counter-clockwise, lower opacity for layering */}
            <div
                className={`absolute ${dims.inner} ${dims.stroke} rounded-full border-transparent border-b-current border-l-current animate-spin opacity-60`}
                style={{ animationDuration: '0.9s', animationDirection: 'reverse' }}
                aria-hidden="true"
            />
            {/* Centre dot, breathing pulse */}
            <div
                className={`absolute ${dims.dot} rounded-full bg-current animate-breathe`}
                aria-hidden="true"
            />
        </div>
    )
}

/**
 * Enterprise-grade loading indicator.
 *
 * Two concentric arcs counter-rotating around a breathing centre dot, with
 * an optional staggered letter reveal beneath. Portaled to `document.body`
 * for the fullscreen overlay so it always covers the actual viewport
 * regardless of where it sits in the React tree.
 *
 * **Two modes:**
 * - **Fullscreen overlay** (default): semi-opaque backdrop with
 *   `backdrop-blur-sm` for a modern depth effect. Use during page-level
 *   loading, route transitions, or critical mutations.
 * - **Inline** (`inline`): just the spinner + optional caption rendered at
 *   the call site. Use inside cards, table rows, drawers, empty states,
 *   or anywhere a smaller loading affordance is appropriate.
 *
 * **Accessibility**: `role="status"` + `aria-label`/`aria-live` make the
 * indicator announce-able to screen readers. `prefers-reduced-motion`
 * collapses the letter stagger to instant reveal, the spinner rings keep
 * rotating since a continuous spinner is informative, not decorative.
 *
 * @example Fullscreen overlay (page load)
 * ```tsx
 * {isLoading && <LoadingSpinner prompt="Loading vessels…" />}
 * ```
 *
 * @example Inline (inside a card)
 * ```tsx
 * <Card>
 *   {data ? <Chart data={data} /> : <LoadingSpinner inline size="sm" />}
 * </Card>
 * ```
 *
 * @example Themed overlay
 * ```tsx
 * <LoadingSpinner
 *   prompt="Saving"
 *   size="lg"
 *   spinnerColor="#10b981"
 *   backdropOpacity={0.7}
 * />
 * ```
 */
export default function LoadingSpinner({
    prompt,
    size = 'md',
    inline = false,
    spinnerColor,
    textColor,
    backdropOpacity = 0.8,
    className = '',
}: LoadingSpinnerProps) {
    const reduced = useReducedMotion()
    const letters = prompt ? Array.from(prompt) : []
    const dims = SIZE_MAP[size]

    const content = (
        <>
            <SpinnerCore size={size} color={spinnerColor} />

            {letters.length > 0 && (
                <motion.div
                    className={`${dims.text} font-semibold tracking-tight select-none`}
                    style={{ color: textColor ?? 'var(--color-foreground)' }}
                    variants={containerVariants}
                    initial={reduced ? 'visible' : 'hidden'}
                    animate="visible"
                    aria-hidden="true"
                >
                    {letters.map((letter, index) => (
                        <motion.span
                            key={index}
                            className="inline-block whitespace-pre"
                            variants={letterVariants}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.div>
            )}
        </>
    )

    // ── Inline mode ─────────────────────────────────────────────────────────
    if (inline) {
        return (
            <div
                role="status"
                aria-live="polite"
                aria-label={prompt ?? 'Loading'}
                className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}
            >
                {content}
            </div>
        )
    }

    // ── Fullscreen overlay ──────────────────────────────────────────────────
    return (
        <Portal>
            <div
                role="status"
                aria-live="polite"
                aria-label={prompt ?? 'Loading'}
                className={`fixed inset-0 z-[8000000] flex flex-col items-center justify-center gap-6 bg-background backdrop-blur-sm ${className}`.trim()}
                style={{ opacity: backdropOpacity }}
            >
                {content}
            </div>
        </Portal>
    )
}
