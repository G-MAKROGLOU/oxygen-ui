import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Password from './Password'

function Controlled({ errorMessage }: { errorMessage?: string }) {
    const [v, setV] = useState('')
    return (
        <Password
            label="Password"
            htmlFor="pw"
            value={v}
            onChange={(e) => setV(e.target.value)}
            errorMessage={errorMessage}
        />
    )
}

describe('Password', () => {
    it('starts as type=password', () => {
        render(<Controlled />)
        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })

    it('toggles visibility via the eye button', () => {
        render(<Controlled />)
        const input = screen.getByLabelText('Password')
        fireEvent.click(screen.getByRole('button', { name: /show password/i }))
        expect(input).toHaveAttribute('type', 'text')
        fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
        expect(input).toHaveAttribute('type', 'password')
    })

    it('links aria-describedby to the error region', () => {
        render(<Controlled errorMessage="too short" />)
        const input = screen.getByLabelText('Password')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        const id = input.getAttribute('aria-describedby')
        expect(id).toBeTruthy()
        expect(document.getElementById(id!)).toHaveTextContent('too short')
    })
})
