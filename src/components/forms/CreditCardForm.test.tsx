import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreditCardForm from './CreditCardForm'

describe('CreditCardForm', () => {
    it('blocks submit and shows errors for an invalid card', async () => {
        const onSubmit = vi.fn()
        render(<CreditCardForm onSubmit={onSubmit} submitLabel="Pay" />)
        fireEvent.click(screen.getByText('Pay'))
        await waitFor(() => expect(screen.getByText(/Card number is required/i)).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('formats the number and rejects a bad Luhn', async () => {
        const onSubmit = vi.fn()
        render(<CreditCardForm onSubmit={onSubmit} submitLabel="Pay" />)
        const number = screen.getByLabelText(/Card number/i) as HTMLInputElement
        fireEvent.change(number, { target: { value: '4242424242424241' } })
        expect(number.value).toBe('4242 4242 4242 4241') // grouped
        fireEvent.click(screen.getByText('Pay'))
        await waitFor(() => expect(screen.getByText(/looks invalid/i)).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits a normalised card once every field is valid', async () => {
        const onSubmit = vi.fn()
        render(<CreditCardForm onSubmit={onSubmit} submitLabel="Pay" />)
        fireEvent.change(screen.getByLabelText(/Card number/i), { target: { value: '4242424242424242' } })
        fireEvent.change(screen.getByLabelText(/Cardholder name/i), { target: { value: 'Jane Appleseed' } })
        fireEvent.change(screen.getByLabelText(/Expiry/i), { target: { value: '1240' } })
        fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } })
        fireEvent.click(screen.getByText('Pay'))
        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith({
                number: '4242424242424242',
                name: 'Jane Appleseed',
                expiry: '12/40',
                cvv: '123',
                brand: 'visa',
            }),
        )
    })

    it('enforces the Amex 4-digit CVV', async () => {
        const onSubmit = vi.fn()
        render(<CreditCardForm onSubmit={onSubmit} submitLabel="Pay" />)
        fireEvent.change(screen.getByLabelText(/Card number/i), { target: { value: '378282246310005' } })
        fireEvent.change(screen.getByLabelText(/Cardholder name/i), { target: { value: 'A B' } })
        fireEvent.change(screen.getByLabelText(/Expiry/i), { target: { value: '1240' } })
        fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } })
        fireEvent.click(screen.getByText('Pay'))
        await waitFor(() => expect(screen.getByText(/CVV must be 4 digits/i)).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
