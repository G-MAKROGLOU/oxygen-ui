import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import AppShell from './AppShell'
import TopBar from './TopBar'
import Drawer from './Drawer'
import Cart from './Cart'
import CartButton from './CartButton'
import Button from '../inputs/Button'
import { CartProvider, useCart, type CartItemInput } from './CartProvider'

const meta: Meta = {
    title: 'E-Commerce/Cart in AppShell',
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

const PRODUCTS: CartItemInput[] = [
    { id: 1, name: 'Marine radar unit', meta: 'X-band · 4 ft', price: 1290, max: 5 },
    { id: 2, name: 'AIS transponder', meta: 'Class B', price: 449.99 },
    { id: 3, name: 'Cable harness', meta: '10 m', price: 39.5 },
    { id: 4, name: 'GPS antenna', meta: 'Active · SMA', price: 89 },
]

const fmt = (v: number) => `$${v.toFixed(2)}`

/** Product catalogue — every "Add" button drives the shared cart store. */
function Catalogue() {
    const { addToCart, isInCart } = useCart()
    return (
        <div>
            <h1 className="mb-1 text-xl font-semibold tracking-tight text-foreground">Marine equipment</h1>
            <p className="mb-6 text-sm text-foreground-muted">Add items — the TopBar badge and cart drawer stay in sync.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCTS.map((p) => (
                    <div key={p.id} className="flex flex-col rounded-xl border border-border bg-surface p-4">
                        <div className="mb-3 aspect-[4/3] rounded-lg bg-surface-raised" />
                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-foreground-muted">{p.meta}</div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(p.price)}</span>
                            <Button
                                content={isInCart(p.id) ? 'Add more' : 'Add'}
                                size="sm"
                                variant={isInCart(p.id) ? 'secondary' : 'primary'}
                                onClick={() => addToCart(p)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** The shell: TopBar with the live CartButton, plus a Drawer holding the Cart. */
function Shop() {
    const [open, setOpen] = useState(false)
    const { items, updateQuantity, removeFromCart } = useCart()

    return (
        <>
            <AppShell
                topBar={
                    <TopBar
                        brand={<span className="text-sm font-semibold tracking-tight text-foreground">Chandlery</span>}
                        actions={<CartButton onClick={() => setOpen(true)} />}
                    />
                }
            >
                <Catalogue />
            </AppShell>

            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                placement="right"
                size="lg"
                hasFooter={false}
                title="Your cart"
            >
                <Cart
                    items={items}
                    onQuantityChange={updateQuantity}
                    onRemove={removeFromCart}
                    formatPrice={fmt}
                    summaryRows={[{ label: 'Shipping', value: items.length ? 24 : 0 }]}
                    onCheckout={() => alert('Proceeding to checkout')}
                    className="border-0"
                />
            </Drawer>
        </>
    )
}

export const Default: Story = {
    name: 'Cart in AppShell',
    render: () => (
        <CartProvider>
            <Shop />
        </CartProvider>
    ),
}
