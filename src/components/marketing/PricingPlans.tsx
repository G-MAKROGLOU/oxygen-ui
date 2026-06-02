import React from 'react'
import Button from '../inputs/Button'
import { cx } from '../../utils/cx'

export interface PricingPlan {
    key?: string | number
    /** Plan name, e.g. "Pro". */
    name: React.ReactNode
    /** Price, e.g. "$49" or "Custom". */
    price: React.ReactNode
    /** Billing period suffix, e.g. "/mo". */
    period?: React.ReactNode
    /** Short positioning line. */
    description?: React.ReactNode
    /** Included features (rendered with check marks). */
    features: React.ReactNode[]
    /** CTA button. */
    cta: { label: React.ReactNode; onClick?: () => void }
    /** Emphasise this plan (accent border, lift, badge). */
    highlighted?: boolean
    /** Small ribbon label on a highlighted plan, e.g. "Most popular". */
    badge?: React.ReactNode
}

export interface PricingPlansProps {
    plans: PricingPlan[]
    eyebrow?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
    </svg>
)

/**
 * A pricing-tier section: a responsive row of plan cards, each with a price,
 * a feature checklist and a CTA. Mark one plan `highlighted` to lift it with an
 * accent border and an optional `badge`.
 *
 * @example
 * <PricingPlans title="Pricing" plans={[
 *   { name: 'Starter', price: '$0', period: '/mo', features: ['1 vessel', 'Email support'], cta: { label: 'Start free' } },
 *   { name: 'Pro', price: '$49', period: '/mo', highlighted: true, badge: 'Most popular',
 *     features: ['Unlimited vessels', 'Priority support'], cta: { label: 'Go Pro' } },
 * ]} />
 */
export default function PricingPlans({ plans, eyebrow, title, description, className = '', style }: PricingPlansProps) {
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
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((p, i) => (
                    <div
                        key={p.key ?? i}
                        className={[
                            'relative flex flex-col rounded-2xl border bg-surface p-6',
                            p.highlighted ? 'border-accent shadow-lg lg:-my-2 lg:py-8' : 'border-border',
                        ].join(' ')}
                    >
                        {p.highlighted && p.badge != null && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-fg shadow-sm">
                                {p.badge}
                            </span>
                        )}
                        <div className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">{p.name}</div>
                        <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">{p.price}</span>
                            {p.period != null && <span className="text-sm text-foreground-muted">{p.period}</span>}
                        </div>
                        {p.description != null && <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">{p.description}</p>}
                        <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                            {p.features.map((f, fi) => (
                                <li key={fi} className="flex gap-2 text-sm text-foreground-secondary">
                                    <Check />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            <Button
                                content={p.cta.label}
                                variant={p.highlighted ? 'primary' : 'outline'}
                                onClick={p.cta.onClick}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
