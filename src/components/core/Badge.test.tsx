import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
    it('renders a label pill', () => {
        render(<Badge tone="success">Active</Badge>)
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('caps the count at max', () => {
        render(<Badge count={1280} max={99} />)
        expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('hides a zero count unless showZero', () => {
        const { rerender, container } = render(<Badge count={0} />)
        expect(container).toBeEmptyDOMElement()
        rerender(<Badge count={0} showZero />)
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('overlays an indicator on a wrapped child', () => {
        render(
            <Badge count={5} tone="error">
                <button>Inbox</button>
            </Badge>,
        )
        expect(screen.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
