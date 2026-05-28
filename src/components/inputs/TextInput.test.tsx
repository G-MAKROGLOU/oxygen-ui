import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TextInput from './TextInput'

function Controlled({ initial = '', errorMessage }: { initial?: string; errorMessage?: string }) {
    const [v, setV] = useState(initial)
    return (
        <TextInput
            label="Name"
            htmlFor="n"
            value={v}
            onChange={(e) => setV(e.target.value)}
            errorMessage={errorMessage}
        />
    )
}

describe('TextInput', () => {
    it('renders label and input', () => {
        render(<Controlled />)
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    it('does NOT render an empty <label> when no label prop given', () => {
        const { container } = render(<TextInput value="" onChange={() => {}} />)
        expect(container.querySelector('label')).toBeNull()
    })

    it('reflects typing', () => {
        render(<Controlled />)
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Aurora' } })
        expect(screen.getByLabelText('Name')).toHaveValue('Aurora')
    })

    it('links aria-describedby to the error region', () => {
        render(<Controlled errorMessage="required" />)
        const input = screen.getByLabelText('Name')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        const id = input.getAttribute('aria-describedby')
        expect(id).toBeTruthy()
        expect(document.getElementById(id!)).toHaveTextContent('required')
    })
})
