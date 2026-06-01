import React, { useCallback, useEffect, useRef, useState } from 'react'

export interface CardCarouselProps {
    /** The slides — typically `Card`s. Each becomes a snap target. */
    children: React.ReactNode
    /** Width of each slide. Number → px. Default `280`. */
    itemWidth?: number | string
    /** Gap between slides in px. Default `16`. */
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

/**
 * A horizontal, scroll-snap carousel for cards. Native scrolling drives it
 * (trackpad / touch / wheel), with optional arrow buttons and position dots.
 * Arrows disable at the ends; the scrollbar is hidden but scrolling is intact.
 *
 * @example
 * ```tsx
 * <CardCarousel itemWidth={300} showDots>
 *   {vessels.map((v) => <Card key={v.id}>…</Card>)}
 * </CardCarousel>
 * ```
 */
export default function CardCarousel({
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
        const step = el.clientWidth // fall back; recomputed below per-slide
        void step
        setAtStart(el.scrollLeft <= 1)
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
        // Active index = nearest slide to the current scroll offset.
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

    const scrollByDir = (dir: -1 | 1) => {
        const el = scrollerRef.current
        if (!el) return
        const first = el.firstElementChild as HTMLElement | null
        const slideW = first ? first.getBoundingClientRect().width + gap : el.clientWidth
        el.scrollBy({ left: dir * slideW, behavior: 'smooth' })
    }

    const scrollTo = (i: number) => {
        const el = scrollerRef.current
        if (!el) return
        const first = el.firstElementChild as HTMLElement | null
        const slideW = first ? first.getBoundingClientRect().width + gap : el.clientWidth
        el.scrollTo({ left: i * slideW, behavior: 'smooth' })
    }

    const arrowBtn =
        'absolute top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full ' +
        'border border-border bg-surface text-foreground-secondary shadow-md transition ' +
        'hover:text-foreground hover:bg-surface-raised disabled:opacity-0 disabled:pointer-events-none ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

    return (
        <section aria-label={ariaLabel} className={['relative', className].filter(Boolean).join(' ')} style={style}>
            {showArrows && (
                <button type="button" aria-label="Previous" onClick={() => scrollByDir(-1)} disabled={atStart} className={`${arrowBtn} left-1`}>
                    <Arrow dir="left" />
                </button>
            )}

            <div
                ref={scrollerRef}
                className="flex overflow-x-auto snap-x snap-mandatory hidden-scrollbar scroll-smooth"
                style={{ gap }}
            >
                {slides.map((slide, i) => (
                    <div key={i} className="snap-start flex-shrink-0" style={{ width }}>
                        {slide}
                    </div>
                ))}
            </div>

            {showArrows && (
                <button type="button" aria-label="Next" onClick={() => scrollByDir(1)} disabled={atEnd} className={`${arrowBtn} right-1`}>
                    <Arrow dir="right" />
                </button>
            )}

            {showDots && slides.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === active}
                            onClick={() => scrollTo(i)}
                            className={[
                                'h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                i === active ? 'w-5 bg-accent' : 'w-1.5 bg-border hover:bg-foreground-muted',
                            ].join(' ')}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
