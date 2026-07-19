import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Blog from './Blog'

const meta: Meta<typeof Blog> = {
    title: 'Marketing/Blog',
    component: Blog,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        columns: { control: 'inline-radio', options: [2, 3] },
        centeredHeader: { control: 'boolean' },
    },
    decorators: [(Story) => <div className="mx-auto max-w-6xl p-6"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Blog>

const posts = [
    { title: 'Cutting CII red days before they happen', excerpt: 'A practical playbook for keeping vessels in band without sacrificing schedule.', image: 'https://picsum.photos/seed/blog1/800/450', tag: 'Compliance', author: 'A. Costa', date: 'May 12, 2026', readTime: '6 min read', href: '#' },
    { title: 'The hidden cost of spreadsheet reporting', excerpt: 'Why scattered noon reports quietly erode your fuel budget, and what to do instead.', image: 'https://picsum.photos/seed/blog2/800/450', tag: 'Operations', author: 'M. Ferreira', date: 'Apr 28, 2026', readTime: '4 min read', href: '#' },
    { title: 'Designing for the bridge at 2am', excerpt: 'Legibility, contrast and calm: the interface principles behind oxygen-ui.', image: 'https://picsum.photos/seed/blog3/800/450', tag: 'Design', author: 'G. Makroglou', date: 'Apr 10, 2026', readTime: '8 min read', href: '#' },
]

export const ThreeColumn: Story = {
    args: { eyebrow: 'From the blog', title: 'Insights for modern fleets', description: 'Field notes on compliance, performance and the craft of operational software.', columns: 3, posts },
}

export const TwoColumn: Story = {
    args: { title: 'Latest articles', columns: 2, posts: posts.slice(0, 2) },
}

export const NoImages: Story = {
    args: {
        title: 'Notes',
        columns: 3,
        posts: posts.map(({ image: _img, ...p }) => p),
    },
}

export const Clickable: Story = {
    name: 'onClick (no href)',
    args: {
        columns: 3,
        posts: posts.map((p) => ({ ...p, href: undefined, onClick: () => alert(`Open: ${p.title}`) })),
    },
}
