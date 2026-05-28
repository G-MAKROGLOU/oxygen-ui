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

function tooltipStyleFor(bbox: DOMRect, placement: WizardStep['placement']): React.CSSProperties {
    const pl = placement ?? 'right'
    if (pl === 'right')  return { left: bbox.right + TOOLTIP_GAP,         top: bbox.top + bbox.height / 2, transform: 'translateY(-50%)', width: TOOLTIP_WIDTH }
    if (pl === 'left')   return { left: bbox.left - TOOLTIP_WIDTH - TOOLTIP_GAP, top: bbox.top + bbox.height / 2, transform: 'translateY(-50%)', width: TOOLTIP_WIDTH }
    if (pl === 'bottom') return { left: bbox.left + bbox.width / 2,       top: bbox.bottom + TOOLTIP_GAP, transform: 'translateX(-50%)', width: TOOLTIP_WIDTH }
    // top
    return { left: bbox.left + bbox.width / 2, top: bbox.top - TOOLTIP_GAP, transform: 'translate(-50%, -100%)', width: TOOLTIP_WIDTH }
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

    // We need to compute these no matter what so the conditional render
    // path stays simple. Falsy bbox => offscreen sentinel.
    const highlightStyle: React.CSSProperties = bbox
        ? {
              left: bbox.left - 4,
              top: bbox.top - 4,
              width: bbox.width + 8,
              height: bbox.height + 8,
          }
        : { display: 'none' }

    const tooltipStyle = bbox ? tooltipStyleFor(bbox, step?.placement) : { display: 'none' }

    const isLast = activeIndex === steps.length - 1

    return (
        <>
            {children}

            <AnimatePresence>
                {open && step && (
                    <Portal>
                        {/* Backdrop fades in/out — wizards are modal experiences;
                            the user advances via the tooltip buttons, not by
                            clicking through to unrelated UI. */}
                        <motion.div
                            className="fixed inset-0 z-[7000000] bg-foreground/40 backdrop-blur-[1px] pointer-events-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                            aria-hidden="true"
                        />

                        {/* Spotlight outline — `layout` lets Framer Motion
                            animate the bbox change between steps, with a soft
                            pulse on the first appearance to draw the eye. */}
                        <motion.div
                            className="fixed z-[7000001] pointer-events-none rounded-md ring-2 ring-accent ring-offset-2 ring-offset-background"
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
                            className="fixed z-[7000002] rounded-lg bg-surface text-foreground border border-border shadow-xl p-4 pointer-events-auto"
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
