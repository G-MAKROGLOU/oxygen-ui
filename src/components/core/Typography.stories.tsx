import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Typography from './Typography'

const meta: Meta<typeof Typography> = {
    title: 'Data Display/Typography',
    component: Typography,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Polymorphic text primitive with semantic variants. `variant` picks the visual scale (display / h1–h4 / subtitle / body / caption / overline / code); `as` overrides the rendered element when the semantic tag should differ from the default for that variant.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Typography>

export const AllVariants: Story = {
    render: () => (
        <div className="space-y-3">
            <Typography variant="display">Display — hero headline</Typography>
            <Typography variant="h1">H1 — page title</Typography>
            <Typography variant="h2">H2 — section heading</Typography>
            <Typography variant="h3">H3 — subsection</Typography>
            <Typography variant="h4">H4 — minor heading</Typography>
            <Typography variant="subtitle">Subtitle — emphasised lead text</Typography>
            <Typography variant="body" color="foreground">Body — the default paragraph style. The quick brown fox jumps over the lazy dog.</Typography>
            <Typography variant="caption" color="foreground-secondary">Caption — small label or hint text</Typography>
            <Typography variant="overline" color="accent">Overline — eyebrow text</Typography>
            <Typography variant="code">Inline code — npm install @geomak/ui</Typography>
        </div>
    ),
}

export const Colors: Story = {
    render: () => (
        <div className="space-y-2">
            <Typography color="foreground">foreground (default)</Typography>
            <Typography color="foreground-secondary">foreground-secondary</Typography>
            <Typography color="foreground-muted">foreground-muted</Typography>
            <Typography color="accent">accent</Typography>
            <Typography color="status-success">status-success</Typography>
            <Typography color="status-warning">status-warning</Typography>
            <Typography color="status-error">status-error</Typography>
            <Typography color="status-info">status-info</Typography>
        </div>
    ),
}

export const Truncate: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`truncate` adds `text-overflow: ellipsis` and forces single-line. Pair with a fixed-width parent to see the effect.',
            },
        },
    },
    render: () => (
        <div style={{ width: 240 }}>
            <Typography variant="body" truncate>
                A very long string that will not fit inside the 240 px parent and will be truncated with an ellipsis.
            </Typography>
        </div>
    ),
}

export const PolymorphicAs: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Use `as` when the visual style should not match the semantic element (e.g. card titles styled as h1 but rendered as `<div>` for SEO clarity).',
            },
        },
    },
    render: () => (
        <Typography variant="h1" as="div">
            Styled as h1 — but rendered as a div (inspect to verify)
        </Typography>
    ),
}

export const Playground: Story = {
    args: { children: 'The quick brown fox jumps over the lazy dog', variant: 'h3', color: 'foreground', weight: 'semibold', align: 'left', truncate: false, muted: false },
    argTypes: {
        children: { control: 'text' },
        variant: { control: 'select', options: ['display', 'h1', 'h2', 'h3', 'h4', 'subtitle', 'body', 'caption', 'overline', 'code'] },
        color: { control: 'select', options: ['foreground', 'foreground-secondary', 'foreground-muted', 'accent', 'status-error', 'status-warning', 'status-success', 'status-info', 'inherit'] },
        weight: { control: 'inline-radio', options: ['normal', 'medium', 'semibold', 'bold'] },
        align: { control: 'inline-radio', options: ['left', 'center', 'right', 'justify'] },
        truncate: { control: 'boolean' },
        muted: { control: 'boolean' },
    },
    render: (args) => <Typography {...args} />,
}
