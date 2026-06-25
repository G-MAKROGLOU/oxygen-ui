import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Button from '../inputs/Button'
import Portal from '../layout/Portal'

export interface WizardStep {
    /** Ref to the DOM element to highlight for this step. */
    stepRef: React.RefObject<HTMLElement | null>
    /** Tooltip body content. */
    description: React.ReactNode
    /**
     * Tooltip placement relative to the highlighted element.
     * - `'right'`  (default) — to the right of the highlight
     * - `'left'`             — to the left of the highlight
     * - `'top'`              — above the highlight
     * - `'bottom'`           — below the highlight
     */
    placement?: 'right' | 'left' | 'top' | 'bottom'
    /** Optional heading for the step's tooltip. */
    title?: React.ReactNode
}

export interface WizardProps {
    /** The wrapped subtree — refs in `steps` point into this tree. */
    children: React.ReactNode
    /** Ordered list of steps to walk the user through. */
    steps: WizardStep[]
    /**
     * `localStorage` key used to remember dismissal. When the user clicks
     * "Done" (or "Skip" when dismissible), this key is set so the wizard
     * won't reopen on subsequent mounts.
     *
     * Pass `null` to disable persistence entirely (useful for tests or
     * tours that should always run).
     *
     * Default: `'oxygen.wizard.completed'`.
     */
    storageKey?: string | null
    /** Show a "Skip tour" button + Esc-to-dismiss. Default `true`. */
    dismissible?: boolean
    /** Called when the user reaches the final step's "Done" button. */
    onComplete?: () => void
    /** Called when the user skips (or presses Esc) before completing. */
    onSkip?: () => void
}

// ── Local-storage helpers (SSR-safe) ────────────────────────────────────────
// The previous implementation called `localStorage.getItem(...)` at module-
// effect time with no `typeof window` guard, crashing under SSR. These two
// helpers route every access through a try/catch so server-side and
// privacy-mode browsers (where localStorage throws) degrade silently.

function readDismissed(key: string | null): boolean {
    if (key === null) return false
    if (typeof window === 'undefined') return false
    try {
        return window.localStorage.getItem(key) === 'true'
    } catch {
        return false
    }
}

function writeDismissed(key: string | null) {
    if (key === null) return
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(key, 'true')
    } catch {
        // Swallow — Safari private mode, quota exceeded, etc.
    }
}

// ── Bbox tracking — handles scroll + resize ────────────────────────────────

function useTargetBbox(ref: React.RefObject<HTMLElement | null> | undefined) {
    const [bbox, setBbox] = useState<DOMRect | null>(null)

    useLayoutEffect(() => {
        const el = ref?.current
        if (!el) {
            setBbox(null)
            return
        }
        const update = () => setBbox(el.getBoundingClientRect())
        update()
        // Track viewport changes
        window.addEventListener('scroll', update, true)
        window.addEventListener('resize', update)
        // Track size changes on the target itself
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
        ro?.observe(el)
        return () => {
            window.removeEventListener('scroll', update, true)
            window.removeEventListener('resize', update)
            ro?.disconnect()
        }
    }, [ref])

    return bbox
}

// ── Tooltip positioning ─────────────────────────────────────────────────────
// Returns the absolute top/left of the tooltip for the given bbox + side.
// `8 px` gap keeps the tooltip from touching the highlight.

const TOOLTIP_WIDTH = 280
const TOOLTIP_GAP = 12

