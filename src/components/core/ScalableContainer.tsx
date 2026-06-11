import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
    /**
     * Bounding element the EXPANDED state should overlay. When provided, the
     * expanded content renders into a body portal positioned over this
     * element's rect instead of growing in place — letting the container break
     * out of a size-constrained wrapper (e.g. a flex item) whose normal-state
     * sizing it should otherwise respect. Collapsing returns it to normal
     * flow. Omit for the classic expand-in-place behaviour.
     */
    expandContainerRef?: React.RefObject<HTMLElement | null>
    /** Extra classes merged onto the container root. */
    className?: string
}

/** Viewport-relative rect snapshot used to place the breakout overlay. */
interface OverlayRect {
    left: number
    top: number
    width: number
    height: number
}

const rectOf = (el: HTMLElement): OverlayRect => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
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
    expandContainerRef,
    className = '',
}: ScalableContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [internalScaled, setInternalScaled] = useState(false)
    const isScaled = expanded ?? internalScaled
    const reduced = useReducedMotion()

    // ── Breakout overlay (expandContainerRef mode) ────────────────────────────
    // 'open': overlay covers the bounding element. 'closing': animating back to
    // the in-flow placeholder before unmounting. The in-flow container keeps its
    // RESTING size the whole time — the wrapper (e.g. a flex item) never sees a
    // layout change.
    const usePortal = expandContainerRef != null
    const [overlay, setOverlay] = useState<'closed' | 'open' | 'closing'>('closed')
    const [fromRect, setFromRect] = useState<OverlayRect | null>(null)
    const [targetRect, setTargetRect] = useState<OverlayRect | null>(null)
    const prevScaled = useRef(isScaled)

    useEffect(() => {
        if (!usePortal || isScaled === prevScaled.current) return
        prevScaled.current = isScaled
        if (isScaled) {
            const src = containerRef.current ? rectOf(containerRef.current) : null
            const tgt = expandContainerRef.current ? rectOf(expandContainerRef.current) : null
            if (src && tgt) {
                setFromRect(src)
                setTargetRect(tgt)
                setOverlay('open')
            }
        } else if (containerRef.current) {
            // Animate back onto the placeholder's current position, then unmount.
            setTargetRect(rectOf(containerRef.current))
            setOverlay('closing')
        }
    }, [isScaled, usePortal, expandContainerRef])

    // Unmount the closing overlay even if the animation callback never fires
    // (rAF can be starved in background tabs; jsdom has no real frames).
    useEffect(() => {
        if (overlay !== 'closing') return
        const t = window.setTimeout(() => setOverlay('closed'), reduced ? 0 : 360)
        return () => window.clearTimeout(t)
    }, [overlay, reduced])

    // Keep the overlay glued to the bounding element across resize/scroll.
    useEffect(() => {
        if (overlay !== 'open' || !expandContainerRef?.current) return
        const update = () => {
            if (expandContainerRef.current) setTargetRect(rectOf(expandContainerRef.current))
        }
        window.addEventListener('resize', update)
        window.addEventListener('scroll', update, true)
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update, true)
        }
    }, [overlay, expandContainerRef])

    const onToggle = () => {
        const next = !isScaled
        if (expanded === undefined) setInternalScaled(next)
        onExpandedChange?.(next)
        // After an in-place expand settles, scroll the container into view so
        // the newly-grown content is fully visible. (The breakout overlay is
        // viewport-positioned already — nothing to scroll to.)
        if (next && !usePortal) {
            window.setTimeout(
                () => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
                reduced ? 0 : 340,
            )
        }
    }

    const wrapperClass = isScaled ? assignClassOnClick : undefined
    const overlayActive = usePortal && overlay !== 'closed'

    const toggleButton = (scaled: boolean) => (
        <Tooltip placement="bottom" title={scaled ? 'Collapse' : 'Expand'}>
            <button
                type="button"
                onClick={onToggle}
                aria-label={scaled ? 'Collapse container' : 'Expand container'}
                aria-expanded={scaled}
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
                {scaled ? collapseIcon ?? <CollapseIcon /> : expandIcon ?? <ExpandIcon />}
            </button>
        </Tooltip>
    )

    return (
        <>
            <motion.div
                ref={containerRef}
                animate={{
                    // Breakout mode never grows in place — the in-flow box stays
                    // at its resting size and acts as the collapse target.
                    width: isScaled && !usePortal ? expandedWidth : width,
                    height: isScaled && !usePortal ? expandedHeight : height,
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
                    isScaled && !usePortal ? 'shadow-2xl' : 'shadow-md',
                    'transition-shadow duration-300',
                    className,
                )}
            >
                {/* While the breakout overlay owns the content, the in-flow box is
                    just a placeholder holding the wrapper's layout. */}
                {!overlayActive && toggleButton(isScaled)}
                {!overlayActive && <div className={wrapperClass}>{children}</div>}
            </motion.div>

            {overlayActive && fromRect && targetRect &&
                createPortal(
                    <motion.div
                        initial={{ ...fromRect }}
                        animate={{ ...targetRect }}
                        transition={
                            reduced
                                ? { duration: 0 }
                                : { type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] }
                        }
                        onAnimationComplete={() => {
                            if (overlay === 'closing') setOverlay('closed')
                        }}
                        style={{ position: 'fixed' }}
                        className={cx(
                            'z-dropdown rounded-lg overflow-hidden bg-surface shadow-2xl',
                            className,
                        )}
                    >
                        {toggleButton(isScaled)}
                        <div className={cx('h-full w-full', wrapperClass)}>{children}</div>
                    </motion.div>,
                    document.body,
                )}
        </>
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
