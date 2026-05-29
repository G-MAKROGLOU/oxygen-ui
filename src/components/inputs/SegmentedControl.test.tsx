import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SegmentedControl from './SegmentedControl'

const OPTS = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
    { value: 'cal', label: 'Calendar', disabled: true },
]

function Harness({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState('list')
    return <SegmentedControl options={OPTS} value={v} onChange={(val) => { setV(val); onChange?.(val) }} aria-label="View" />
}

describe('SegmentedControl', () => {
    it('renders all segments', () => {
        render(<Harness />)
        expect(screen.getByText('List')).toBeInTheDocument()
        expect(screen.getByText('Board')).toBeInTheDocument()
        expect(screen.getByText('Calendar')).toBeInTheDocument()
    })

    it('selects a segment on click', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        fireEvent.click(screen.getByText('Board'))
        expect(onChange).toHaveBeenCalledWith('board')
    })

    it('reflects the active segment with aria-checked / data-state', () => {
        render(<Harness />)
        const list = screen.getByRole('radio', { name: 'List' })
        expect(list).toHaveAttribute('data-state', 'on')
    })

    it('does not activate a disabled segment', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        const cal = screen.getByText('Calendar')
        fireEvent.click(cal)
        expect(onChange).not.toHaveBeenCalled()
    })
})