function tooltipStyleFor(
    bbox: DOMRect,
    placement: WizardStep['placement'],
    tooltipHeight: number,
): React.CSSProperties {
    const GAP = TOOLTIP_GAP
    const W   = TOOLTIP_WIDTH
    const H   = tooltipHeight
    const vw  = window.innerWidth
    const vh  = window.innerHeight

    // ── 1. Auto-flip when the preferred side overflows ──────────────────────
    let side = placement ?? 'right'

    if (side === 'right'  && bbox.right  + GAP + W > vw) side = 'left'
    if (side === 'left'   && bbox.left   - W   - GAP < 0) side = 'right'
    if (side === 'bottom' && bbox.bottom + GAP + H > vh)  side = 'top'
    if (side === 'top'    && bbox.top    - GAP - H < 0)   side = 'bottom'

    // ── 2. Unclamped position for the (possibly flipped) side ───────────────
    let left: number
    let top: number
    let transform: string

    if (side === 'right') {
        left = bbox.right + GAP
        top  = bbox.top + bbox.height / 2
        transform = 'translateY(-50%)'
    } else if (side === 'left') {
        left = bbox.left - W - GAP
        top  = bbox.top + bbox.height / 2
        transform = 'translateY(-50%)'
    } else if (side === 'bottom') {
        left = bbox.left + bbox.width / 2
        top  = bbox.bottom + GAP
        transform = 'translateX(-50%)'
    } else {
        // top
        left = bbox.left + bbox.width / 2
        top  = bbox.top - GAP
        transform = 'translate(-50%, -100%)'
    }

    // ── 3. Final clamp — keep tooltip fully within the viewport ─────────────
    // Horizontal: for left/right the rendered x-range is [left, left+W].
    // For top/bottom (centered) the rendered x-range is [left-W/2, left+W/2].
    if (side === 'top' || side === 'bottom') {
        left = Math.max(GAP + W / 2, Math.min(left, vw - W / 2 - GAP))
    } else {
        left = Math.max(GAP, Math.min(left, vw - W - GAP))
    }

    // Vertical: accounts for how each transform offsets the rendered rect.
    if (H > 0) {
        if (side === 'right' || side === 'left') {
            // translateY(-50%) → rendered top = top - H/2
            top = Math.max(GAP + H / 2, Math.min(top, vh - GAP - H / 2))
        } else if (side === 'bottom') {
            // no vertical transform → rendered top = top
            top = Math.max(GAP, Math.min(top, vh - GAP - H))
        } else {
            // translate(-50%, -100%) → rendered top = top - H
            top = Math.max(GAP + H, Math.min(top, vh - GAP))
        }
    }

    return { left, top, transform, width: W }
}

// ── Focus trap — cycles Tab within the tooltip's focusable buttons ─────────

function useFocusTrap(containerRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
    useEffect(() => {
        if (!active) return
        const el = containerRef.current
        if (!el) return

        // Focus the primary action on mount so keyboard users land somewhere
        // sensible. setTimeout 0 lets layout settle first.
        const t = setTimeout(() => {
            const first = el.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            first?.focus()
        }, 0)

        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return
            const focusables = el.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
            if (focusables.length === 0) return
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }
        document.addEventListener('keydown', onKey)
        return () => {
            clearTimeout(t)
            document.removeEventListener('keydown', onKey)
        }
    }, [containerRef, active])
}

/**
 * Guided-tour overlay that walks the user through a sequence of UI elements.
 *
 * Highlights each step's target element with an outlined "spotlight", shows a
 * tooltip with the description, and provides Prev / Next / Done navigation.
 * The wrapped tree is rendered unchanged; the overlay sits on top of it via a
 * portal so it always covers the real viewport regardless of where Wizard
 * lives in the React tree.
 *
 * **What's improved over the previous version**
 * - `localStorage` access is SSR-safe and try/catch-guarded (Safari private
 *   mode, quota exceeded, no-storage browsers all degrade silently).
 * - No more `classList.add(...)` on consumer-owned DOM. The spotlight is a
 *   portaled outline rectangle that tracks the target's bbox via
 *   `ResizeObserver` + scroll/resize listeners. The consumer's DOM is never
 *   mutated, so unmounting Wizard mid-tour leaves no orphan classes.
 * - Focus trap inside the tooltip — Tab and Shift+Tab cycle through the
 *   tooltip's buttons. Esc dismisses (when `dismissible`).
 * - Backdrop blocks click-through on the rest of the page so the user can't
 *   stumble into unrelated UI mid-tour. The highlighted target itself stays
 *   click-blocked too (use the "Next" button to advance).
 * - Position recalculates on scroll / resize / target size changes via
 *   `ResizeObserver`.
 * - All `dark-cornflower-blue` / `prussian-blue` / `bg-white` swapped for
 *   semantic tokens — both light and dark modes work out of the box.
 *
 * @example
 * ```tsx
 * const dashRef = useRef<HTMLDivElement>(null)
 * const sidebarRef = useRef<HTMLElement>(null)
 *
 * <Wizard
 *   steps={[
 *     { stepRef: dashRef,    title: 'Dashboard', description: 'Your fleet at a glance.' },
 *     { stepRef: sidebarRef, title: 'Navigation', description: 'Jump between sections here.', placement: 'right' },
 *   ]}
 *   onComplete={() => track('onboarding_complete')}
 * >
 *   <Layout dashRef={dashRef} sidebarRef={sidebarRef} />
 * </Wizard>
 * ```
 */
