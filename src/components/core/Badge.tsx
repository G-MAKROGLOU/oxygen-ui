import React from 'react'
import { cx } from '../../utils/cx'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info'
export type BadgeVariant = 'solid' | 'soft' | 'outline'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
    /** Pill label (label mode) when no `count` / `dot` is given. */
    children?: React.ReactNode
    /** Semantic colour. Default `'neutral'`. */
    tone?: BadgeTone
    /** Fill style. Default `'soft'`. */
    variant?: BadgeVariant
    /** Size preset. Default `'md'`. */
    size?: BadgeSize
    /** Optional leading icon (label mode). */
    icon?: React.ReactNode
    /**
     * Indicator mode, a numeric counter. With `children` it overlays the
     * top-right corner of the wrapped element; without, it renders inline.
     */
    count?: number
    /** Cap the displayed count (e.g. `99+`). Default `99`. */
    max?: number
    /** Render a bare dot indicator (no number). Overrides `count` display. */
    dot?: boolean
    /** Show the indicator even when `count` is 0. Default `false`. */
    showZero?: boolean
    className?: string
    style?: React.CSSProperties
}

// tone → [solid, soft, outline] class sets
const TONE: Record<BadgeTone, { solid: string; soft: string; outline: string; dot: string }> = {
    neutral: {
        solid:   'bg-foreground-secondary text-background',
        soft:    'bg-surface-raised text-foreground-secondary',
        outline: 'border border-border text-foreground-secondary',
        dot:     'bg-foreground-secondary',
    },
    accent: {
        solid:   'bg-accent text-accent-fg',
        soft:    'bg-accent/10 text-accent',
        outline: 'border border-accent text-accent',
        dot:     'bg-accent',
    },
    success: {
        solid:   'bg-status-success text-white',
        soft:    'bg-status-success/12 text-status-success',
        outline: 'border border-status-success text-status-success',
        dot:     'bg-status-success',
    },
    warning: {
        solid:   'bg-status-warning text-white',
        soft:    'bg-status-warning/15 text-status-warning',
        outline: 'border border-status-warning text-status-warning',
        dot:     'bg-status-warning',
    },
    error: {
        solid:   'bg-status-error text-white',
        soft:    'bg-status-error/12 text-status-error',
        outline: 'border border-status-error text-status-error',
        dot:     'bg-status-error',
    },
    info: {
        solid:   'bg-status-info text-white',
        soft:    'bg-status-info/12 text-status-info',
        outline: 'border border-status-info text-status-info',
        dot:     'bg-status-info',
    },
}

const SIZE: Record<BadgeSize, string> = {
    sm: 'h-[18px] px-1.5 text-[11px] gap-1 rounded-full',
    md: 'h-5 px-2 text-xs gap-1 rounded-full',
}

/**
 * A small status / count indicator. Three uses:
 *
 * 1. **Label pill**, `<Badge tone="success">Active</Badge>`.
 * 2. **Inline count**, `<Badge count={5} tone="error" />`.
 * 3. **Overlay**, wrap an element to anchor a count/dot to its top-right:
 *    `<Badge count={3} tone="error"><IconButton … /></Badge>`.
 *
 * @example
 * <Badge tone="accent" variant="soft">Beta</Badge>
 * <Badge dot tone="success"><Avatar … /></Badge>
 */
export default function Badge({
    children,
    tone = 'neutral',
    variant = 'soft',
    size = 'md',
    icon,
    count,
    max = 99,
    dot = false,
    showZero = false,
    className = '',
    style,
}: BadgeProps) {
    const isIndicator = dot || count != null
    const hidden = !dot && count != null && count === 0 && !showZero
    const display = count != null && count > max ? `${max}+` : count

    // ── Label pill (no indicator props) ──────────────────────────────────────
    if (!isIndicator) {
        return (
            <span
                className={cx(
                    'inline-flex items-center font-medium select-none whitespace-nowrap leading-none',
                    SIZE[size],
                    TONE[tone][variant],
                    className,
                )}
                style={style}
            >
                {icon && <span className="flex h-3.5 w-3.5 items-center justify-center">{icon}</span>}
                {children}
            </span>
        )
    }

    // ── Indicator (dot or count) ─────────────────────────────────────────────
    const indicator = dot ? (
        <span
            className={cx('inline-block rounded-full', size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5', TONE[tone].dot, className)}
            style={children ? undefined : style}
            aria-hidden={children ? true : undefined}
        />
    ) : (
        <span
            className={cx(
                'inline-flex items-center justify-center rounded-full font-semibold leading-none tabular-nums',
                size === 'sm' ? 'h-4 min-w-4 px-1 text-[10px]' : 'h-[18px] min-w-[18px] px-1.5 text-[11px]',
                TONE[tone].solid,
                className,
            )}
            style={children ? undefined : style}
        >
            {display}
        </span>
    )

    // Inline (no wrapped child).
    if (!children) return hidden ? null : indicator

    // Overlay anchored to the child's top-right.
    return (
        <span className="relative inline-flex" style={style}>
            {children}
            {!hidden && (
                <span className="absolute -top-1 -right-1 flex">{indicator}</span>
            )}
        </span>
    )
}
