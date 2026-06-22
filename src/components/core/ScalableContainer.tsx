import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Tooltip from './Tooltip'
import { cx } from '../../utils/cx'

export interface ScalableContainerProps {
    /** Resting width. Any CSS length / percent. Default `'100%'`. */
    width?: React.CSSProperties['width']
    /** Resting height. Any CSS length / percent. Default `'auto'`. */
    height?: React.CSSProperties['height']
    /**
     * Width when expanded. A concrete value (e.g. `900` or `'60rem'`) makes the
     * container grow even when its resting width is `'100%'` inside a flex/grid
     * cell. Falls back to {@link ScalableContainerProps.expandedWidth}, then
     * `'100%'`.
     */
    targetWidth?: React.CSSProperties['width']
    /**
     * Height when expanded. A concrete value (e.g. `600`) lets the container
     * grow taller and push whatever sits below it further down. Falls back to
     * {@link ScalableContainerProps.expandedHeight}, then `'100%'`.
     */
    targetHeight?: React.CSSProperties['height']
    /** @deprecated Use `targetWidth`. */
    expandedWidth?: React.CSSProperties['width']
    /** @deprecated Use `targetHeight`. */
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
    /** @deprecated No longer used — set `targetWidth`/`targetHeight` instead. */
    expandContainerRef?: React.RefObject<HTMLElement | null>
    /** @deprecated No longer used — set `targetWidth`/`targetHeight` instead. */
    expandRatio?: number
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
 * Container that smoothly grows to a target size on click and collapses back.
 * Reads like an OS window resize — subtle elevation lift, smooth scale, no
 * colour change.
 *
 * Expansion grows the container's OWN box to `targetWidth` × `targetHeight` and
 * makes it `flex-none` while expanded, so it holds that size and simply pushes
 * its neighbours along the flow — they keep their own dimensions and reflow
 * (e.g. wrap onto the next row / move down) rather than being squeezed. Nothing
 * on sibling elements is mutated, so layouts restore exactly on collapse. For
 * neighbours to reflow *below*, give the parent room to wrap (e.g. a
 * `flex flex-wrap` row, or block/auto-rows-grid flow).
 *
 * @example
 * ```tsx
 * // In a flex-wrap chart grid — expands to a concrete size and pushes the rest down.
 * <div className="flex flex-wrap gap-2">
 *   <ScalableContainer width="100%" height={240} targetWidth="100%" targetHeight={520}>
 *     <Chart data={metrics} />
 *   </ScalableContainer>
 *   …
 * </div>
 * ```
 */
export default function ScalableContainer({
    width = '100%',
    height = 'auto',
    targetWidth,
    targetHeight,
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
    const prevScaled = useRef(isScaled)

    const expandW = targetWidth ?? expandedWidth
    const expandH = targetHeight ?? expandedHeight

    // Charts and other measure-once content don't notice their container being
    // resized by a CSS/transform transition. Most chart libraries DO listen to
    // window resize, so emit resize kicks while the transition runs and once it
    // settles — both the expanded chart and any reflowed neighbours re-render at
    // their new sizes instead of staying malformed.
    useEffect(() => {
        if (isScaled === prevScaled.current) return
        prevScaled.current = isScaled
        if (typeof window === 'undefined') return
        const kick = () => window.dispatchEvent(new Event('resize'))
        const interval = window.setInterval(kick, 80)
        const stop = window.setTimeout(() => { window.clearInterval(interval); kick() }, reduced ? 0 : 420)
        // Bring the grown container fully into view (only when expanding).
        if (isScaled) {
            window.setTimeout(
                () => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
                reduced ? 0 : 360,
            )
        }
        return () => { window.clearInterval(interval); window.clearTimeout(stop) }
    }, [isScaled, reduced])

    const onToggle = () => {
        const next = !isScaled
        if (expanded === undefined) setInternalScaled(next)
        onExpandedChange?.(next)
    }

    const wrapperClass = isScaled ? assignClassOnClick : undefined

    return (
        <motion.div
            ref={containerRef}
            // Base style mirrors the animation target so layout is correct from
            // the first paint (and in frame-starved environments); framer tweens
            // between the values on toggle. `flex: none` while expanded keeps the
            // target size from being shrunk/grown by a flex parent, so the box
            // holds its size and pushes neighbours along the flow instead.
            style={{
                width:  isScaled ? expandW : width,
                height: isScaled ? expandH : height,
                flex:   isScaled ? 'none' : undefined,
            }}
            animate={{ width: isScaled ? expandW : width, height: isScaled ? expandH : height }}
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
                // OS-window aesthetic: subtle elevation at rest, lifted shadow +
                // raised stacking when expanded so it sits above neighbours.
                isScaled ? 'z-raised shadow-2xl' : 'shadow-md',
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

            <div className={cx('h-full w-full', wrapperClass)}>{children}</div>
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
