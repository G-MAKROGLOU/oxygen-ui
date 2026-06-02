import React from 'react'
import Cart, { type CartSummaryRow } from './Cart'
import CreditCardForm, { type CreditCardValue } from '../forms/CreditCardForm'
import { useCart } from './CartProvider'
import { cx } from '../../utils/cx'

export interface CheckoutProps {
    /** Page heading. Default `'Checkout'`. */
    title?: React.ReactNode
    /** Extra summary rows (shipping, tax, discount) added to the cart subtotal. */
    summaryRows?: CartSummaryRow[]
    /** Price formatter. Default `'$' + value.toFixed(2)`. */
    formatPrice?: (value: number) => string
    /** Heading above the payment form. Default `'Payment'`. */
    paymentTitle?: React.ReactNode
    /**
     * Pay button label. Defaults to `Pay <total>`. The button is always
     * disabled while the cart is empty.
     */
    submitLabel?: React.ReactNode
    /** Fired with the validated card once the form passes and the cart is non-empty. */
    onPaid?: (card: CreditCardValue) => void | Promise<void>
    className?: string
}

const defaultFormat = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(2)}`

/**
 * A complete two-column checkout page: the {@link Cart} on the left and the
 * {@link CreditCardForm} on the right. Reads live items from the
 * {@link useCart} store, so it must be rendered inside a `<CartProvider>`.
 *
 * The pay button is disabled whenever the cart is empty (via the form's
 * `submitDisabled`) — the card fields stay editable, but payment can't be
 * submitted with nothing to buy. Stacks to a single column below `lg`.
 *
 * @example
 * <CartProvider initialItems={items}>
 *   <Checkout summaryRows={[{ label: 'Shipping', value: 9.5 }]} onPaid={pay} />
 * </CartProvider>
 */
export default function Checkout({
    title = 'Checkout',
    summaryRows = [],
    formatPrice = defaultFormat,
    paymentTitle = 'Payment',
    submitLabel,
    onPaid,
    className = '',
}: CheckoutProps) {
    const { items, updateQuantity, removeFromCart } = useCart()

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    const total = subtotal + summaryRows.reduce((sum, r) => sum + r.value, 0)
    const isEmpty = items.length === 0

    return (
        <div className={cx('mx-auto w-full max-w-5xl', className)}>
            {title && <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Cart (left) ── */}
                <section aria-label="Order summary">
                    <Cart
                        items={items}
                        onQuantityChange={updateQuantity}
                        onRemove={removeFromCart}
                        summaryRows={summaryRows}
                        formatPrice={formatPrice}
                    />
                </section>

                {/* ── Payment (right) ── */}
                <section aria-label="Payment details" className="rounded-xl border border-border bg-surface p-5">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                        {paymentTitle}
                    </h2>
                    <CreditCardForm
                        onSubmit={onPaid}
                        submitDisabled={isEmpty}
                        submitLabel={submitLabel ?? `Pay ${formatPrice(total)}`}
                    />
                    {isEmpty && (
                        <p className="mt-3 text-xs text-foreground-muted">
                            Add an item to your cart to enable payment.
                        </p>
                    )}
                </section>
            </div>
        </div>
    )
}
