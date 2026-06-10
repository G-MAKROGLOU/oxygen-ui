import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Sidebar from './Sidebar'
import type { SidebarSection } from './Sidebar'

const withChildren: SidebarSection[] = [
    {
        key: 'main',
        items: [
            {
                key: 'fleet',
                label: 'Fleet',
                items: [
                    { key: 'vessels', label: 'Vessels' },
                    { key: 'crew', label: 'Crew' },
                ],
            },
        ],
    },
]

describe('Sidebar submenus', () => {
    it('hides sub-items until the group is opened, then reveals them', () => {
        render(<Sidebar sections={withChildren} isExpanded onToggle={() => {}} />)

        const parent = screen.getByRole('button', { name: /Fleet/i })
        expect(parent).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Vessels')).toBeNull()

        fireEvent.click(parent)

        expect(parent).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Vessels')).toBeInTheDocument()
        expect(screen.getByText('Crew')).toBeInTheDocument()
    })

    it('opens automatically when a descendant is active', () => {
        const sections: SidebarSection[] = [
            { key: 'm', items: [{ key: 'f', label: 'Fleet', items: [{ key: 'v', label: 'Vessels', isActive: true }] }] },
        ]
        render(<Sidebar sections={sections} isExpanded onToggle={() => {}} />)

        expect(screen.getByText('Vessels')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Fleet/i })).toHaveAttribute('aria-expanded', 'true')
    })

    it('honours defaultOpen', () => {
        const sections: SidebarSection[] = [
            { key: 'm', items: [{ key: 'f', label: 'Fleet', defaultOpen: true, items: [{ key: 'v', label: 'Vessels' }] }] },
        ]
        render(<Sidebar sections={sections} isExpanded onToggle={() => {}} />)
        expect(screen.getByText('Vessels')).toBeInTheDocument()
    })

    it('does not mark a plain item as expandable', () => {
        const sections: SidebarSection[] = [
            { key: 'm', items: [{ key: 'o', label: 'Overview' }] },
        ]
        render(<Sidebar sections={sections} isExpanded onToggle={() => {}} />)
        expect(screen.getByRole('button', { name: /Overview/i })).not.toHaveAttribute('aria-expanded')
    })
})

describe('Sidebar collapsed flyout', () => {
    it('opens a flyout with the sub-items on hover when collapsed', async () => {
        const user = userEvent.setup()
        const onVessels = vi.fn()
        const sections: SidebarSection[] = [
            {
                key: 'm',
                items: [
                    {
                        key: 'f',
                        label: 'Fleet',
                        items: [
                            { key: 'v', label: 'Vessels', onClick: onVessels },
                            { key: 'c', label: 'Crew' },
                        ],
                    },
                ],
            },
        ]
        render(<Sidebar sections={sections} isExpanded={false} onToggle={() => {}} />)

        // Sub-items hidden until the icon is hovered
        expect(screen.queryByText('Vessels')).toBeNull()

        await user.hover(screen.getByRole('button', { name: /Fleet/i }))

        // Flyout shows the group label + sub-items; selecting one fires its onClick
        expect(await screen.findByText('Vessels')).toBeInTheDocument()
        expect(screen.getByText('Crew')).toBeInTheDocument()
        await user.click(screen.getByText('Vessels'))
        expect(onVessels).toHaveBeenCalledTimes(1)
    })

    it('closes the flyout shortly after the pointer leaves', async () => {
        const user = userEvent.setup()
        const sections: SidebarSection[] = [
            { key: 'm', items: [{ key: 'f', label: 'Fleet', items: [{ key: 'v', label: 'Vessels' }] }] },
        ]
        render(<Sidebar sections={sections} isExpanded={false} onToggle={() => {}} />)

        const trigger = screen.getByRole('button', { name: /Fleet/i })
        await user.hover(trigger)
        expect(await screen.findByText('Vessels')).toBeInTheDocument()

        await user.unhover(trigger)
        await waitFor(() => expect(screen.queryByText('Vessels')).toBeNull(), { timeout: 1000 })
    })

    it('highlights the collapsed group icon when a descendant is active', () => {
        const sections: SidebarSection[] = [
            { key: 'm', items: [{ key: 'f', label: 'Fleet', items: [{ key: 'v', label: 'Vessels', isActive: true }] }] },
        ]
        render(<Sidebar sections={sections} isExpanded={false} onToggle={() => {}} />)
        expect(screen.getByRole('button', { name: /Fleet/i }).className).toContain('text-accent')
    })
})
