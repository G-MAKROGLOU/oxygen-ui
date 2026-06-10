import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
