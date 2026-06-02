import React from 'react'

export type JumbotronLayout = 'centered' | 'split'
export type JumbotronBackground = 'none' | 'surface' | 'gradient'

export interface JumbotronProps {
    /** Small label above the title (kicker / category). */
    eyebrow?: React.ReactNode
    /** The hero headline. */
    title: React.ReactNode
    /** Supporting paragraph under the title. */
    description?: React.ReactNode
    /** Call-to-action row — typically one or two `Button`s. */
    actions?: React.ReactNode
    /** Media (image / screenshot / illustration). Shown beside the copy in
     *  `split`, below it in `centered`. */
    media?: React.ReactNode
    /** `centered` (default) stacks copy centred; `split` is copy + media side-by-side. */
    layout?: JumbotronLayout
    /** Backdrop: none, a raised surface card, or a soft accent gradient glow. */
    background?: JumbotronBackground
    className?: string
    style?: React.CSSProperties
}

const GRADIENT = 'radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--color-accent) 12%, transparent), transparent 70%)'

/**
 * A landing-page hero ("jumbotron"): an eyebrow, a large headline, a supporting
 * line, and call-to-action buttons — optionally paired with media. `centered`
 * stacks everything centred; `split` puts the copy next to the media and stacks
 * on small screens. Pair with FeatureGrid / PricingPlans / Testimonials to
 * compose a full page.
 *
 * @example
 * <Jumbotron
 *   background="gradient"
 *   eyebrow={<Badge tone="accent">New</Badge>}
 *   title="Ship maritime ops faster"
 *   description="One portal for compliance, performance and voyage data."
 *   actions={<><Button content="Get started" /><Button variant="outline" content="Book a demo" /></>}
 * />
 */
export default function Jumbotron({
    eyebrow,
    title,
    description,
    actions,
    media,
    layout = 'centered',
    background = 'none',
    className = '',
    style,
}: JumbotronProps) {
    const split = layout === 'split' && media != null
    const bgClass = background === 'surface' ? 'bg-surface' : ''

    const copy = (
        <div className={['flex flex-col gap-5', split ? 'items-start text-left' : 'items-center text-center'].join(' ')}>
            {eyebrow != null && <div>{eyebrow}</div>}
            <h1 className={['text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl', split ? '' : 'max-w-3xl'].join(' ')}>
                {title}
            </h1>
            {description != null && (
                <p className={['text-lg leading-relaxed text-foreground-secondary', split ? 'max-w-xl' : 'max-w-2xl'].join(' ')}>
                    {description}
                </p>
            )}
            {actions != null && (
                <div className={['mt-2 flex flex-wrap gap-3', split ? 'justify-start' : 'justify-center'].join(' ')}>
                    {actions}
                </div>
            )}
        </div>
    )

    return (
        <section
            className={['relative overflow-hidden rounded-2xl px-6 py-16 sm:px-10 sm:py-24', bgClass, className].filter(Boolean).join(' ')}
            style={{ ...(background === 'gradient' ? { backgroundImage: GRADIENT } : null), ...style }}
        >
            {split ? (
                <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
                    {copy}
                    <div className="overflow-hidden rounded-xl">{media}</div>
                </div>
            ) : (
                <div className="mx-auto flex max-w-4xl flex-col items-center">
                    {copy}
                    {media != null && <div className="mt-12 w-full overflow-hidden rounded-xl">{media}</div>}
                </div>
            )}
        </section>
    )
}
