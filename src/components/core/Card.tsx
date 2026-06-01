import React from 'react'

type Pad = 'none' | 'sm' | 'md' | 'lg'
const PAD: Record<Pad, string> = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' }

// ── Root ────────────────────────────────────────────────────────────────────────

export interface CardProps {
    children: React.ReactNode
    /**
     * Make the whole card a single interactive surface: hover lift, pointer
     * cursor, focus ring, and (with `onClick`) button semantics + Enter/Space
     * activation.
     */
    interactive?: boolean
    /** Click handler. With `interactive`, the card becomes keyboard-activatable. */
    onClick?: React.MouseEventHandler
    /**
     * Padding on the root. Leave `'none'` (default) when composing with
     * `Card.Header` / `Card.Body` / `Card.Footer` (they bring their own); set a
     * value for a quick flat card.
     */
    padding?: Pad
    /** Drop the border + shadow for a flat, borderless surface. */
    flush?: boolean
    className?: string
    style?: React.CSSProperties
}

/**
 * A surface container with optional header / media / body / footer sections.
 *
 * @example Composed
 * ```tsx
 * <Card>
 *   <Card.Media><img src={cover} alt="" /></Card.Media>
 *   <Card.Header title="Aurora" subtitle="Bulk carrier" action={<IconButton … />} />
 *   <Card.Body>Last seen off the North Sea, en route to Rotterdam.</Card.Body>
 *   <Card.Footer><Button content="Track" /></Card.Footer>
 * </Card>
 * ```
 *
 * @example Quick flat card
 * ```tsx
 * <Card padding="md" interactive onClick={open}>Click me</Card>
 * ```
 */
function Card({ children, interactive, onClick, padding = 'none', flush, className = '', style }: CardProps) {
    const base = [
        'rounded-xl overflow-hidden bg-surface',
        flush ? '' : 'border border-border shadow-sm',
        PAD[padding],
        interactive
            ? 'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ' +
              'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            : '',
        className,
    ].filter(Boolean).join(' ')

    if (interactive && onClick) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick(e as unknown as React.MouseEvent)
                    }
                }}
                className={base}
                style={style}
            >
                {children}
            </div>
        )
    }

    return (
        <div onClick={onClick} className={base} style={style}>
            {children}
        </div>
    )
}

// ── Media (full-bleed image / visual slot) ──────────────────────────────────────

export interface CardMediaProps {
    children: React.ReactNode
    className?: string
}
function CardMedia({ children, className = '' }: CardMediaProps) {
    return <div className={['[&>img]:block [&>img]:w-full [&>img]:object-cover', className].filter(Boolean).join(' ')}>{children}</div>
}

// ── Header (title + subtitle + trailing action) ─────────────────────────────────

export interface CardHeaderProps {
    title?: React.ReactNode
    subtitle?: React.ReactNode
    /** Trailing slot — actions, menu, badge. */
    action?: React.ReactNode
    /** Leading slot — avatar / icon. */
    avatar?: React.ReactNode
    children?: React.ReactNode
    className?: string
}
function CardHeader({ title, subtitle, action, avatar, children, className = '' }: CardHeaderProps) {
    return (
        <div className={['flex items-start gap-3 px-5 pt-5', children ? 'pb-0' : 'pb-3', className].filter(Boolean).join(' ')}>
            {avatar && <div className="flex-shrink-0">{avatar}</div>}
            <div className="min-w-0 flex-1">
                {title && <div className="text-sm font-semibold text-foreground leading-snug">{title}</div>}
                {subtitle && <div className="text-xs text-foreground-muted leading-snug mt-0.5">{subtitle}</div>}
                {children}
            </div>
            {action && <div className="flex-shrink-0 -mt-1 -mr-1">{action}</div>}
        </div>
    )
}

// ── Body ────────────────────────────────────────────────────────────────────────

export interface CardBodyProps {
    children: React.ReactNode
    className?: string
}
function CardBody({ children, className = '' }: CardBodyProps) {
    return <div className={['px-5 py-4 text-sm text-foreground-secondary leading-relaxed', className].filter(Boolean).join(' ')}>{children}</div>
}

// ── Footer ──────────────────────────────────────────────────────────────────────

export interface CardFooterProps {
    children: React.ReactNode
    /** Drop the top divider. */
    noDivider?: boolean
    className?: string
}
function CardFooter({ children, noDivider, className = '' }: CardFooterProps) {
    return (
        <div className={['flex items-center gap-2 px-5 py-3', noDivider ? '' : 'border-t border-border', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    )
}

// ── Compound export ─────────────────────────────────────────────────────────────

Card.Media = CardMedia
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
