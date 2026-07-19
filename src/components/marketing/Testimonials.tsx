import React from 'react'
import Avatar from '../core/Avatar'
import { cx } from '../../utils/cx'

export interface Testimonial {
    key?: string | number
    /** The quote text. */
    quote: React.ReactNode
    /** Author name. */
    author: React.ReactNode
    /** Author role / company. */
    role?: React.ReactNode
    /** Author avatar URL (falls back to initials of `author`). */
    avatar?: string
    /** Optional 1–5 star rating. */
    rating?: number
}

export interface TestimonialsProps {
    testimonials: Testimonial[]
    eyebrow?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    /** Columns at the largest breakpoint. Default `3`. */
    columns?: 1 | 2 | 3
    className?: string
    style?: React.CSSProperties
}

const COLS: Record<1 | 2 | 3, string> = {
    1: 'mx-auto max-w-2xl',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
}

const initials = (name: React.ReactNode) =>
    typeof name === 'string'
        ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || undefined
        : undefined

function Stars({ value }: { value: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${value} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${i < value ? 'text-status-warning' : 'text-border-strong'}`} fill="currentColor">
                    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
                </svg>
            ))}
        </div>
    )
}

/**
 * A wall of customer testimonials, quote, star rating, and author with avatar.
 * Responsive grid (single column on mobile); use `columns={1}` for one centred
 * featured quote.
 *
 * @example
 * <Testimonials title="Loved by ops teams" testimonials={[
 *   { quote: 'Cut our reporting time in half.', author: 'Maria F.', role: 'Fleet Manager', rating: 5 },
 * ]} />
 */
export default function Testimonials({ testimonials, eyebrow, title, description, columns = 3, className = '', style }: TestimonialsProps) {
    const hasHeader = eyebrow != null || title != null || description != null
    return (
        <section className={cx('px-2', className)} style={style}>
            {hasHeader && (
                <header className="mb-10 flex flex-col items-center gap-3 text-center">
                    {eyebrow != null && <div className="text-xs font-semibold uppercase tracking-wide text-accent">{eyebrow}</div>}
                    {title != null && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
                    {description != null && <p className="max-w-2xl text-base leading-relaxed text-foreground-secondary">{description}</p>}
                </header>
            )}
            <div className={['grid grid-cols-1 gap-6', COLS[columns]].join(' ')}>
                {testimonials.map((tm, i) => (
                    <figure key={tm.key ?? i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
                        {tm.rating != null && <Stars value={tm.rating} />}
                        <blockquote className="flex-1 text-sm leading-relaxed text-foreground">“{tm.quote}”</blockquote>
                        <figcaption className="flex items-center gap-3">
                            <Avatar src={tm.avatar} alt={typeof tm.author === 'string' ? tm.author : 'Reviewer'} fallback={initials(tm.author)} size="sm" />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">{tm.author}</div>
                                {tm.role != null && <div className="truncate text-xs text-foreground-muted">{tm.role}</div>}
                            </div>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    )
}
