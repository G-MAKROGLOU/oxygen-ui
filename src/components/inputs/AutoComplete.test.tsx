import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AutoComplete from './AutoComplete'

const ITEMS = [
    { key: '1', value: 'GRPIR', label: 'Piraeus'   },
    { key: '2', value: 'NLRTM', label: 'Rotterdam' },
    { key: '3', value: 'SGSIN', label: 'Singapore' },
]

describe('AutoComplete', () => {
    it('renders the input', () => {
        render(<AutoComplete items={ITEMS} placeholder="search" />)
        expect(screen.getByPlaceholderText('search')).toBeInTheDocument()
    })

    it('filters items based on typed text', () => {
        render(<AutoComplete items={ITEMS} placeholder="search" />)
        const input = screen.getByPlaceholderText('search')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'sin' } })
        expect(screen.getByText(/Singapore/)).toBeInTheDocument()
        expect(screen.queryByText(/Piraeus/)).toBeNull()
    })

    it('fires onItemClick when an option is picked', () => {
        const fn = vi.fn()
        render(<AutoComplete items={ITEMS} placeholder="search" onItemClick={fn} />)
        const input = screen.getByPlaceholderText('search')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'rot' } })
        fireEvent.click(screen.getByText(/Rotterdam/))
        expect(fn).toHaveBeenCalledWith('NLRTM')
    })
})
