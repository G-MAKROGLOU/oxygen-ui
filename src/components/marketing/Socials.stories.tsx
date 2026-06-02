import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Socials from './Socials'

const meta: Meta<typeof Socials> = {
    title: 'Marketing/Socials',
    component: Socials,
    parameters: { layout: 'centered' },
    argTypes: {
        variant: { control: 'inline-radio', options: ['ghost', 'solid', 'outline'] },
        size: { control: 'inline-radio', options: ['sm', 'md'] },
        newTab: { control: 'boolean' },
    },
}
export default meta
type Story = StoryObj<typeof Socials>

const links = [
    { platform: 'x' as const, href: 'https://x.com/acme' },
    { platform: 'github' as const, href: 'https://github.com/acme' },
    { platform: 'linkedin' as const, href: 'https://linkedin.com/company/acme' },
    { platform: 'youtube' as const, href: 'https://youtube.com/@acme' },
    { platform: 'instagram' as const, href: 'https://instagram.com/acme' },
    { platform: 'email' as const, href: 'mailto:hi@acme.com' },
]

export const Ghost: Story = { args: { variant: 'ghost', links } }
export const Solid: Story = { args: { variant: 'solid', links } }
export const Outline: Story = { args: { variant: 'outline', links } }
export const Small: Story = { args: { size: 'sm', variant: 'outline', links } }

export const CustomLabels: Story = {
    args: {
        variant: 'solid',
        links: [
            { platform: 'website', href: 'https://acme.com', label: 'Our website' },
            { platform: 'mastodon', href: 'https://mastodon.social/@acme' },
            { platform: 'facebook', href: 'https://facebook.com/acme' },
        ],
    },
}
