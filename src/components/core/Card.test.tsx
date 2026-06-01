import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
    it('renders composed sections', () => {
        render(
            <Card>
                <Card.Header title="Title" subtitle="Sub" />
                <Card.Body>Body text</Card.Body>
                <Card.Footer>Footer</Card.Footer>
            </Card>,
        )
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Sub')).toBeInTheDocument()
        expect(screen.getByText('Body text')).toBeInTheDocument()
        expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('interactive card is a button and activates on Enter', () => {
        const onClick = vi.fn()
        render(<Card interactive onClick={onClick}>Hit me</Card>)
        const card = screen.getByRole('button', { name: 'Hit me' })
        fireEvent.keyDown(card, { key: 'Enter' })
        expect(onClick).toHaveBeenCalledTimes(1)
        fireEvent.click(card)
        expect(onClick).toHaveBeenCalledTimes(2)
    })
})
