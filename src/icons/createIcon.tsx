import React, { forwardRef } from 'react'

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
    /** Width + height in pixels (or any CSS length string). Default `24`. */
    size?: number | string
    /**
     * Accessible label. When set, the icon is exposed as `role="img"` with this
     * name; when omitted, it's `aria-hidden` (decorative) — the default, since
     * most icons sit beside a text label.
     */
    title?: string
    /** Stroke width for outline icons. Ignored by solid icons. Default `1.5`. */
    strokeWidth?: number
}

export interface CreateIconOptions {
    /** SVG viewBox. Default `'0 0 24 24'`. */
    viewBox?: string
    /** Render filled (fill: currentColor) instead of stroked. Default `false`. */
    solid?: boolean
}

/**
 * Build an icon component that obeys the oxygen-ui icon contract:
 *
 * - colours itself with `currentColor` (set text colour on a parent, e.g.
 *   `className="text-accent"`, and the icon follows),
 * - sizes via the `size` prop (px), defaulting to 24,
 * - is decorative (`aria-hidden`) unless you pass a `title`,
 * - forwards a ref and spreads any extra SVG props (`className`, `style`,
 *   `onClick`, …).
 *
 * Use it to extend the pack with your own icons so they match the built-ins:
 *
 * @example
 * const Anchor = createIcon('Anchor', <path d="M12 21V8m0 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 4a7 7 0 0 0 14 0M3 11h4m10 0h4" />)
 * <Anchor size={32} className="text-accent" title="Anchor" />
 */
export function createIcon(displayName: string, content: React.ReactNode, options: CreateIconOptions = {}) {
    const { viewBox = '0 0 24 24', solid = false } = options

    const Component = forwardRef<SVGSVGElement, IconProps>(function Icon(
        { size = 24, title, strokeWidth = 1.5, ...rest },
        ref,
    ) {
        const a11y = title
            ? { role: 'img' as const, 'aria-label': title }
            : { 'aria-hidden': true as const, focusable: false }

        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox={viewBox}
                fill={solid ? 'currentColor' : 'none'}
                stroke={solid ? undefined : 'currentColor'}
                strokeWidth={solid ? undefined : strokeWidth}
                strokeLinecap={solid ? undefined : 'round'}
                strokeLinejoin={solid ? undefined : 'round'}
                {...a11y}
                {...rest}
            >
                {title ? <title>{title}</title> : null}
                {content}
            </svg>
        )
    })

    Component.displayName = displayName
    return Component
}

export type IconComponent = ReturnType<typeof createIcon>
