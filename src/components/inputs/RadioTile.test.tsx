import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RadioTile from './RadioTile'

const OPTIONS = [
    { value: 'starter', label: 'Starter', description: '1 vessel' },
    { value: 'pro', label: 'Pro', description: 'Unlimited', badge: 'Popular' },
    { value: 'ent', label: 'Enterprise', disabled: true },
]

describe('RadioTile', () => {
    it('renders tiles with labels, descriptions and badges', () => {
        render(<RadioTile options={OPTIONS} label="Plan" />)
        expect(screen.getByText('Starter')).toBeInTheDocument()
        expect(screen.getByText('1 vessel')).toBeInTheDocument()
        expect(screen.getByText('Popular')).toBeInTheDocument()
        expect(screen.getAllByRole('radio')).toHaveLength(3)
    })

    it('fires onChange with the selected value', () => {
        const onChange = vi.fn()
        render(<RadioTile options={OPTIONS} onChange={onChange} />)
        fireEvent.click(screen.getByRole('radio', { name: /Pro/ }))
        expect(onChange).toHaveBeenCalledWith('pro')
    })

    it('reflects the controlled value as checked', () => {
        render(<RadioTile options={OPTIONS} value="starter" />)
        expect(screen.getByRole('radio', { name: /Starter/ })).toHaveAttribute('aria-checked', 'true')
        expect(screen.getByRole('radio', { name: /Pro/ })).toHaveAttribute('aria-checked', 'false')
    })

    it('disables individual tiles', () => {
        const onChange = vi.fn()
        render(<RadioTile options={OPTIONS} onChange={onChange} />)
        const ent = screen.getByRole('radio', { name: /Enterprise/ })
        expect(ent).toBeDisabled()
    })

    it('surfaces an error message', () => {
        render(<RadioTile options={OPTIONS} errorMessage="Pick a plan" />)
        expect(screen.getByText('Pick a plan')).toBeInTheDocument()
    })
})
