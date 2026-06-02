import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PricingPlans, { type PricingPlan } from './PricingPlans'

const meta: Meta<typeof PricingPlans> = {
    title: 'Marketing/PricingPlans',
    component: PricingPlans,
    parameters: { layout: 'fullscreen' },
    decorators: [(Story) => <div className="mx-auto max-w-5xl p-8"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof PricingPlans>

const plans: PricingPlan[] = [
    { name: 'Starter', price: '$0', period: '/mo', description: 'For a single vessel.', features: ['1 vessel', 'Performance dashboard', 'Email support'], cta: { label: 'Start free' } },
    { name: 'Pro', price: '$49', period: '/mo', description: 'For growing fleets.', highlighted: true, badge: 'Most popular', features: ['Unlimited vessels', 'Compliance suite', 'Voyage analytics', 'Priority support'], cta: { label: 'Go Pro' } },
    { name: 'Enterprise', price: 'Custom', description: 'For global operators.', features: ['SSO & RBAC', 'Dedicated success manager', 'Custom integrations', 'SLA'], cta: { label: 'Contact sales' } },
]

export const Default: Story = {
    args: { eyebrow: 'Pricing', title: 'Plans that scale with your fleet', description: 'Start free, upgrade when you’re ready. No hidden fees.', plans },
}

export const TwoTiers: Story = {
    args: { title: 'Pick a plan', plans: [plans[0], plans[1]] },
}
