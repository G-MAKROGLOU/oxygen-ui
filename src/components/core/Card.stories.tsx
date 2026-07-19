import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Card from './Card'
import Button from '../inputs/Button'
import Badge from './Badge'

const meta: Meta<typeof Card> = {
    title: 'Data Display/Card',
    component: Card,
    parameters: { layout: 'centered' },
    decorators: [(Story) => <div style={{ width: 340 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Card>

// Args-driven Playground so the Controls panel has editable inputs (the curated
// stories below use composition and don't bind args).
export const Playground: Story = {
    args: { interactive: true, padding: 'md', flush: false },
    argTypes: {
        interactive: { control: 'boolean' },
        flush: { control: 'boolean' },
        padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    },
    render: (args) => (
        <Card {...args} onClick={() => {}}>
            <Card.Header title="Aurora" subtitle="Bulk carrier · IMO 9381760" action={<Badge tone="success" variant="soft">At sea</Badge>} />
            <Card.Body>Off the North Sea, en route to Rotterdam. ETA in 14 hours.</Card.Body>
            <Card.Footer><Button content="Track" size="sm" /></Card.Footer>
        </Card>
    ),
}

export const Composed: Story = {
    render: () => (
        <Card>
            <Card.Media>
                <div className="h-36 bg-gradient-to-br from-accent/30 to-accent/5" />
            </Card.Media>
            <Card.Header
                title="Aurora"
                subtitle="Bulk carrier · IMO 9381760"
                action={<Badge tone="success" variant="soft">At sea</Badge>}
            />
            <Card.Body>Off the North Sea, en route to Rotterdam. ETA in 14 hours.</Card.Body>
            <Card.Footer>
                <Button content="Track" size="sm" />
                <Button content="Details" size="sm" variant="ghost" />
            </Card.Footer>
        </Card>
    ),
}

export const Interactive: Story = {
    render: () => (
        <Card interactive onClick={() => alert('opened')} padding="md">
            <div className="text-sm font-semibold text-foreground">Clickable card</div>
            <p className="mt-1 text-sm text-foreground-secondary">The whole surface is a button, hover to see the lift.</p>
        </Card>
    ),
}

export const Flat: Story = {
    render: () => (
        <Card flush padding="md">
            <div className="text-sm font-semibold text-foreground">Borderless</div>
            <p className="mt-1 text-sm text-foreground-secondary">No border or shadow, sits flush on its background.</p>
        </Card>
    ),
}
