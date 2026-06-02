import React from 'react'
import { cx } from '../../utils/cx'

export type TypographyVariant =
    | 'display'
    | 'h1' | 'h2' | 'h3' | 'h4'
    | 'subtitle'
    | 'body'
    | 'caption'
    | 'overline'
    | 'code'

export type TypographyColor =
    | 'foreground'
    | 'foreground-secondary'
    | 'foreground-muted'
    | 'accent'
    | 'status-error'
    | 'status-warning'
    | 'status-success'
    | 'status-info'
    | 'inherit'

export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TypographyAlign  = 'left' | 'center' | 'right' | 'justify'

export interface TypographyProps {
    /** Visual scale variant. */
    variant?: TypographyVariant
    /**
     * Element to render. Defaults are sensible per variant
     * (e.g. h1 → `<h1>`, body → `<p>`, code → `<code>`). Override
     * with `as` when the semantic element should differ from the visual
     * style (e.g. a styled-as-h1 product card heading rendered as `<div>`).
     */
    as?: keyof React.JSX.IntrinsicElements
    color?: TypographyColor
    weight?: TypographyWeight
    align?: TypographyAlign
    /** Truncate to one line with ellipsis. */
    truncate?: boolean
    /** Render the text with reduced opacity (useful for disabled states). */
    muted?: boolean
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
}

// Variant → Tailwind class map. Each variant defines size, weight, line-height,
// and tracking. The defaults are designed to read at the natural body rhythm
// of the design system.
const VARIANT_CLASS: Record<TypographyVariant, string> = {
    display:  'text-3xl font-bold leading-tight tracking-tight',
    h1:       'text-2xl font-bold leading-tight tracking-tight',
    h2:       'text-xl font-semibold leading-snug tracking-tight',
    h3:       'text-lg font-semibold leading-snug',
    h4:       'text-base font-semibold leading-snug',
    subtitle: 'text-sm font-medium leading-snug',
    body:     'text-sm leading-normal',
    caption:  'text-xs leading-normal',
    overline: 'text-[10px] font-semibold leading-normal uppercase tracking-wider',
    code:     'text-xs leading-normal font-mono bg-surface-raised text-foreground rounded px-1 py-0.5',
}

// Default element per variant. Consumers can override with `as`.
const DEFAULT_ELEMENT: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
    display:  'h1',
    h1:       'h1',
    h2:       'h2',
    h3:       'h3',
    h4:       'h4',
    subtitle: 'p',
    body:     'p',
    caption:  'span',
    overline: 'span',
    code:     'code',
}

const COLOR_CLASS: Record<TypographyColor, string> = {
    'foreground':           'text-foreground',
    'foreground-secondary': 'text-foreground-secondary',
    'foreground-muted':     'text-foreground-muted',
    'accent':               'text-accent',
    'status-error':         'text-status-error',
    'status-warning':       'text-status-warning',
    'status-success':       'text-status-success',
    'status-info':          'text-status-info',
    'inherit':              '',
}

const WEIGHT_CLASS: Record<TypographyWeight, string> = {
    normal:   'font-normal',
    medium:   'font-medium',
    semibold: 'font-semibold',
    bold:     'font-bold',
}

const ALIGN_CLASS: Record<TypographyAlign, string> = {
    left:    'text-left',
    center:  'text-center',
    right:   'text-right',
    justify: 'text-justify',
}

/**
 * Polymorphic typography primitive. `variant` picks a visual scale; `as`
 * controls the rendered element when it should differ from the default
 * for that variant (e.g. a styled-as-h2 card title rendered as `<div>`).
 *
 * **Variants** map to the design-system text scale:
 * - `display`: hero headlines
 * - `h1` – `h4`: section / subsection headings
 * - `subtitle`: emphasised lead text
 * - `body` (default): paragraph text
 * - `caption`: small label / hint text
 * - `overline`: uppercase eyebrow text
 * - `code`: inline code samples
 *
 * **Colour** accepts any semantic token; defaults to `inherit` so the
 * parent's text colour flows through (useful when nesting Typography
 * inside a coloured surface like an accent badge).
 *
 * @example Section heading
 * ```tsx
 * <Typography variant="h2">Vessel performance</Typography>
 * ```
 *
 * @example Styled as h1 but rendered as div (for SEO-neutral cards)
 * ```tsx
 * <Typography variant="h1" as="div">Card title</Typography>
 * ```
 *
 * @example Error message
 * ```tsx
 * <Typography variant="caption" color="status-error">{errorText}</Typography>
 * ```
 */
export default function Typography({
    variant = 'body',
    as,
    color = 'inherit',
    weight,
    align,
    truncate,
    muted,
    className = '',
    style,
    children,
}: TypographyProps) {
    const Element = (as ?? DEFAULT_ELEMENT[variant]) as React.ElementType
    return (
        <Element
            className={cx(
                VARIANT_CLASS[variant],
                COLOR_CLASS[color],
                weight ? WEIGHT_CLASS[weight] : '',
                align  ? ALIGN_CLASS[align]   : '',
                truncate ? 'truncate' : '',
                muted    ? 'opacity-60' : '',
                className,
            )}
            style={style}
        >
            {children}
        </Element>
    )
}
