import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type CardCarouselVariant = 'flat' | 'rotating'

export interface CardCarouselProps {
    /** The slides — typically `Card`s. */
    children: React.ReactNode
    /**
     * Layout style. Default `'flat'`.
     * - `'flat'` — a horizontal scroll-snap row (trackpad / touch / wheel).
     * - `'rotating'` — a coverflow stack: the active card sits centre-stage,
     *   prominent, with its neighbours scaled back and faded behind it.
     */
    variant?: CardCarouselVariant
    /** Width of each slide. Number → px. Default `280`. */
    itemWidth?: number | string
    /** Gap between slides in px (`flat` only). Default `16`. */
    gap?: number
    /** Show prev / next arrow buttons. Default `true`. */
    showArrows?: boolean
    /** Show position dots. Default `false`. */
    showDots?: boolean
    /** Accessible label for the region. Default `'Carousel'`. */
    'aria-label'?: string
    className?: string
    style?: React.CSSProperties
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
)

const arrowBtn =
    'absolute top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full ' +
    'border border-border bg-surface text-foreground-secondary shadow-md transition ' +
    'hover:text-foreground hover:bg-surface-raised disabled:opacity-0 disabled:pointer-events-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

const Dots = ({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) => (
    <div className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => (
            <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => onSelect(i)}
                className={[
                    'h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    i === active ? 'w-5 bg-accent' : 'w-1.5 bg-border hover:bg-foreground-muted',
                ].join(' ')}
            />
        ))}
    </div>
)

/**
 * A carousel for cards, in two flavours via `variant`:
 *
 * - **`flat`** (default) — a native scroll-snap row driven by trackpad / touch /
 *   wheel, with optional arrows and dots. Arrows disable at the ends.
 * - **`rotating`** — a coverflow stack. The active card is centre-stage and
 *   prominent; neighbours are scaled back and faded behind it. Stepping animates
 *   the stack with a Framer Motion spring (transform + opacity only, so it stays
 *   smooth). Click a side card, use the arrows/dots, or press ←/→.
 *
 * @example
 * ```tsx
 * <CardCarousel variant="rotating" itemWidth={320} showDots>
 *   {vessels.map((v) => <Card key={v.id}>…</Card>)}
 * </CardCarousel>
 * ```
 */
export default function CardCarousel(props: CardCarouselProps) {
    return props.variant === 'rotating' ? <RotatingCarousel {...props} /> : <FlatCarousel {...props} />
}

// ─── flat — scroll-snap row ───────────────────────────────────────────────────

function FlatCarousel({
    children,
    itemWidth = 280,
    gap = 16,
    showArrows = true,
    showDots = false,
    'aria-label': ariaLabel = 'Carousel',
    className = '',
    style,
}: CardCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null)
    const slides = React.Children.toArray(children)
    const [active, setActive] = useState(0)
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(false)
    const width = typeof itemWidth === 'number' ? `${itemWidth}px` : itemWidth

    const update = useCallback(() => {
        const el = scrollerRef.current
        if (!el) return
        setAtStart(el.scrollLeft <= 1)
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
        const first = el.firstElementChild as HTMLElement | null
        const slideW = first ? first.getBoundingClientRect().width + gap : el.clientWidth
        setActive(Math.round(el.scrollLeft / slideW))
    }, [gap])

    useEffect(() => {
        update()
        const el = scrollerRef.current
        if (!el) return
        el.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            el.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [update])

    const slideStep = (dir: -1 | 1) => {
        const el = scrollerRef.current
        if (!el) return
        const first = el.firstElementChild as HTMLElement | null
        const slideW = first ? first.getBoundingClientRect().width + gap : el.clientWidth
        el.scrollBy({ left: dir * slideW, behavior: 'smooth' })
    }

    const scrollToIndex = (i: number) => {
        const el = scrollerRef.current
        if (!el) return
        const first = el.firstElementChild as HTMLElement | null
        const slideW = first ? first.getBoundingClientRect().width + gap : el.clientWidth
        el.scrollTo({ left: i * slideW, behavior: 'smooth' })
    }

    return (
        <section aria-label={ariaLabel} aria-roledescription="carousel" className={['relative', className].filter(Boolean).join(' ')} style={style}>
            {showArrows && (
                <button type="button" aria-label="Previous" onClick={() => slideStep(-1)} disabled={atStart} className={`${arrowBtn} left-1`}>
                    <Arrow dir="left" />
                </button>
            )}

            <div ref={scrollerRef} className="flex overflow-x-auto snap-x snap-mandatory hidden-scrollbar scroll-smooth" style={{ gap }}>
                {slides.map((slide, i) => (
                    <div key={i} className="snap-start flex-shrink-0" style={{ width }}>
                        {slide}
                    </div>
                ))}
            </div>

            {showArrows && (
                <button type="button" aria-label="Next" onClick={() => slideStep(1)} disabled={atEnd} className={`${arrowBtn} right-1`}>
                    <Arrow dir="right" />
                </button>
            )}

            {showDots && slides.length > 1 && <Dots count={slides.length} active={active} onSelect={scrollToIndex} />}
        </section>
    )
}

