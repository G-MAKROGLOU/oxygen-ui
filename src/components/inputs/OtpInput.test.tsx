import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OtpInput from './OtpInput'

function Harness({ onComplete, length = 4 }: { onComplete?: (c: string) => void; length?: number }) {
    const [v, setV] = useState('')
    return <OtpInput label="Code" length={length} value={v} onChange={setV} onComplete={onComplete} />
}

describe('OtpInput', () => {
    it('renders `length` boxes', () => {
        render(<Harness length={4} />)
        expect(screen.getAllByRole('textbox')).toHaveLength(4)
    })

    it('types digits and auto-advances', () => {
        render(<Harness length={4} />)
        const boxes = screen.getAllByRole('textbox')
        fireEvent.change(boxes[0], { target: { value: '1' } })
        expect(boxes[0]).toHaveValue('1')
    })

    it('rejects non-numeric input in numeric mode', () => {
        render(<Harness length={4} />)
        const boxes = screen.getAllByRole('textbox')
        fireEvent.change(boxes[0], { target: { value: 'x' } })
        expect(boxes[0]).toHaveValue('')
    })

    it('fires onComplete when all boxes fill', () => {
        const onComplete = vi.fn()
        render(<Harness length={3} onComplete={onComplete} />)
        const boxes = screen.getAllByRole('textbox')
        fireEvent.change(boxes[0], { target: { value: '1' } })
        fireEvent.change(boxes[1], { target: { value: '2' } })
        fireEvent.change(boxes[2], { target: { value: '3' } })
        expect(onComplete).toHaveBeenLastCalledWith('123')
    })
})
