import React from 'react'
import Badge, { type BadgeTone } from './Badge'
import IconButton from './IconButton'
import { useCart } from './CartProvider'

export interface CartButtonProps {
    /** Click handler — typically opens the cart drawer / navigates to checkout. */
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    /** Icon-button style. Default `'bordered'`. */
    variant?: 'primary' | 'bordered'
    /** Badge colour. Default `'accent'`. */
    badgeTone?: BadgeTone
    /** Cap the badge number (e.g. `9+`). Default `99`. */
    max?: number
    /** Accessible label. Default `'Cart'` (with the live count appended). */
    title?: string
    /** Override the cart glyph. */
    icon?: React.ReactNode
    className?: string
}

const CartIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
)

/**
 * A cart trigger for the app TopBar: an {@link IconButton} with a live count
 * {@link Badge} overlaid on its top-right corner. Reads the count straight from
 * the {@link useCart} store, so it must be rendered inside a `<CartProvider>`.
 *
 * @example
 * <TopBar actions={<CartButton onClick={() => setCartOpen(true)} />} />
 */
export default function CartButton({
    onClick,
    variant = 'bordered',
    badgeTone = 'accent',
    max = 99,
    title = 'Cart',
    icon = CartIcon,
    className = '',
}: CartButtonProps) {
    const { getItemCount } = useCart()
    const count = getItemCount()

    return (
        <Badge count={count} max={max} tone={badgeTone} className={className}>
            <IconButton
                type={variant}
                icon={icon}
                onClick={onClick}
                title={count > 0 ? `${title} (${count})` : title}
            />
        </Badge>
    )
}
