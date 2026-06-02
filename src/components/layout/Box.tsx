import React from 'react'
import { cx } from '../../utils/cx'

// ── Token scales ───────────────────────────────────────────────────────────

export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const SPACING_MAP: Record<Spacing, string> = {
    'none': '0',
    'xs':   '1',
    'sm':   '2',
    'md':   '4',
    'lg':   '6',
    'xl':   '8',
    '2xl':  '12',
}

const padding = (s?: Spacing, axis: 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl' = 'p') =>
    s == null ? '' : `${axis}-${SPACING_MAP[s]}`
const margin = (s?: Spacing, axis: 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml' = 'm') =>
    s == null ? '' : `${axis}-${SPACING_MAP[s]}`

export type BoxBackground =
    | 'none' | 'background' | 'surface' | 'surface-raised' | 'accent'
export type BoxBorder = 'none' | 'border' | 'border-strong' | 'accent' | 'status-error'
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type BoxShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl'

const BG_MAP: Record<BoxBackground, string> = {
    'none':            '',
    'background':      'bg-background',
    'surface':         'bg-surface',
    'surface-raised':  'bg-surface-raised',
    'accent':          'bg-accent text-accent-fg',
}
const BORDER_MAP: Record<BoxBorder, string> = {
    'none':           '',
    'border':         'border border-border',
    'border-strong':  'border border-border-strong',
    'accent':         'border border-accent',
    'status-error':   'border border-status-error',
}
const RADIUS_MAP: Record<BoxRadius, string> = {
    'none': 'rounded-none',
    'sm':   'rounded-sm',
    'md':   'rounded-md',
    'lg':   'rounded-lg',
    'xl':   'rounded-xl',
    '2xl':  'rounded-2xl',
    'full': 'rounded-full',
}
const SHADOW_MAP: Record<BoxShadow, string> = {
    'none': '',
    'sm':   'shadow-sm',
    'md':   'shadow-md',
    'lg':   'shadow-lg',
    'xl':   'shadow-xl',
}

// ── Box ────────────────────────────────────────────────────────────────────

export interface BoxProps {
    as?: keyof React.JSX.IntrinsicElements
    /** Padding shorthand — applies to all sides. */
    p?: Spacing
    /** Horizontal padding (left + right). */
    px?: Spacing
    /** Vertical padding (top + bottom). */
    py?: Spacing
    pt?: Spacing
    pr?: Spacing
    pb?: Spacing
    pl?: Spacing
    /** Margin shorthand. */
    m?:  Spacing
    mx?: Spacing
    my?: Spacing
    mt?: Spacing
    mr?: Spacing
    mb?: Spacing
    ml?: Spacing
    background?: BoxBackground
    border?: BoxBorder
    radius?: BoxRadius
    shadow?: BoxShadow
    /** Width via Tailwind class or CSS value. */
    width?: string | number
    /** Height via Tailwind class or CSS value. */
    height?: string | number
    /** Click handler — accepts any element-typed handler. */
    onClick?: React.MouseEventHandler<HTMLElement>
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
}

/**
 * A polymorphic layout primitive — a `<div>` (by default) styled via prop
 * shortcuts to the design system's tokenised spacing, surface, border,
 * radius, and shadow scales. Use it when you'd otherwise reach for a
 * className-only `<div>` with `p-4 bg-surface border border-border rounded-lg`.
 *
 * The token shortcuts map straight to Tailwind classes under the hood, so
 * Tailwind's content scanner sees the classes and JIT-emits the CSS. There
 * is no runtime style cost beyond the className concatenation.
 *
 * Use `as` when the semantic element should differ (`<section>`, `<article>`).
 *
 * @example Padded card surface
 * ```tsx
 * <Box p="lg" background="surface" border="border" radius="lg" shadow="sm">
 *   <Typography variant="h3">Card title</Typography>
 * </Box>
 * ```
 *
 * @example Semantic section
 * ```tsx
 * <Box as="section" px="md" py="lg" background="background">
 *   <PageContent />
 * </Box>
 * ```
 */
export default function Box({
    as,
    p, px, py, pt, pr, pb, pl,
    m, mx, my, mt, mr, mb, ml,
    background = 'none',
    border = 'none',
    radius,
    shadow = 'none',
    width,
    height,
    onClick,
    className = '',
    style,
    children,
}: BoxProps) {
    const Element = (as ?? 'div') as React.ElementType
    return (
        <Element
            onClick={onClick}
            className={cx(
                padding(p, 'p'), padding(px, 'px'), padding(py, 'py'),
                padding(pt, 'pt'), padding(pr, 'pr'), padding(pb, 'pb'), padding(pl, 'pl'),
                margin(m, 'm'), margin(mx, 'mx'), margin(my, 'my'),
                margin(mt, 'mt'), margin(mr, 'mr'), margin(mb, 'mb'), margin(ml, 'ml'),
                BG_MAP[background],
                BORDER_MAP[border],
                radius ? RADIUS_MAP[radius] : '',
                SHADOW_MAP[shadow],
                className,
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
            }}
        >
            {children}
        </Element>
    )
}
