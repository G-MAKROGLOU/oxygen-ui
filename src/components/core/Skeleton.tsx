import React from 'react'

/** ─────────────────── base ─────────────────── */

interface SkeletonBaseProps {
    className?: string
    /** Override inline styles */
    style?: React.CSSProperties
}

// Shared shimmer classes. The animated sweep lives in `.oxy-skeleton::after`
// (src/styles/_animations.scss) where the band colour is `color-mix`-ed from
// `--color-foreground`, so it stays visible in BOTH light and dark themes — a
// fixed white sheen vanishes on a light `surface-raised` base. The element
// keeps `bg-surface-raised` as a Tailwind utility so consumers can override the
// resting colour via `className` / `style`. Reduced-motion hides the sweep but
// the legible base placeholder remains.
const SHIMMER = 'oxy-skeleton rounded-sm bg-surface-raised'

/** ─────────────────── SkeletonBox ─────────────────── */

export interface SkeletonBoxProps extends SkeletonBaseProps {
    width?:  number | string
    height?: number | string
    /** Override border-radius (defaults to token --radius-md) */
    radius?: number | string
}

/**
 * Generic rectangular loading placeholder.
 * Use for images, cards, headers, or any block element.
 *
 * @example
 * <SkeletonBox width={240} height={160} />
 * <SkeletonBox width="100%" height={48} radius="var(--radius-lg)" />
 */
export function SkeletonBox({ width, height = 16, radius, className = '', style }: SkeletonBoxProps) {
    return (
        <span
            role="presentation"
            aria-hidden="true"
            className={`block ${SHIMMER} ${className}`}
            style={{
                width:        width ?? '100%',
                height,
                borderRadius: radius ?? 'var(--radius-md)',
                ...style,
            }}
        />
    )
}

/** ─────────────────── SkeletonText ─────────────────── */

export interface SkeletonTextProps extends SkeletonBaseProps {
    /** Number of lines (default 3) */
    lines?: number
    /** Width of the last (shortest) line as a percentage (default 60) */
    lastLineWidth?: number
    /** Line height in px (default 14) */
    lineHeight?: number
    /** Gap between lines in px (default 8) */
    gap?: number
}

/**
 * Multi-line text loading placeholder.
 * Last line is shorter to mimic real paragraph layout.
 *
 * @example
 * <SkeletonText lines={4} lastLineWidth={45} />
 */
export function SkeletonText({
    lines       = 3,
    lastLineWidth = 60,
    lineHeight  = 14,
    gap         = 8,
    className   = '',
    style,
}: SkeletonTextProps) {
    return (
        <div
            role="presentation"
            aria-hidden="true"
            className={`flex flex-col ${className}`}
            style={{ gap, ...style }}
        >
            {Array.from({ length: lines }).map((_, i) => {
                const isLast  = i === lines - 1
                const width   = isLast && lines > 1 ? `${lastLineWidth}%` : '100%'
                return (
                    <span
                        key={i}
                        className={`block ${SHIMMER}`}
                        style={{ height: lineHeight, width, borderRadius: 'var(--radius-sm)' }}
                    />
                )
            })}
        </div>
    )
}

/** ─────────────────── SkeletonCircle ─────────────────── */

export interface SkeletonCircleProps extends SkeletonBaseProps {
    /** Diameter in px (default 40) */
    size?: number
}

/**
 * Circular loading placeholder — avatars, icons, status indicators.
 *
 * @example
 * <SkeletonCircle size={48} />
 */
export function SkeletonCircle({ size = 40, className = '', style }: SkeletonCircleProps) {
    return (
        <span
            role="presentation"
            aria-hidden="true"
            className={`block flex-shrink-0 ${SHIMMER} ${className}`}
            style={{
                width:  size,
                height: size,
                borderRadius: '50%',
                ...style,
            }}
        />
    )
}

/** ─────────────────── SkeletonCard ─────────────────── */

export interface SkeletonCardProps extends SkeletonBaseProps {
    /** Include a circular avatar in the header (default true) */
    hasAvatar?: boolean
    /** Number of text lines in the body (default 3) */
    lines?: number
}

/**
 * Composite card skeleton — avatar + heading + body text + action strip.
 * Use as a drop-in while real card data loads.
 *
 * @example
 * <div className="grid grid-cols-3 gap-4">
 *   {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
 * </div>
 */
export function SkeletonCard({ hasAvatar = true, lines = 3, className = '', style }: SkeletonCardProps) {
    return (
        <div
            role="presentation"
            aria-hidden="true"
            className={`rounded-lg border border-border bg-surface p-4 ${className}`}
            style={style}
        >
            {/* Header row */}
            <div className="flex items-center gap-3 mb-4">
                {hasAvatar && <SkeletonCircle size={36} />}
                <div className="flex-1 flex flex-col gap-2">
                    <SkeletonBox height={12} width="55%" />
                    <SkeletonBox height={10} width="35%" />
                </div>
            </div>

            {/* Body text */}
            <SkeletonText lines={lines} lastLineWidth={55} />

            {/* Action strip */}
            <div className="mt-4 flex gap-2">
                <SkeletonBox height={28} width={72} />
                <SkeletonBox height={28} width={56} />
            </div>
        </div>
    )
}
