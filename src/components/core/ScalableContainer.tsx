import React, { useEffect, useRef, useState } from 'react'
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
     * Bounding element the expansion is allowed to grow within. When the
     * container sits in size-constrained flex-item wrappers (where width /
     * height 100% makes expand-in-place a no-op), providing this ref switches
     * to PUSH expansion: the container's row becomes `flex-wrap: wrap` and the
     * container takes the FULL parent width (`flex-basis: 100%`), so sibling
     * charts reflow below it at full width — pushed, visible, and intact.
     * Column levels between the container and this element get `flex-grow`
     * raised so the expanded row dominates vertically too. Collapsing
     * restores the wrappers' original sizing exactly. Omit for the classic
     * expand-in-place behaviour.
     */
    expandContainerRef?: React.RefObject<HTMLElement | null>
    /**
     * Vertical dominance of the pushed expansion (push mode only). Default
     * `3` — the expanded chart keeps expandRatio/(expandRatio+1) of its row's
     * height (and its row takes expandRatio parts per sibling row), leaving
     * the reflowed siblings the remainder. Raise for a more fullscreen feel,
     * lower for a gentler split.
     */
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

/** Inline styles we temporarily override on ancestor flex items in push mode. */
interface GrownAncestor {
    el: HTMLElement
    parent: HTMLElement
    prev: {
        flexGrow: string
        flexBasis: string
        height: string
        transition: string
        parentFlexWrap: string
    }
}

