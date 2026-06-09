import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PasswordStrength, { scorePassword } from './PasswordStrength'

describe('scorePassword', () => {
    it('scores empty as 0 with no label', () => {
        expect(scorePassword('')).toEqual({ score: 0, label: '' })
    })
    it('scores a short simple password as weak', () => {
        expect(scorePassword('abc').score).toBe(1)
    })
    it('caps low-entropy strings (repeats/sequences) at weak', () => {
        expect(scorePassword('aaaaaaaaaaaa').score).toBe(1)
        expect(scorePassword('0123456789').score).toBe(1)
    })
    it('scores a long varied password as strong', () => {
        expect(scorePassword('Abcd1234!xyz').score).toBe(4)
    })
})

describe('PasswordStrength', () => {
    it('renders a strength meter reflecting the score', () => {
        render(<PasswordStrength value="Abcd1234!xyz" />)
        const meter = screen.getByRole('meter', { name: 'Password strength' })
        expect(meter).toHaveAttribute('aria-valuenow', '4')
        expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    it('shows the requirement checklist when enabled', () => {
        render(<PasswordStrength value="abc" showRequirements />)
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
        expect(screen.getByText('A number')).toBeInTheDocument()
    })

    it('shows the matcher when confirmValue is provided', () => {
        const { rerender } = render(<PasswordStrength value="secret1" confirmValue="secret2" />)
        expect(screen.getByText(/don’t match/)).toBeInTheDocument()
        rerender(<PasswordStrength value="secret1" confirmValue="secret1" />)
        expect(screen.getByText('Passwords match')).toBeInTheDocument()
    })

    it('honours a custom scorer', () => {
        render(<PasswordStrength value="x" scorer={() => ({ score: 2, label: 'Custom' })} />)
        expect(screen.getByText('Custom')).toBeInTheDocument()
    })
})
