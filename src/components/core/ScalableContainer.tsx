import React, { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import Tooltip from './Tooltip'
import { cx } from '../../utils/cx'

export interface ScalableContainerProps {
    /**
     * Resting width. Optional, when omitted, the resting size is left to your
     * own `className` / parent layout (so the container can sit in a fluid grid
     * sized by `w-[…]` classes). Only set this if you want an inline width.
     */
    width?: React.CSSProperties['width']
    /** Resting height. Optional, see {@link ScalableContainerProps.width}. */
    height?: React.CSSProperties['height']
    /**
     * Width when expanded. Default `'100%'`. Use `'100%'` to span the full row
     * of a flex/grid so the container pushes its neighbours onto the next
     * row(s); a concrete value (e.g. `900`) grows it to that exact width.
     */
    targetWidth?: React.CSSProperties['width']
    /** Height when expanded. Default `'100%'`. A concrete value (e.g. `580`)
     *  grows the container taller and pushes whatever follows further down. */
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
     * Default `'top-right'`, matches the OS-window convention.
     */
    togglePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    /** @deprecated No longer used, set `targetWidth`/`targetHeight` instead. */
    expandContainerRef?: React.RefObject<HTMLElement | null>
    /** @deprecated No longer used, set `targetWidth`/`targetHeight` instead. */
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
 * Container that grows to a target size on click and collapses back. Reads like
 * an OS window resize, subtle elevation lift, smooth size transition.
 *
 * **Resting size comes from your layout, not from props.** Leave `width`/`height`
 * unset and size the container with your own `className` (e.g. a fluid grid:
 * `w-full lg:w-[calc(50%-6px)]`). Only when expanded does the container write an
 * inline `width`/`height` (= `targetWidth`/`targetHeight`) and go `flex: none`,
 * so it grows to that size and simply **pushes its neighbours along the flow** -
 * they keep their own dimensions and reflow (wrap / move down). On collapse the
 * inline sizing is removed and your className layout takes back over. No sibling
 * styles are ever touched.
 *
 * For neighbours to reflow *below* the expanded one, the parent must be able to
 * wrap, a `flex flex-wrap` row is the simplest; with `targetWidth="100%"` the
 * expanded item takes a full row and everything after it moves down.
 *
 * @example
 * ```tsx
 * <div className="flex flex-wrap gap-3">
 *   <ScalableContainer
 *     className="w-full lg:w-[calc(50%-6px)]"   // resting size, your grid
 *     height={300}                              // resting height
 *     targetWidth="100%" targetHeight={580}     // expanded size
 *   >
 *     <Chart … />
 *   </ScalableContainer>
 *   …
 * </div>
 * ```
 */
export default function ScalableContainer({
    width,
    height,
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

    // Chart libraries (Chart.js, ECharts, …) measure once and don't notice a CSS
    // size change. Most listen to window resize, so emit resize kicks across the
    // transition and once it settles, both the grown chart and any reflowed
    // neighbours re-render at their new sizes. Also scroll the grown box into view.
    useEffect(() => {
        if (isScaled === prevScaled.current) return
        prevScaled.current = isScaled
        if (typeof window === 'undefined') return
        const kick = () => window.dispatchEvent(new Event('resize'))
        const interval = window.setInterval(kick, 80)
        const stop = window.setTimeout(() => { window.clearInterval(interval); kick() }, reduced ? 0 : 420)
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
        <div
            ref={containerRef}
            // Resting (collapsed): only emit inline width/height if the consumer
            // explicitly passed them, otherwise leave sizing to className/parent
            // so the container fits its fluid grid. Expanded: write the target
            // size + `flex:none` so it holds that size and pushes neighbours
            // (which keep their own dimensions and reflow) instead of shrinking
            // them. The CSS transition animates the size change both ways.
            style={{
                width:  isScaled ? expandW : width,
                height: isScaled ? expandH : height,
                ...(isScaled ? { flex: 'none' } : null),
            }}
            className={cx(
                'relative rounded-lg overflow-hidden',
                'transition-[width,height,box-shadow] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                // OS-window aesthetic: subtle elevation at rest, lifted shadow +
                // raised stacking when expanded so it sits above neighbours.
                isScaled ? 'z-raised shadow-2xl' : 'shadow-md',
                className,
            )}
        >
            {/* Toggle button, floats over content, no background flash. */}
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
        </div>
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
