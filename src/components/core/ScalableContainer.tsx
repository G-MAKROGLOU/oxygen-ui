import React, { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Tooltip from './Tooltip'
import { cx } from '../../utils/cx'

export interface ScalableContainerProps {
    /** Resting width. Any CSS length / percent. Default `'100%'`. */
    width?: React.CSSProperties['width']
    /** Resting height. Any CSS length / percent. Default `'auto'`. */
    height?: React.CSSProperties['height']
    /** Width when expanded. Default `'100%'` (fills parent). */
    expandedWidth?: React.CSSProperties['width']
    /** Height when expanded. Default `'100%'`. Set a concrete value (e.g. 420)
     *  when the container lives in normal flow and should push siblings down. */
    expandedHeight?: React.CSSProperties['height']
    /** Controlled expanded state. */
    expanded?: boolean
    /** Fires when the user toggles. */
    onExpandedChange?: (expanded: boolean) => void
    /** Content to render inside. */
    children?: React.ReactNode
    /** CSS class appended to the expanded children wrapper. */
    assignClassOnClick?: string
    /** Override the expand-button icon. */
    expandIcon?: React.ReactNode
    /** Override the collapse-button icon. */
    collapseIcon?: React.ReactNode
    /**
     * Position of the toggle button inside the container.
     * Default `'top-right'` — matches the OS-window convention.
     */
    togglePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    /** Extra classes merged onto the container root. */
    className?: string
}

const TOGGLE_POSITION_CLASS: Record<NonNullable<ScalableContainerProps['togglePosition']>, string> = {
    'top-left':     'top-2 left-2',
    'top-right':    'top-2 right-2',
    'bottom-left':  'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
}

/**
 * Container that smoothly expands to fill its parent on click and
 * collapses back to its resting size. Reads like a macOS / Windows
 * window resizing — subtle elevation shift, smooth scale, no flash
 * of colour or harsh background change.
 *
 * **What's different from the previous version**
 * - Animates BOTH width and height (was width-only).
 * - No baked-in background — the container is transparent by default,
 *   so it overlays whatever surface the consumer puts behind it.
 * - Shadow lifts on expand (`shadow-md` → `shadow-2xl`) like a window
 *   being raised. No colour change.
 * - The toggle button is a plain rounded chip with the chevron icon,
 *   not the old `IconButton` with the heavy background. Floats over
 *   the content via absolute positioning so it doesn't push layout.
 * - Configurable toggle position (default top-right, matching OS
 *   close-button convention).
 *
 * @example
 * ```tsx
 * <ScalableContainer width={480} height={300}>
 *   <Chart data={metrics} />
 * </ScalableContainer>
 * ```
 */
export default function ScalableContainer({
    width = '100%',
    height = 'auto',
    expandedWidth = '100%',
    expandedHeight = '100%',
    expanded,
    onExpandedChange,
    children,
    assignClassOnClick,
    expandIcon,
    collapseIcon,
    togglePosition = 'top-right',
    className = '',
}: ScalableContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [internalScaled, setInternalScaled] = useState(false)
    const isScaled = expanded ?? internalScaled
    const reduced = useReducedMotion()

    const onToggle = () => {
        const next = !isScaled
        if (expanded === undefined) setInternalScaled(next)
        onExpandedChange?.(next)
        // After the expand transition settles, scroll the container into view
        // so the newly-grown content is fully visible (only when growing).
        if (next) {
            window.setTimeout(
                () => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
                reduced ? 0 : 340,
            )
        }
    }

    const wrapperClass = isScaled ? assignClassOnClick : undefined

    return (
        <motion.div
            ref={containerRef}
            animate={{
                width:  isScaled ? expandedWidth : width,
                height: isScaled ? expandedHeight : height,
            }}
            transition={
                reduced
                    ? { duration: 0 }
                    : {
                          width:  { type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                          height: { type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                      }
            }
            className={cx(
                'relative rounded-lg overflow-hidden',
                // OS-window aesthetic: subtle elevation at rest, lifted shadow
                // when expanded. No background colour change.
                isScaled ? 'shadow-2xl' : 'shadow-md',
                'transition-shadow duration-300',
                className,
            )}
        >
            {/* Toggle button — floats over content, no background flash. */}
            <Tooltip placement="bottom" title={isScaled ? 'Collapse' : 'Expand'}>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={isScaled ? 'Collapse container' : 'Expand container'}
                    aria-expanded={isScaled}
                    className={[
                        'absolute z-10',
                        TOGGLE_POSITION_CLASS[togglePosition],
                        'w-7 h-7 inline-flex items-center justify-center',
                        'rounded-md bg-surface/80 backdrop-blur-sm border border-border',
                        'text-foreground-secondary hover:text-foreground hover:bg-surface',
                        'shadow-sm transition-colors duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    ].join(' ')}
                >
                    {isScaled
                        ? collapseIcon ?? <CollapseIcon />
                        : expandIcon ?? <ExpandIcon />}
                </button>
            </Tooltip>

            <div className={wrapperClass}>{children}</div>
        </motion.div>
    )
}

/** Arrows-pointing-in (collapse). */
function CollapseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4M9 9V4M9 9H4M15 9L20 4M15 9V4M15 9H20M9 15L4 20M9 15V20M9 15H4M15 15L20 20M15 15V20M15 15H20" />
        </svg>
    )
}

/** Arrows-pointing-out (expand). */
function ExpandIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
        </svg>
    )
}
