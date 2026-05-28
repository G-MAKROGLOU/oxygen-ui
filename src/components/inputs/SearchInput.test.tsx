import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchInput from './SearchInput'

function Controlled() {
    const [v, setV] = useState('')
    return <SearchInput value={v} onChange={(e) => setV(e.target.value)} placeholder="search" />
}

describe('SearchInput', () => {
    it('uses type="search" for the native clear UI', () => {
        render(<Controlled />)
        expect(screen.getByPlaceholderText('search')).toHaveAttribute('type', 'search')
    })

    it('reflects typing', () => {
        render(<Controlled />)
        const input = screen.getByPlaceholderText('search')
        fireEvent.change(input, { target: { value: 'aurora' } })
        expect(input).toHaveValue('aurora')
    })
})
