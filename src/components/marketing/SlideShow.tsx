import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export interface Slide {
    key?: string | number
    eyebrow?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    /** CTA row (your Buttons). */
    actions?: React.ReactNode
    /** Background image URL. Without it the slide uses the surface background. */
    image?: string
    /** Text alignment. Default `'center'`. */
    align?: 'start' | 'center'
}

export interface SlideShowProps {
    slides: Slide[]
    /** Auto-advance. Default `true`. */
    autoPlay?: boolean
    /** Auto-advance interval (ms). Default `6000`. */
    interval?: number
    showArrows?: boolean
    showDots?: boolean
    /** Stage height. Default `460`. */
    height?: number | string
    'aria-label'?: string
    className?: string
    style?: React.CSSProperties
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
)

const SCRIM = 'linear-gradient(to top, color-mix(in oklab, var(--color-foreground) 70%, transparent), color-mix(in oklab, var(--color-foreground) 25%, transparent))'

/**
 * A full-bleed hero slideshow: each slide carries an eyebrow, title, description
 * and CTAs over an optional background image (with a legibility scrim).
 * Cross-fades between slides, auto-advances (pause on hover), and offers arrows
 * + dots. Respects `prefers-reduced-motion`.
 *
 * @example
 * <SlideShow slides={[
 *   { title: 'Welcome aboard', description: '…', image: hero1, actions: <Button content="Start" /> },
 *   { title: 'Track everything', image: hero2 },
 * ]} />
 */
export default function SlideShow({
    slides,
    autoPlay = true,
    interval = 6000,
    showArrows = true,
    showDots = true,
    height = 460,
    'aria-label': ariaLabel = 'Slideshow',
    className = '',
    style,
}: SlideShowProps) {
    const reduced = useReducedMotion()
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const count = slides.length
    const idx = count ? ((index % count) + count) % count : 0

    const go = useCallback((d: 1 | -1) => setIndex((i) => i + d), [])

    const timer = useRef<ReturnType<typeof setInterval> | null>(null)
    useEffect(() => {
        if (!autoPlay || paused || count <= 1) return
        timer.current = setInterval(() => setIndex((i) => i + 1), interval)
        return () => { if (timer.current) clearInterval(timer.current) }
    }, [autoPlay, paused, interval, count])

    if (count === 0) return null
    const slide = slides[idx]
    const onImage = Boolean(slide.image)
    const align = slide.align ?? 'center'

    return (
        <section
            aria-label={ariaLabel}
            aria-roledescription="carousel"
            className={['relative overflow-hidden rounded-2xl', className].filter(Boolean).join(' ')}
            style={{ height, ...style }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={slide.key ?? idx}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, ease: 'easeInOut' }}
                    style={onImage ? { backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                    {onImage && <div className="absolute inset-0" style={{ backgroundImage: SCRIM }} aria-hidden="true" />}
                    <div className={['relative flex h-full flex-col justify-center gap-5 px-8 sm:px-14', align === 'center' ? 'items-center text-center' : 'items-start text-left', onImage ? 'text-white' : 'bg-surface text-foreground'].join(' ')}>
                        {slide.eyebrow != null && (
                            <div className={['text-xs font-semibold uppercase tracking-wide', onImage ? 'text-white/80' : 'text-accent'].join(' ')}>{slide.eyebrow}</div>
                        )}
                        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{slide.title}</h2>
                        {slide.description != null && <p className={['max-w-xl text-base leading-relaxed sm:text-lg', onImage ? 'text-white/85' : 'text-foreground-secondary'].join(' ')}>{slide.description}</p>}
                        {slide.actions != null && <div className={['mt-2 flex flex-wrap gap-3', align === 'center' ? 'justify-center' : ''].join(' ')}>{slide.actions}</div>}
                    </div>
                </motion.div>
            </AnimatePresence>

            {showArrows && count > 1 && (
                <>
                    <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <Arrow dir="left" />
                    </button>
                    <button type="button" aria-label="Next slide" onClick={() => go(1)} className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <Arrow dir="right" />
                    </button>
                </>
            )}

            {showDots && count > 1 && (
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === idx}
                            onClick={() => setIndex(i)}
                            className={['h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white', i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'].join(' ')}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
