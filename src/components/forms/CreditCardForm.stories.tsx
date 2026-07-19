import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import CreditCardForm, { type CreditCardValue } from './CreditCardForm'

const meta: Meta<typeof CreditCardForm> = {
    title: 'Forms/CreditCardForm',
    component: CreditCardForm,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A single, unified credit-card form built on the oxygen-ui Form API. Owns all four fields and their cross-field rules, card number (brand detection + grouping + Luhn), expiry (MM/YY, real month, not past), CVV (brand-aware length), and cardholder name. `onSubmit(card)` fires only once everything validates; `onChange(card)` streams live updates. Shipped as one component on purpose: a CVV or expiry field is meaningless on its own.',
            },
        },
    },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        requireName: { control: 'boolean' },
        hideSubmit: { control: 'boolean' },
        submitLabel: { control: 'text' },
    },
}
export default meta
type Story = StoryObj<typeof CreditCardForm>

export const Default: Story = {
    render: (args) => {
        function Demo() {
            const [card, setCard] = useState<CreditCardValue | null>(null)
            return (
                <div className="w-96">
                    <CreditCardForm {...args} submitLabel="Pay $49.00" onSubmit={setCard} />
                    {card && (
                        <pre className="mt-4 overflow-auto rounded-lg border border-border bg-surface-raised p-3 text-xs text-foreground">
                            {JSON.stringify(card, null, 2)}
                        </pre>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}

export const LiveBrandPreview: Story = {
    name: 'Live brand + value preview',
    render: () => {
        function Demo() {
            const [live, setLive] = useState<CreditCardValue | null>(null)
            return (
                <div className="w-96">
                    <CreditCardForm onChange={setLive} onSubmit={() => undefined} />
                    <p className="mt-3 text-sm text-foreground-secondary">
                        Brand: <strong className="text-foreground">{live?.brand ?? '-'}</strong>
                        {'  ·  '}
                        Digits: <strong className="text-foreground">{live?.number.length ?? 0}</strong>
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                        Try 4242 4242 4242 4242 (Visa), 3782 822463 10005 (Amex), 5555 5555 5555 4444 (Mastercard).
                    </p>
                </div>
            )
        }
        return <Demo />
    },
}

export const Prefilled: Story = {
    render: () => (
        <div className="w-96">
            <CreditCardForm
                defaultValue={{ number: '4242424242424242', name: 'Jane Appleseed', expiry: '1230', cvv: '123' }}
                submitLabel="Save card"
                onSubmit={() => undefined}
            />
        </div>
    ),
}

export const Embedded: Story = {
    name: 'Embedded (no submit button)',
    render: () => (
        <div className="w-96">
            <CreditCardForm hideSubmit onSubmit={() => undefined} />
            <p className="mt-3 text-xs text-foreground-muted">
                With <code>hideSubmit</code>, drive submission from your own button / outer form.
            </p>
        </div>
    ),
}

export const Playground: Story = {
    args: { size: 'md', disabled: false, submitDisabled: false, requireName: true, hideSubmit: false, submitLabel: 'Pay $49.00' },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        submitDisabled: { control: 'boolean' },
        requireName: { control: 'boolean' },
        hideSubmit: { control: 'boolean' },
        submitLabel: { control: 'text' },
    },
    render: (args) => <div className="mx-auto max-w-sm"><CreditCardForm {...args} onSubmit={() => undefined} /></div>,
}
