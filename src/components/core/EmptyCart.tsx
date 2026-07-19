import React from 'react'
import { cx } from '../../utils/cx'

export interface EmptyCartProps {
    /**
     * Illustration shown above the text. Pass your own node to fully replace
     * the default line-art cart. Set to `null` to hide it.
     */
    illustration?: React.ReactNode
    /** Headline. Default `'Your cart is empty'`. */
    title?: React.ReactNode
    /** Secondary line under the title. */
    description?: React.ReactNode
    /** Optional call-to-action (e.g. a "Browse products" button). */
    action?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

/**
 * Default empty-cart illustration: a soft, accent-tinted line-art cart on a
 * radial glow. Tints itself from the live theme tokens (`--color-accent`,
 * `--color-border-strong`) so it adapts to light / dark and any brand override.
 */
function DefaultIllustration() {
    return (
        <svg width="112" height="112" viewBox="0 0 112 112" fill="none" aria-hidden="true">
            <defs>
                <radialGradient id="oui-empty-cart-glow" cx="50%" cy="42%" r="55%">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Glow halo */}
            <circle cx="56" cy="50" r="48" fill="url(#oui-empty-cart-glow)" />

            {/* Cart body, line art */}
            <g
                stroke="var(--color-border-strong)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            >
                <path d="M26 32h8l6 36h36l7-26H40" />
                <circle cx="46" cy="80" r="5" fill="var(--color-surface)" />
                <circle cx="74" cy="80" r="5" fill="var(--color-surface)" />
            </g>

            {/* Accent "empty" sparkle dashes above the cart */}
            <g stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.55">
                <path d="M58 20v8" />
                <path d="M72 24l-5 6" />
                <path d="M46 24l5 6" />
            </g>
        </svg>
    )
}

/**
 * The empty state for a shopping cart, a configurable illustration with a
 * title, optional description, and an optional call-to-action.
 *
 * Pass a custom `illustration` to match your brand, or override `title` /
 * `description` / `action` for the messaging.
 *
 * @example
 * <EmptyCart
 *   title="Nothing here yet"
 *   description="Browse the catalog to add items."
 *   action={<Button content="Browse products" onClick={goShop} />}
 * />
 *
 * @example
 * // Drop it straight into the Cart panel's empty slot
 * <Cart items={[]} emptyState={<EmptyCart illustration={<MyArt />} />} />
 */
export default function EmptyCart({
    illustration,
    title = 'Your cart is empty',
    description,
    action,
    className = '',
    style,
}: EmptyCartProps) {
    const art = illustration === undefined ? <DefaultIllustration /> : illustration

    return (
        <div
            className={cx('flex flex-col items-center justify-center px-6 py-10 text-center', className)}
            style={style}
        >
            {art && <div className="mb-4">{art}</div>}
            <div className="text-sm font-medium text-foreground">{title}</div>
            {description && (
                <div className="mt-1 max-w-[40ch] text-xs leading-snug text-foreground-muted">{description}</div>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
