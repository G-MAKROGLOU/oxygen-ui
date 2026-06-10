import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Box from './Box'
import Typography from '../core/Typography'

const meta: Meta<typeof Box> = {
    title: 'Layout/Box',
    component: Box,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Polymorphic `<div>` styled via tokenised props — padding, margin, background, border, radius, shadow. Use Box in place of a className-only `<div>` when you want spacing and surfacing spelled out via design-system tokens.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Box>

export const Surface: Story = {
    render: () => (
        <Box p="lg" background="surface" border="border" radius="lg" shadow="sm">
            <Typography variant="h3">Card title</Typography>
            <Typography variant="body" color="foreground-secondary" className="mt-2">
                Box wraps a div with padding, background, border, radius, and shadow tokens.
                No className authoring required at the call site.
            </Typography>
        </Box>
    ),
}

export const SpacingScale: Story = {
    render: () => (
        <div className="flex flex-col gap-2">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                    <code className="text-xs text-foreground-muted w-12">p="{s}"</code>
                    <Box p={s} background="surface-raised" radius="md">
                        <Typography variant="caption">Padding {s}</Typography>
                    </Box>
                </div>
            ))}
        </div>
    ),
}

export const PolymorphicAs: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Use `as` to change the underlying element while keeping the tokenised styling — e.g. render Box as `<section>` for landmark semantics.',
            },
        },
    },
    render: () => (
        <Box as="section" p="lg" background="surface" border="border" radius="lg">
            <Typography variant="overline" color="accent">Section</Typography>
            <Typography variant="h2" className="mt-1">Semantic landmark</Typography>
        </Box>
    ),
}

export const Playground: Story = {
    args: { p: 'lg', background: 'surface', border: 'border', radius: 'lg', shadow: 'sm' },
    argTypes: {
        p: { control: 'inline-radio', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
        background: { control: 'select', options: ['none', 'background', 'surface', 'surface-raised', 'accent'] },
        border: { control: 'select', options: ['none', 'border', 'border-strong', 'accent', 'status-error'] },
        radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] },
        shadow: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    },
    render: (args) => <Box {...args}><Typography>Box content — tweak padding, background, border, radius and shadow.</Typography></Box>,
}
