import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Accordion from './Accordion'

function Basic(props: Partial<React.ComponentProps<typeof Accordion>>) {
    return (
        <Accordion {...props}>
            <Accordion.Item value="a" title="First">First body</Accordion.Item>
            <Accordion.Item value="b" title="Second">Second body</Accordion.Item>
        </Accordion>
    )
}

describe('Accordion', () => {
    it('renders triggers with aria-expanded reflecting open state', () => {
        render(<Basic type="single" defaultValue="a" />)
        const first = screen.getByRole('button', { name: 'First' })
        const second = screen.getByRole('button', { name: 'Second' })
        expect(first).toHaveAttribute('aria-expanded', 'true')
        expect(second).toHaveAttribute('aria-expanded', 'false')
    })

    it('single mode closes the previous panel when another opens', () => {
        render(<Basic type="single" defaultValue="a" />)
        const second = screen.getByRole('button', { name: 'Second' })
        fireEvent.click(second)
        expect(second).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', 'false')
    })

    it('multiple mode keeps panels independent', () => {
        render(<Basic type="multiple" defaultValue={['a']} />)
        const second = screen.getByRole('button', { name: 'Second' })
        fireEvent.click(second)
        expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', 'true')
        expect(second).toHaveAttribute('aria-expanded', 'true')
    })

    it('disables an item', () => {
        render(
            <Accordion type="single">
                <Accordion.Item value="a" title="Locked" disabled>body</Accordion.Item>
            </Accordion>,
        )
        expect(screen.getByRole('button', { name: 'Locked' })).toBeDisabled()
    })
})
