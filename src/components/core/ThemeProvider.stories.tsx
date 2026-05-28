import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ThemeProvider from './ThemeProvider'
import Button from '../inputs/Button'

const meta: Meta<typeof ThemeProvider> = {
    title: 'Themes/ThemeProvider',
    component: ThemeProvider,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Scoped theme overrides. The CSS vars set in `theme` (and `darkTheme`) apply only to descendants of this provider — multiple ThemeProviders can coexist on the same page, each with its own palette / radii / motion / typography.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof ThemeProvider>

export const ScopedAccent: Story = {
    name: 'Scoped accent override',
    render: () => (
        <div className="flex gap-6">
            <ThemeProvider theme={{ colors: { accent: '#10b981', 'accent-hover': '#059669' } }}>
                <div className="p-4 rounded-lg bg-surface border border-border">
                    <p className="text-sm mb-2 text-foreground-secondary">Green scope</p>
                    <Button content="Save" />
                </div>
            </ThemeProvider>
            <ThemeProvider theme={{ colors: { accent: '#f59e0b', 'accent-hover': '#d97706' } }}>
                <div className="p-4 rounded-lg bg-surface border border-border">
                    <p className="text-sm mb-2 text-foreground-secondary">Amber scope</p>
                    <Button content="Save" />
                </div>
            </ThemeProvider>
            <ThemeProvider theme={{ colors: { accent: '#ef4444', 'accent-hover': '#dc2626' } }}>
                <div className="p-4 rounded-lg bg-surface border border-border">
                    <p className="text-sm mb-2 text-foreground-secondary">Red scope</p>
                    <Button content="Save" />
                </div>
            </ThemeProvider>
        </div>
    ),
}