export default function Wizard({
    children,
    steps,
    storageKey = 'oxygen.wizard.completed',
    dismissible = true,
    onComplete,
    onSkip,
}: WizardProps) {
    const tooltipRef = useRef<HTMLDivElement>(null)
    const tooltipTitleId = useId()
    const tooltipBodyId  = useId()
    const reduced = useReducedMotion()

    // Open the wizard only when not previously dismissed and there is
    // actually at least one step.
    const [open, setOpen] = useState(() => steps.length > 0 && !readDismissed(storageKey))
    const [activeIndex, setActiveIndex] = useState(0)

    // Measured height of the tooltip so the clamp function has an accurate value.
    // Reruns on step change and open toggle — the only events that alter the
    // tooltip's rendered content and thus its height. The functional updater
    // prevents re-render loops: React bails out when the value is unchanged.
    const [tooltipHeight, setTooltipHeight] = useState(0)
    useLayoutEffect(() => {
        const h = tooltipRef.current?.offsetHeight ?? 0
        if (h > 0) setTooltipHeight((prev) => (prev === h ? prev : h))
    }, [activeIndex, open])

    const step = steps[activeIndex]
    const bbox = useTargetBbox(step?.stepRef)

    useFocusTrap(tooltipRef, open)

    // Esc to dismiss (when allowed)
    useEffect(() => {
        if (!open || !dismissible) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                handleSkip()
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dismissible])

    const handleSkip = useCallback(() => {
        writeDismissed(storageKey)
        setOpen(false)
        onSkip?.()
    }, [storageKey, onSkip])

    const handleComplete = useCallback(() => {
        writeDismissed(storageKey)
        setOpen(false)
        onComplete?.()
    }, [storageKey, onComplete])

    const handleNext = () => {
        if (activeIndex < steps.length - 1) setActiveIndex((i) => i + 1)
        else handleComplete()
    }

    const handlePrev = () => {
        if (activeIndex > 0) setActiveIndex((i) => i - 1)
    }

    // The spotlight ring + click blocker get a small padding around the bbox
    // so they read as a halo, not as a tight outline.
    const SPOT_PAD = 6

    const highlightStyle: React.CSSProperties = bbox
        ? {
              left: bbox.left - SPOT_PAD,
              top: bbox.top - SPOT_PAD,
              width: bbox.width + SPOT_PAD * 2,
              height: bbox.height + SPOT_PAD * 2,
          }
        : { display: 'none' }

    // Four backdrop rectangles surrounding the target bbox — they share the
    // blur + tint, but leave the target area itself crystal clear. A
    // transparent fifth rect sits ON the target and blocks pointer events so
    // the user can't accidentally interact with the highlighted UI during
    // the tour (they advance via the tooltip buttons).
    const backdropTop: React.CSSProperties = bbox
        ? { left: 0, top: 0, right: 0, height: Math.max(0, bbox.top - SPOT_PAD) }
        : { display: 'none' }
    const backdropBottom: React.CSSProperties = bbox
        ? { left: 0, top: bbox.bottom + SPOT_PAD, right: 0, bottom: 0 }
        : { display: 'none' }
    const backdropLeft: React.CSSProperties = bbox
        ? {
              left: 0,
              top: bbox.top - SPOT_PAD,
              width: Math.max(0, bbox.left - SPOT_PAD),
              height: bbox.height + SPOT_PAD * 2,
          }
        : { display: 'none' }
    const backdropRight: React.CSSProperties = bbox
        ? {
              left: bbox.right + SPOT_PAD,
              top: bbox.top - SPOT_PAD,
              right: 0,
              height: bbox.height + SPOT_PAD * 2,
          }
        : { display: 'none' }

    const tooltipStyle = bbox ? tooltipStyleFor(bbox, step?.placement, tooltipHeight) : { display: 'none' }

    const isLast = activeIndex === steps.length - 1

    return (
        <>
            {children}

            <AnimatePresence>
                {open && step && (
                    <Portal>
                        {/* Backdrop is built from FOUR rectangles surrounding
                            the target — the area inside the spotlight stays
                            crystal clear (no blur, no tint). All four fade
                            in/out together. */}
                        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                            <motion.div
                                key={side}
                                className="fixed z-[7000000] bg-foreground/40 backdrop-blur-[2px] pointer-events-auto"
                                style={
                                    side === 'top'    ? backdropTop    :
                                    side === 'bottom' ? backdropBottom :
                                    side === 'left'   ? backdropLeft   :
                                                        backdropRight
                                }
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                                aria-hidden="true"
                            />
                        ))}

                        {/* Transparent click blocker over the target — keeps
                            the highlight visually untouched but stops the user
                            from accidentally interacting with the spotlit UI
                            mid-tour. */}
                        <motion.div
                            className="fixed z-[7000001] pointer-events-auto"
                            style={highlightStyle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                            aria-hidden="true"
                        />

                        {/* Spotlight outline ring drawn on top of the blocker. */}
                        <motion.div
                            className="fixed z-[7000002] pointer-events-none rounded-md ring-2 ring-accent"
                            style={highlightStyle}
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.08 }}
                            transition={{
                                duration: reduced ? 0 : 0.32,
                                ease: [0.16, 1, 0.3, 1], // ease-out-expo — settles softly
                            }}
                            aria-hidden="true"
                        />

                        {/* Tooltip cross-fades + slides between steps. The
                            `key={activeIndex}` makes AnimatePresence treat each
                            step as a separate mount, triggering enter/exit on
                            navigation. Focus-trapped + Esc-dismissible. */}
                        <motion.div
                            key={activeIndex}
                            ref={tooltipRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={step.title ? tooltipTitleId : undefined}
                            aria-describedby={tooltipBodyId}
                            className="fixed z-[7000003] rounded-lg bg-surface text-foreground border border-border shadow-xl p-4 pointer-events-auto"
                            style={tooltipStyle}
                            initial={{ opacity: 0, scale: 0.96, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 4 }}
                            transition={
                                reduced
                                    ? { duration: 0 }
                                    : {
                                          opacity: { duration: 0.18 },
                                          scale:   { type: 'tween', duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                                          y:       { type: 'tween', duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                                      }
                            }
                        >
                        {step.title && (
                            <h3 id={tooltipTitleId} className="text-sm font-semibold text-foreground mb-1">
                                {step.title}
                            </h3>
                        )}
                        <div id={tooltipBodyId} className="text-sm text-foreground-secondary leading-relaxed">
                            {step.description}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            {/* Step indicator */}
                            <span className="text-xs text-foreground-muted tabular-nums">
                                {activeIndex + 1} / {steps.length}
                            </span>

                            <div className="flex items-center gap-2">
                                {dismissible && !isLast && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        content="Skip"
                                        onClick={handleSkip}
                                    />
                                )}
                                {activeIndex > 0 && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        content="Back"
                                        onClick={handlePrev}
                                    />
                                )}
                                <Button
                                    size="sm"
                                    content={isLast ? 'Done' : 'Next'}
                                    onClick={handleNext}
                                />
                            </div>
                        </div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>
        </>
    )
}