// ─── rotating — coverflow stack ───────────────────────────────────────────────

function RotatingCarousel({
    children,
    itemWidth = 280,
    showArrows = true,
    showDots = false,
    'aria-label': ariaLabel = 'Carousel',
    className = '',
    style,
}: CardCarouselProps) {
    const slides = React.Children.toArray(children)
    const count = slides.length
    const [active, setActive] = useState(0)
    const reduced = useReducedMotion()

    // Circular: the stack loops, so there's always a neighbour on each side
    // (the first card shows the last one on its left) and the arrows wrap at
    // the ends instead of dead-ending.
    const wrap = (n: number) => (count > 0 ? ((n % count) + count) % count : 0)
    const idx = wrap(active)
    const step = (dir: -1 | 1) => setActive((a) => wrap(a + dir))

    const w = typeof itemWidth === 'number' ? itemWidth : parseInt(String(itemWidth), 10) || 320
    const widthCss = typeof itemWidth === 'number' ? `${itemWidth}px` : itemWidth

    // Centre-to-centre distance for a neighbour, and how far the off-stage cards
    // park. Tuned so neighbours peek out from behind the active card.
    const SPACING = w * 0.6
    const SIDE_SCALE = 0.82
    const SIDE_OPACITY = 0.5
    const transition = reduced
        ? { duration: 0 }
        : ({ type: 'spring', stiffness: 280, damping: 32, mass: 0.9 } as const)

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
        else if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    }

    return (
        <section
            aria-label={ariaLabel}
            aria-roledescription="carousel"
            className={['relative', className].filter(Boolean).join(' ')}
            style={style}
            onKeyDown={onKeyDown}
        >
            {showArrows && (
                <button type="button" aria-label="Previous" onClick={() => step(-1)} className={`${arrowBtn} left-1`}>
                    <Arrow dir="left" />
                </button>
            )}

            {/* Stage — overflow-hidden so off-stage cards bleed cleanly off the
                edges; py gives the active card's shadow room to breathe. */}
            <div className="relative mx-auto overflow-hidden py-6">
                {/* Invisible spacer sizes the stage to the active card's height. */}
                {count > 0 && (
                    <div className="invisible mx-auto" style={{ width: widthCss }} aria-hidden="true">
                        {slides[idx]}
                    </div>
                )}

                {slides.map((slide, i) => {
                    // Shortest signed circular distance from the active card, so a
                    // card near the "end" wraps to peek from the opposite side.
                    let offset = wrap(i - idx)
                    if (offset > count / 2) offset -= count
                    const abs = Math.abs(offset)
                    if (abs > 2) return null // keep a small window mounted for smooth in/out
                    const isCenter = offset === 0
                    const isPeek = abs === 1
                    return (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{ width: widthCss, zIndex: 30 - abs * 10, pointerEvents: isCenter || isPeek ? 'auto' : 'none' }}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    x: offset * (abs <= 1 ? SPACING : SPACING * 1.7),
                                    scale: isCenter ? 1 : SIDE_SCALE,
                                    opacity: abs <= 1 ? (isCenter ? 1 : SIDE_OPACITY) : 0,
                                }}
                                transition={transition}
                                className={isCenter ? undefined : 'cursor-pointer'}
                                onClick={isCenter ? undefined : () => setActive(i)}
                                aria-hidden={isCenter ? undefined : true}
                            >
                                {slide}
                            </motion.div>
                        </div>
                    )
                })}
            </div>

            {showArrows && (
                <button type="button" aria-label="Next" onClick={() => step(1)} className={`${arrowBtn} right-1`}>
                    <Arrow dir="right" />
                </button>
            )}

            {showDots && count > 1 && <Dots count={count} active={idx} onSelect={setActive} />}
        </section>
    )
}
