import React from 'react'
import EmptyCart from './EmptyCart'
import { cx } from '../../utils/cx'

export interface CartLineItem {
    id: string | number
    /** Product name. */
    name: React.ReactNode
    /** Unit price. */
    price: number
    /** Quantity in the cart. */
    quantity: number
    /** Optional thumbnail URL. */
    image?: string
    /** Optional secondary line (variant, SKU). */
    meta?: React.ReactNode
    /** Per-line quantity ceiling. */
    max?: number
}

export interface CartSummaryRow {
    label: React.ReactNode
    /** Signed amount — negative for discounts. */
    value: number
    /** Render in muted/normal style instead of emphasised. */
    muted?: boolean
}

export interface CartProps {
    /** Line items. */
    items: CartLineItem[]
    /** Fires when a line's stepper changes (clamped to 1..max). */
    onQuantityChange?: (id: CartLineItem['id'], quantity: number) => void
    /** Fires when a line's remove button is pressed. */
    onRemove?: (id: CartLineItem['id']) => void
    /** Extra summary rows (shipping, tax, discount) added to the subtotal for the total. */
    summaryRows?: CartSummaryRow[]
    /** Price formatter. Default `'$' + value.toFixed(2)`. */
    formatPrice?: (value: number) => string
    /** Checkout button label. Default `'Checkout'`. */
    checkoutLabel?: React.ReactNode
    /** Checkout handler. Omit to hide the button. */
    onCheckout?: () => void
    /** Shown when there are no items. */
    emptyState?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

const defaultFormat = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(2)}`

const Stepper = ({
    quantity,
    max,
    onChange,
}: {
    quantity: number
    max?: number
    onChange?: (q: number) => void
}) => {
    const btn = 'flex h-7 w-7 items-center justify-center text-foreground-secondary hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset transition-colors'
    return (
        <div className="inline-flex items-center rounded-md border border-border overflow-hidden">
            <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => onChange?.(quantity - 1)} className={btn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5"><path strokeLinecap="round" d="M5 12h14" /></svg>
            </button>
            <span className="w-8 text-center text-sm tabular-nums text-foreground select-none">{quantity}</span>
            <button type="button" aria-label="Increase quantity" disabled={max != null && quantity >= max} onClick={() => onChange?.(quantity + 1)} className={btn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
            </button>
        </div>
    )
}

/**
 * A shopping-cart panel: line items with thumbnail, quantity stepper, and
 * remove, plus a summary that totals the subtotal with any extra rows
 * (shipping, tax, discount) and an optional checkout button.
 *
 * Stateless and controlled — you own the items array and react to
 * `onQuantityChange` / `onRemove`.
 *
 * @example
 * ```tsx
 * <Cart
 *   items={items}
 *   onQuantityChange={(id, q) => setQty(id, q)}
 *   onRemove={removeItem}
 *   summaryRows={[{ label: 'Shipping', value: 9.5 }]}
 *   onCheckout={checkout}
 * />
 * ```
 */
export default function Cart({
    items,
    onQuantityChange,
    onRemove,
    summaryRows = [],
    formatPrice = defaultFormat,
    checkoutLabel = 'Checkout',
    onCheckout,
    emptyState,
    className = '',
    style,
}: CartProps) {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    const total = subtotal + summaryRows.reduce((sum, r) => sum + r.value, 0)

    return (
        <div className={cx('flex flex-col rounded-xl border border-border bg-surface', className)} style={style}>
            {items.length === 0 ? (
                emptyState ?? <EmptyCart />
            ) : (
                <ul className="divide-y divide-border">
                    {items.map((it) => (
                        <li key={it.id} className="flex items-center gap-3 p-3">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-surface-raised">
                                {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-foreground">{it.name}</div>
                                {it.meta && <div className="truncate text-xs text-foreground-muted mt-0.5">{it.meta}</div>}
                                <div className="mt-1.5 flex items-center gap-3">
                                    <Stepper quantity={it.quantity} max={it.max} onChange={(q) => onQuantityChange?.(it.id, Math.max(1, q))} />
                                    {onRemove && (
                                        <button
                                            type="button"
                                            onClick={() => onRemove(it.id)}
                                            className="text-xs text-foreground-muted hover:text-status-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-sm font-semibold text-foreground tabular-nums">
                                {formatPrice(it.price * it.quantity)}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {items.length > 0 && (
                <div className="border-t border-border p-4">
                    <dl className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <dt className="text-foreground-secondary">Subtotal</dt>
                            <dd className="tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
                        </div>
                        {summaryRows.map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <dt className={r.muted ? 'text-foreground-muted' : 'text-foreground-secondary'}>{r.label}</dt>
                                <dd className={`tabular-nums ${r.value < 0 ? 'text-status-success' : 'text-foreground'}`}>{formatPrice(r.value)}</dd>
                            </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-border pt-2 mt-1 text-base font-semibold">
                            <dt className="text-foreground">Total</dt>
                            <dd className="tabular-nums text-foreground">{formatPrice(total)}</dd>
                        </div>
                    </dl>

                    {onCheckout && (
                        <button
                            type="button"
                            onClick={onCheckout}
                            className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                            {checkoutLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