/**
 * Container that smoothly expands on click and collapses back to its
 * resting size. Reads like a macOS / Windows window resizing — subtle
 * elevation shift, smooth scale, no flash of colour or harsh background
 * change.
 *
 * Two expansion modes:
 * - **In place** (default): animates the container's own width/height to
 *   `expandedWidth`/`expandedHeight`.
 * - **Push** (`expandContainerRef` set): for containers whose resting size is
 *   owned by flex-item wrappers. Expanding makes the container span the FULL
 *   parent width (its row becomes `flex-wrap: wrap` and the wrapper takes
 *   `flex-basis: 100%`), with sibling charts reflowing below it at full
 *   width — visible and intact, not squeezed. Column levels raise `flex-grow`
 *   so the expanded row also dominates vertically. Collapsing restores the
 *   original layout exactly.
 *
 * @example
 * ```tsx
 * <ScalableContainer width={480} height={300}>
 *   <Chart data={metrics} />
 * </ScalableContainer>
 *
 * // Push mode inside a flex grid:
 * const sectionRef = useRef<HTMLDivElement>(null)
 * <div ref={sectionRef} className="flex flex-col flex-1 min-h-0 gap-2">…
 *   <ScalableContainer width="100%" height="100%" expandContainerRef={sectionRef}>
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
    expandRatio = 3,
    className = '',
}: ScalableContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [internalScaled, setInternalScaled] = useState(false)
    const isScaled = expanded ?? internalScaled
    const reduced = useReducedMotion()

    const usePush = expandContainerRef != null
    const grownRef = useRef<GrownAncestor[]>([])
    const prevScaled = useRef(isScaled)

    // Charts and other measure-once content don't notice their container being
    // resized by a CSS flex transition. Most chart libraries DO listen to
    // window resize, so emit resize kicks while the transition runs and once
    // it settles — both the expanded chart and the shrunken siblings re-render
    // at their new sizes instead of staying malformed.
    const kickResizeDuringTransition = () => {
        if (typeof window === 'undefined') return
        const kick = () => window.dispatchEvent(new Event('resize'))
        const interval = window.setInterval(kick, 80)
        window.setTimeout(() => {
            window.clearInterval(interval)
            kick()
        }, reduced ? 0 : 400)
    }

    // ── Push expansion (expandContainerRef mode) ──────────────────────────────
    // Walk the flex items between the container and the bounding element and
    // rework each level by its parent's direction:
    // - ROW parents become `flex-wrap: wrap` and the chain item takes
    //   `flex-basis: 100%` — the expanded chart spans the FULL parent width
    //   and its row-siblings reflow onto the next line(s) at full size instead
    //   of being squeezed beside it. The chain item also claims
    //   expandRatio/(expandRatio+1) of the row's height so the wrapped
    //   siblings keep the remainder.
    // - COLUMN parents get the chain item's `flex-grow` raised, pushing the
    //   other rows down — smaller, but intact and visible.
    // Everything is driven by animatable properties (flex-basis, height,
    // flex-grow) with a CSS transition matching the in-place easing.
    const growAncestors = () => {
        const bound = expandContainerRef?.current
        if (!bound || !containerRef.current) return
        const grown: GrownAncestor[] = []
        let el: HTMLElement | null = containerRef.current.parentElement
        while (el && el !== bound && bound.contains(el)) {
            const parent: HTMLElement | null = el.parentElement
            const parentStyle = parent ? getComputedStyle(parent) : null
            if (parent && parentStyle && parentStyle.display.includes('flex')) {
                grown.push({
                    el,
                    parent,
                    prev: {
                        flexGrow: el.style.flexGrow,
                        flexBasis: el.style.flexBasis,
                        height: el.style.height,
                        transition: el.style.transition,
                        parentFlexWrap: parent.style.flexWrap,
                    },
                })
                const t = (prop: string) => `${prop} ${reduced ? 0 : 0.32}s cubic-bezier(0.16, 1, 0.3, 1)`
                const ours = `${t('flex-grow')}, ${t('flex-basis')}, ${t('height')}`
                el.style.transition = el.style.transition ? `${el.style.transition}, ${ours}` : ours

                if (parentStyle.flexDirection.startsWith('row')) {
                    // Full-width line of its own; siblings wrap below.
                    parent.style.flexWrap = 'wrap'
                    el.style.flexBasis = '100%'
                    el.style.height = `${(expandRatio / (expandRatio + 1)) * 100}%`
                } else {
                    // Column: take expandRatio parts vs ~1 per sibling row.
                    el.style.flexBasis = '0%'
                    el.style.flexGrow = String(expandRatio)
                }
            }
            el = parent
        }
        grownRef.current = grown
    }

    const restoreAncestors = () => {
        for (const { el, parent, prev } of grownRef.current) {
            el.style.flexGrow = prev.flexGrow
            el.style.flexBasis = prev.flexBasis
            el.style.height = prev.height
            // Drop our transition (and the parent's wrap) after the shrink
            // settles so we leave inline styles exactly as we found them.
            window.setTimeout(() => {
                el.style.transition = prev.transition
                parent.style.flexWrap = prev.parentFlexWrap
            }, reduced ? 0 : 360)
        }
        grownRef.current = []
    }

    useEffect(() => {
        if (!usePush || isScaled === prevScaled.current) return
        prevScaled.current = isScaled
        if (isScaled) growAncestors()
        else restoreAncestors()
        kickResizeDuringTransition()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScaled, usePush])

    // Restore consumer styles if we unmount while expanded.
    useEffect(() => () => {
        for (const { el, parent, prev } of grownRef.current) {
            el.style.flexGrow = prev.flexGrow
            el.style.flexBasis = prev.flexBasis
            el.style.height = prev.height
            el.style.transition = prev.transition
            parent.style.flexWrap = prev.parentFlexWrap
        }
    }, [])

    const onToggle = () => {
        const next = !isScaled
        if (expanded === undefined) setInternalScaled(next)
        onExpandedChange?.(next)
        // After an in-place expand settles, scroll the container into view so
        // the newly-grown content is fully visible. (Push mode grows within
        // the bounding section — nothing scrolls.)
        if (next && !usePush) {
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
            // Base style mirrors the animation target so layout is correct from
            // the very first paint (and in frame-starved environments); framer
            // tweens between the values on toggle.
            style={{
                width: isScaled && !usePush ? expandedWidth : width,
                height: isScaled && !usePush ? expandedHeight : height,
            }}
            animate={{
                // Push mode keeps the container filling its (now growing)
                // wrapper — the wrapper's flex-grow does the work.
                width: isScaled && !usePush ? expandedWidth : width,
                height: isScaled && !usePush ? expandedHeight : height,
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
