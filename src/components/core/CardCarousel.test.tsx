import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CardCarousel from './CardCarousel'

describe('CardCarousel', () => {
    it('renders each slide and the arrow controls', () => {
        render(
            <CardCarousel showDots>
                <div>One</div>
                <div>Two</div>
                <div>Three</div>
            </CardCarousel>,
        )
        expect(screen.getByText('One')).toBeInTheDocument()
        expect(screen.getByText('Three')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
        // One dot per slide.
        expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(3)
    })

    it('exposes the region landmark', () => {
        render(<CardCarousel aria-label="Vessels"><div>A</div></CardCarousel>)
        expect(screen.getByLabelText('Vessels')).toBeInTheDocument()
    })
})
