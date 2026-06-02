import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Stepper, { type StepperStep, type StepperActiveStatus } from './Stepper'
import Button from '../inputs/Button'

const meta: Meta<typeof Stepper> = {
    title: 'Data Display/Stepper',
    component: Stepper,
    parameters: { layout: 'padded' },
    argTypes: {
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        status: { control: 'inline-radio', options: ['active', 'loading', 'error'] },
        size: { control: 'inline-radio', options: ['sm', 'md'] },
        current: { control: { type: 'number', min: 0, max: 3 } },
        responsive: { control: 'boolean' },
    },
}
export default meta
type Story = StoryObj<typeof Stepper>

const steps: StepperStep[] = [
    { key: 'cart', title: 'Cart', description: '3 items' },
    { key: 'address', title: 'Address', description: 'Shipping details' },
    { key: 'payment', title: 'Payment', description: 'Card or invoice' },
    { key: 'done', title: 'Confirmation' },
]

export const Horizontal: Story = {
    args: { steps, current: 1, status: 'active', orientation: 'horizontal', size: 'md' },
    render: (args) => <div style={{ maxWidth: 640 }}><Stepper {...args} /></div>,
}

export const Vertical: Story = {
    args: { steps, current: 2, status: 'active', orientation: 'vertical' },
    render: (args) => <div style={{ maxWidth: 360 }}><Stepper {...args} /></div>,
}

export const AsyncLoading: Story = {
    name: 'Async (loading active step)',
    args: { steps, current: 2, status: 'loading' },
    render: (args) => <div style={{ maxWidth: 640 }}><Stepper {...args} /></div>,
}

export const ErrorState: Story = {
    args: { steps, current: 2, status: 'error' },
    render: (args) => <div style={{ maxWidth: 640 }}><Stepper {...args} /></div>,
}

export const Interactive: Story = {
    name: 'Interactive (async advance)',
    render: () => {
        const [current, setCurrent] = useState(0)
        const [status, setStatus] = useState<StepperActiveStatus>('active')
        const next = async () => {
            if (current >= steps.length - 1) return
            setStatus('loading')
            await new Promise((r) => setTimeout(r, 1000))
            setStatus('active')
            setCurrent((c) => c + 1)
        }
        return (
            <div style={{ maxWidth: 640 }} className="flex flex-col gap-6">
                <Stepper steps={steps} current={current} status={status} onStepClick={setCurrent} />
                <div className="flex gap-2">
                    <Button content="Back" variant="secondary" size="sm" disabled={current === 0 || status === 'loading'} onClick={() => setCurrent((c) => Math.max(0, c - 1))} />
                    <Button content={current >= steps.length - 1 ? 'Done' : 'Continue'} size="sm" loading={status === 'loading'} disabled={current >= steps.length - 1} onClick={next} />
                </div>
            </div>
        )
    },
}
