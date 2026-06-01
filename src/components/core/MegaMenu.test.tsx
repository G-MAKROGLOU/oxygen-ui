import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MegaMenu from './MegaMenu'

function Bar() {
    return (
        <MegaMenu aria-label="Main">
            <MegaMenu.Item label="Products">
                <MegaMenu.Panel>
                    <MegaMenu.Section title="Platform">
                        <MegaMenu.Link href="/analytics" description="Reports">Analytics</MegaMenu.Link>
                    </MegaMenu.Section>
                </MegaMenu.Panel>
            </MegaMenu.Item>
            <MegaMenu.Item label="Pricing" href="/pricing" />
        </MegaMenu>
    )
}

describe('MegaMenu', () => {
    it('renders a panel item as a trigger button', () => {
        render(<Bar />)
        const products = screen.getByText('Products').closest('button')
        expect(products).toBeInTheDocument()
        expect(products).toHaveAttribute('aria-expanded', 'false')
    })

    it('renders a plain item as a top-level link with its href', () => {
        render(<Bar />)
        const pricing = screen.getByText('Pricing').closest('a')
        expect(pricing).toBeInTheDocument()
        expect(pricing).toHaveAttribute('href', '/pricing')
    })

    it('exposes the menu landmark with its aria-label', () => {
        render(<Bar />)
        expect(screen.getByLabelText('Main')).toBeInTheDocument()
    })
})
