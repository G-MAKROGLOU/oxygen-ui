import React from 'react'

export type StatisticSize = 'sm' | 'md' | 'lg'
export type DeltaDirection = 'up' | 'down' | 'neutral'

export interface StatisticDelta {
    /** The change to show beside the arrow, e.g. `'12%'` or `+340`. */
    value: React.ReactNode
    /** Arrow + colour direction. Default inferred `'neutral'`. */
    direction?: DeltaDirection
    /**
     * Whether an `up` direction is a good thing (green) or bad (red). For
     * metrics like churn or latency, set `false` so a rise reads red.
     * Default `true`.
     */
    positiveIsGood?: boolean
    /** Optional trailing context, e.g. `'vs last month'`. */
    label?: React.ReactNode
}

export interface StatisticProps {
    /** Caption above the value. */
    label: React.ReactNode
    /** The metric itself. */
    value: React.ReactNode
    /** Rendered before the value (currency symbol, etc.). */
    prefix?: React.ReactNode
    /** Rendered after the value (unit, %). */
    suffix?: React.ReactNode
    /** Leading icon in a tinted square. */
    icon?: React.ReactNode
    /** Trend indicator under the value. */
    delta?: StatisticDelta
    /** Secondary help text under everything. */
    helpText?: React.ReactNode
    /** Size preset. Default `'md'`. */
    size?: StatisticSize
    /** Text alignment. Default `'left'`. */
    align?: 'left' | 'center'
    className?: string
    style?: React.CSSProperties
}

const VALUE_SIZE: Record<StatisticSize, string> = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
}

const TONE: Record<'good' | 'bad' | 'neutral', string> = {
    good:    'text-status-success',
    bad:     'text-status-error',
    neutral: 'text-foreground-muted',
}

const ArrowUp = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="h-3.5 w-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
    </svg>
)
const ArrowDown = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="h-3.5 w-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
    </svg>
)

/**
 * A single metric: caption, value (with optional prefix/suffix and icon), and an
 * optional trend delta whose colour follows direction — flipped for metrics
 * where a rise is bad via `positiveIsGood: false`.
 *
 * @example
 * <Statistic label="Revenue" value="48,210" prefix="$" delta={{ value: '12%', direction: 'up', label: 'vs last month' }} />
 * <Statistic label="Churn" value="3.1" suffix="%" delta={{ value: '0.4pt', direction: 'up', positiveIsGood: false }} />
 */
export default function Statistic({
    label,
    value,
    prefix,
    suffix,
    icon,
    delta,
    helpText,
    size = 'md',
    align = 'left',
    className = '',
    style,
}: StatisticProps) {
    const dir = delta?.direction ?? 'neutral'
    const positiveIsGood = delta?.positiveIsGood ?? true
    const deltaTone: 'good' | 'bad' | 'neutral' =
        dir === 'neutral' ? 'neutral' : (dir === 'up') === positiveIsGood ? 'good' : 'bad'

    return (
        <div
            className={['flex gap-3', align === 'center' ? 'flex-col items-center text-center' : 'items-start', className].filter(Boolean).join(' ')}
            style={style}
        >
            {icon && align === 'left' && (
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <span className="h-5 w-5 inline-flex items-center justify-center">{icon}</span>
                </span>
            )}
            <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</div>
                <div className={`mt-1 flex items-baseline gap-0.5 font-semibold text-foreground tabular-nums ${VALUE_SIZE[size]} ${align === 'center' ? 'justify-center' : ''}`}>
                    {prefix && <span className="text-foreground-muted text-[0.6em] font-medium self-center">{prefix}</span>}
                    <span className="leading-none">{value}</span>
                    {suffix && <span className="text-foreground-muted text-[0.5em] font-medium self-center">{suffix}</span>}
                </div>
                {delta && (
                    <div className={`mt-1.5 flex items-center gap-1 text-sm font-medium ${align === 'center' ? 'justify-center' : ''} ${TONE[deltaTone]}`}>
                        {dir === 'up' ? ArrowUp : dir === 'down' ? ArrowDown : null}
                        <span>{delta.value}</span>
                        {delta.label && <span className="text-foreground-muted font-normal">{delta.label}</span>}
                    </div>
                )}
                {helpText && <div className="mt-1 text-xs text-foreground-muted">{helpText}</div>}
            </div>
        </div>
    )
}
