import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import FadingBase from './FadingBase'
import Button from '../inputs/Button'

const meta: Meta<typeof FadingBase> = {
    title: 'Layout/FadingBase',
    component: FadingBase,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof FadingBase>

export const Toggle: Story = {
    name: 'Mount / unmount with fade',
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(true)
            return (
                <div className="space-y-4">
                    <Button content={open ? 'Hide' : 'Show'} onClick={() => setOpen((o) => !o)} />
                    <FadingBase isMounted={open}>
                        <p className="text-sm text-foreground">
                            This content fades in / out over 300 ms via a pure CSS opacity transition.
                            The component unmounts only after the fade-out completes.
                        </p>
                    </FadingBase>
                </div>
            )
        }
        return <Demo />
    },
}

export const Playground: Story = {
    args: { isMounted: true },
    argTypes: { isMounted: { control: 'boolean' } },
    render: (args) => (
        <FadingBase isMounted={args.isMounted}>
            <div className="rounded-lg border border-border bg-surface p-6 text-foreground">Toggle <code>isMounted</code> to fade me in and out.</div>
        </FadingBase>
    ),
}
