import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Slider from './Slider'

describe('Slider', () => {
    it('renders a single-thumb slider', () => {
        render(<Slider label="Volume" value={40} />)
        expect(screen.getAllByRole('slider')).toHaveLength(1)
    })

    it('renders two thumbs for a range value', () => {
        render(<Slider label="Range" value={[20, 80]} />)
        expect(screen.getAllByRole('slider')).toHaveLength(2)
    })

    it('shows the formatted value when showValue is set', () => {
        render(<Slider label="Price" value={55} showValue formatValue={(n) => `$${n}`} />)
        expect(screen.getByText('$55')).toBeInTheDocument()
    })

    it('renders marks', () => {
        render(
            <Slider
                label="Q"
                value={50}
                marks={[{ value: 0, label: 'Low' }, { value: 100, label: 'High' }]}
            />
        )
        expect(screen.getByText('Low')).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('exposes aria-valuenow on the thumb', () => {
        render(<Slider label="V" value={40} min={0} max={100} />)
        expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40')
    })
})
