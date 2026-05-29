import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TextArea from './TextArea'

function Controlled({ initial = '', ...rest }: { initial?: string } & Partial<React.ComponentProps<typeof TextArea>>) {
    const [v, setV] = useState(initial)
    return <TextArea label="Notes" htmlFor="n" {...rest} value={v} onChange={(e) => setV(e.target.value)} />
}

describe('TextArea', () => {
    it('renders a labelled textarea', () => {
        render(<Controlled />)
        expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA')
    })

    it('reflects typing', () => {
        render(<Controlled />)
        const ta = screen.getByLabelText('Notes')
        fireEvent.change(ta, { target: { value: 'hello world' } })
        expect(ta).toHaveValue('hello world')
    })

    it('shows a character counter with maxLength', () => {
        render(<Controlled maxLength={100} showCount initial="abc" />)
        expect(screen.getByText('3 / 100')).toBeInTheDocument()
    })

    it('links aria-describedby to the error region', () => {
        render(<Controlled errorMessage="required" />)
        const ta = screen.getByLabelText('Notes')
        expect(ta).toHaveAttribute('aria-invalid', 'true')
        const id = ta.getAttribute('aria-describedby')
        expect(document.getElementById(id!)).toHaveTextContent('required')
    })
})
