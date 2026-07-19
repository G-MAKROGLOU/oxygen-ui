import React from 'react'
import { cx } from '../../utils/cx'

export interface Feature {
    /** Stable key. */
    key?: string | number
    /** Leading icon (rendered in an accent-tinted tile). */
    icon?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
}

export interface FeatureGridProps {
    /** The features to render. */
    features: Feature[]
    /** Section eyebrow / kicker. */
    eyebrow?: React.ReactNode
    /** Section heading. */
    title?: React.ReactNode
    /** Section sub-heading. */
    description?: React.ReactNode
    /** Columns at the largest breakpoint (collapses responsively). Default `3`. */
    columns?: 2 | 3 | 4
    /** Centre the section header. Default `true`. */
    centeredHeader?: boolean
    className?: string
    style?: React.CSSProperties
}

const COLS: Record<2 | 3 | 4, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * A responsive grid of product features, icon, title, blurb, with an optional
 * section header. Collapses to a single column on mobile.
 *
 * @example
 * <FeatureGrid
 *   title="Everything in one portal"
 *   columns={3}
 *   features={[{ icon: <BoltIcon />, title: 'Realtime', description: 'Live vessel data.' }, …]}
 * />
 */
export default function FeatureGrid({
    features,
    eyebrow,
    title,
    description,
    columns = 3,
    centeredHeader = true,
    className = '',
    style,
}: FeatureGridProps) {
    const hasHeader = eyebrow != null || title != null || description != null
    return (
        <section className={cx('px-2', className)} style={style}>
            {hasHeader && (
                <header className={['mb-10 flex flex-col gap-3', centeredHeader ? 'items-center text-center' : 'items-start text-left'].join(' ')}>
                    {eyebrow != null && <div className="text-xs font-semibold uppercase tracking-wide text-accent">{eyebrow}</div>}
                    {title != null && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
                    {description != null && <p className="max-w-2xl text-base leading-relaxed text-foreground-secondary">{description}</p>}
                </header>
            )}
            <div className={['grid grid-cols-1 gap-6', COLS[columns]].join(' ')}>
                {features.map((f, i) => (
                    <div key={f.key ?? i} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                        {f.icon != null && (
                            <span
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-accent"
                                style={{ backgroundColor: 'color-mix(in oklab, var(--color-accent) 12%, var(--color-surface))' }}
                            >
                                {f.icon}
                            </span>
                        )}
                        <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                        {f.description != null && <p className="text-sm leading-relaxed text-foreground-secondary">{f.description}</p>}
                    </div>
                ))}
            </div>
        </section>
    )
}
