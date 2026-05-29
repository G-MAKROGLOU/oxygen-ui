import React, { useId, useState } from 'react'
import { Field, type FieldSize } from './_field'

export interface RatingProps {
    value?: number
    defaultValue?: number
    onChange?: (value: number) => void
    /** Number of icons. Default `5`. */
    count?: number
    /** Allow half-icon precision. Default `false`. */
    allowHalf?: boolean
    /** Read-only display (no hover / click). */
    readOnly?: boolean
    /** Clicking the current value again clears to 0. Default `true`. */
    clearable?: boolean
    label?: React.ReactNode
    size?: FieldSize
    disabled?: boolean
    /** Override the icon. Receives a `filled` flag. Default is a star. */
    icon?: (filled: boolean) => React.ReactNode
    errorMessage?: React.ReactNode
    name?: string
}

const ICON_SIZE: Record<FieldSize, string> = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }

const Star = (filled: boolean) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className="w-full h-full" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5a.56.56 0 011.04 0l2.13 4.77 5.18.5a.56.56 0 01.32.97l-3.9 3.46 1.15 5.1a.56.56 0 01-.83.6L12 16.8l-4.57 2.6a.56.56 0 01-.83-.6l1.15-5.1-3.9-3.46a.56.56 0 01.32-.97l5.18-.5L11.48 3.5z" />
    </svg>
)

/**
 * Star (or custom glyph) rating with optional half-steps, hover preview, and
 * read-only mode. Keyboard accessible: arrow keys adjust, Home/End jump to
 * min/max.
 *
 * @example
 * ```tsx
 * <Rating label="Quality" value={rating} onChange={setRating} allowHalf />
 * ```
 *
 * @example Read-only display
 * ```tsx
 * <Rating value={4.5} allowHalf readOnly />
 * ```
 */
export default function Rating({
    value,
    defaultValue = 0,
    onChange,
    count = 5,
    allowHalf = false,
    readOnly = false,
    clearable = true,
    label,
    size = 'md',
    disabled,
    icon = Star,
    errorMessage,
    name,
}: RatingProps) {
    const errorId = useId()
    const [internal, setInternal] = useState(defaultValue)
    const [hover, setHover] = useState<number | null>(null)

    const current = value ?? internal
    const display = hover ?? current
    const interactive = !readOnly && !disabled

    const commit = (next: number) => {
        const v = clearable && next === current ? 0 : next
        setInternal(v)
        onChange?.(v)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!interactive) return
        const step = allowHalf ? 0.5 : 1
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); commit(Math.min(count, current + step)) }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); commit(Math.max(0, current - step)) }
        else if (e.key === 'Home') { e.preventDefault(); commit(0) }
        else if (e.key === 'End') { e.preventDefault(); commit(count) }
    }

    return (
        <Field label={label} errorId={errorId} errorMessage={errorMessage}>
            <div
                role={interactive ? 'slider' : 'img'}
                aria-label={typeof label === 'string' ? label : 'Rating'}
                aria-valuenow={interactive ? current : undefined}
                aria-valuemin={interactive ? 0 : undefined}
                aria-valuemax={interactive ? count : undefined}
                aria-valuetext={`${current} of ${count}`}
                tabIndex={interactive ? 0 : -1}
                onKeyDown={onKeyDown}
                onMouseLeave={() => setHover(null)}
                className="inline-flex items-center gap-1 text-accent focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring rounded-md w-max"
            >
                {name && <input type="hidden" name={name} value={current} />}
                {Array.from({ length: count }, (_, i) => {
                    const starValue = i + 1
                    const fillFraction = Math.max(0, Math.min(1, display - i))
                    return (
                        <span
                            key={i}
                            className={`relative ${ICON_SIZE[size]} ${interactive ? 'cursor-pointer' : ''} ${disabled ? 'opacity-50' : ''}`}
                            onMouseMove={(e) => {
                                if (!interactive) return
                                if (allowHalf) {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const half = e.clientX - rect.left < rect.width / 2
                                    setHover(i + (half ? 0.5 : 1))
                                } else {
                                    setHover(starValue)
                                }
                            }}
                            onClick={(e) => {
                                if (!interactive) return
                                if (allowHalf) {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const half = e.clientX - rect.left < rect.width / 2
                                    commit(i + (half ? 0.5 : 1))
                                } else {
                                    commit(starValue)
                                }
                            }}
                        >
                            {/* Empty layer */}
                            <span className="absolute inset-0 text-foreground-muted">{icon(false)}</span>
                            {/* Filled layer, clipped to the fill fraction */}
                            <span
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillFraction * 100}%` }}
                            >
                                {icon(true)}
                            </span>
                        </span>
                    )
                })}
            </div>
        </Field>
    )
}
