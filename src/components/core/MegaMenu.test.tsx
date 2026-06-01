import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import MegaMenu from './MegaMenu'

function Bar(props: React.ComponentProps<typeof MegaMenu>) {
    return (
        <MegaMenu aria-label="Main" {...props}>
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

    it('renders a responsive mobile disclosure that expands an item panel on tap', () => {
        render(<Bar />)
        // The mobile toggle carries the default "Menu" label.
        const toggle = screen.getByRole('button', { name: 'Menu' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')

        fireEvent.click(toggle)
        expect(toggle).toHaveAttribute('aria-expanded', 'true')

        // The mobile accordion exposes the item as its own expandable button.
        const productsRows = screen.getAllByRole('button', { name: /Products/ })
        const mobileProducts = productsRows[productsRows.length - 1]
        fireEvent.click(mobileProducts)
        expect(mobileProducts).toHaveAttribute('aria-expanded', 'true')

        // Its links are now reachable as plain anchors in the disclosure.
        const disclosure = toggle.parentElement as HTMLElement
        const analytics = within(disclosure).getByRole('link', { name: /Analytics/ })
        expect(analytics).toHaveAttribute('href', '/analytics')
    })

    it('omits the mobile disclosure when responsive is false', () => {
        render(<Bar responsive={false} />)
        expect(screen.queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument()
    })
})
