import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Breadcrumbs from './Breadcrumbs'

const trail = [
    { label: 'Home', href: '/' },
    { label: 'Fleet', href: '/fleet' },
    { label: 'Vessels', href: '/fleet/vessels' },
    { label: 'Aurora' },
]

describe('Breadcrumbs', () => {
    it('renders links for non-final crumbs and marks the last as current', () => {
        render(<Breadcrumbs items={trail} />)
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
        const current = screen.getByText('Aurora').closest('[aria-current="page"]')
        expect(current).toBeInTheDocument()
        // The current crumb is not a link.
        expect(screen.queryByRole('link', { name: 'Aurora' })).not.toBeInTheDocument()
    })

    it('exposes the nav landmark with its aria-label', () => {
        render(<Breadcrumbs items={trail} aria-label="You are here" />)
        expect(screen.getByLabelText('You are here')).toBeInTheDocument()
    })

    it('collapses the middle past maxItems and expands on click', () => {
        render(<Breadcrumbs items={trail} maxItems={3} />)
        // Middle crumb hidden initially.
        expect(screen.queryByRole('link', { name: 'Fleet' })).not.toBeInTheDocument()
        const ellipsis = screen.getByRole('button', { name: /show hidden breadcrumbs/i })
        fireEvent.click(ellipsis)
        expect(screen.getByRole('link', { name: 'Fleet' })).toBeInTheDocument()
    })
})
