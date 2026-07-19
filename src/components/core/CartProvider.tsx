import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartLineItem } from './Cart'

/** Shape accepted by `addToCart`, quantity is optional (defaults to 1). */
export type CartItemInput = Omit<CartLineItem, 'quantity'> & { quantity?: number }

export interface CartContextValue {
    /** Current line items. */
    items: CartLineItem[]
    /**
     * Add an item to the cart. If an item with the same `id` is already
     * present, its quantity is increased (clamped to the line's `max`).
     */
    addToCart: (item: CartItemInput, quantity?: number) => void
    /** Remove a line entirely by id. */
    removeFromCart: (id: CartLineItem['id']) => void
    /** Set an exact quantity for a line (clamped to `1..max`). */
    updateQuantity: (id: CartLineItem['id'], quantity: number) => void
    /** Empty the cart. */
    clearCart: () => void
    /** Whether a line with this id exists. */
    isInCart: (id: CartLineItem['id']) => boolean
    /** Total number of units across all lines (sum of quantities). */
    getItemCount: () => number
    /** Subtotal, sum of `price × quantity` across all lines. */
    getCartTotal: () => number
}

const CartContext = createContext<CartContextValue | null>(null)

const clampQty = (qty: number, max?: number) => {
    const lower = Math.max(1, Math.round(qty))
    return max != null ? Math.min(lower, max) : lower
}

export interface CartProviderProps {
    children: React.ReactNode
    /** Seed the cart with these lines. */
    initialItems?: CartLineItem[]
    /** Called whenever the items change (add / remove / quantity / clear). */
    onChange?: (items: CartLineItem[]) => void
}

/**
 * Provides a robust, app-wide cart API. Wrap any subtree and call
 * {@link useCart} from anywhere inside to add, remove, and total items -
 * the cart panel, a product grid, and a topbar badge all stay in sync off the
 * same store.
 *
 * The store is uncontrolled (owns its own state, seeded by `initialItems`);
 * subscribe to mutations via `onChange` to persist or sync externally.
 *
 * @example
 * <CartProvider>
 *   <App />
 * </CartProvider>
 *
 * // anywhere inside:
 * const { addToCart, getItemCount } = useCart()
 * addToCart({ id: 1, name: 'Radar unit', price: 1290 })
 */
export function CartProvider({ children, initialItems = [], onChange }: CartProviderProps) {
    const [items, setItems] = useState<CartLineItem[]>(initialItems)

    // Notify subscribers after the items settle for a render.
    useEffect(() => {
        onChange?.(items)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])

    const addToCart = useCallback((item: CartItemInput, quantity?: number) => {
        const addQty = quantity ?? item.quantity ?? 1
        setItems((prev) => {
            const existing = prev.find((it) => it.id === item.id)
            if (existing) {
                return prev.map((it) =>
                    it.id === item.id
                        ? { ...it, quantity: clampQty(it.quantity + addQty, it.max) }
                        : it,
                )
            }
            const { quantity: _omit, ...rest } = item
            return [...prev, { ...rest, quantity: clampQty(addQty, item.max) }]
        })
    }, [])

    const removeFromCart = useCallback((id: CartLineItem['id']) => {
        setItems((prev) => prev.filter((it) => it.id !== id))
    }, [])

    const updateQuantity = useCallback((id: CartLineItem['id'], quantity: number) => {
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, quantity: clampQty(quantity, it.max) } : it)),
        )
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const isInCart = useCallback((id: CartLineItem['id']) => items.some((it) => it.id === id), [items])

    const getItemCount = useCallback(() => items.reduce((sum, it) => sum + it.quantity, 0), [items])

    const getCartTotal = useCallback(
        () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
        [items],
    )

    const value = useMemo<CartContextValue>(
        () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, getItemCount, getCartTotal }),
        [items, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, getItemCount, getCartTotal],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * Read the enclosing {@link CartProvider}'s store. Throws if used outside a
 * `<CartProvider>`.
 *
 * @example
 * const { items, addToCart, removeFromCart, getCartTotal } = useCart()
 */
export function useCart(): CartContextValue {
    const ctx = useContext(CartContext)
    if (!ctx) {
        throw new Error('useCart must be used within a <CartProvider>.')
    }
    return ctx
}
