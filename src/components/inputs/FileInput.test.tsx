import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileInput from './FileInput'

describe('FileInput', () => {
    it('renders a keyboard-accessible dropzone', () => {
        render(<FileInput name="x" />)
        // Default aria-label is the prompt copy.
        const dropzone = screen.getByRole('button', { name: /click to upload/i })
        expect(dropzone).toHaveAttribute('tabIndex', '0')
    })

    it('emits files via onChange', () => {
        const fn = vi.fn()
        const { container } = render(<FileInput name="x" onChange={fn} />)
        const fileInput = container.querySelector('input[type="file"]')!
        const file = new File(['a'], 'a.txt', { type: 'text/plain' })
        fireEvent.change(fileInput, { target: { files: [file] } })
        expect(fn).toHaveBeenCalled()
        expect(fn.mock.calls[0][0].target.files[0].name).toBe('a.txt')
    })

    it('shows the selected file as a chip with name + size', () => {
        render(<FileInput name="x" />)
        const fileInput = document.querySelector('input[type="file"]')!
        const file = new File(['hello'], 'report.csv', { type: 'text/csv' })
        fireEvent.change(fileInput, { target: { files: [file] } })
        expect(screen.getByText('report.csv')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /remove report\.csv/i })).toBeInTheDocument()
    })

    it('rejects files over maxSize with an error', () => {
        const fn = vi.fn()
        render(<FileInput name="x" maxSize={3} onChange={fn} />)
        const fileInput = document.querySelector('input[type="file"]')!
        const big = new File(['way too long'], 'big.txt', { type: 'text/plain' })
        fireEvent.change(fileInput, { target: { files: [big] } })
        expect(fn).not.toHaveBeenCalled()
        expect(screen.getByText(/exceeds the/i)).toBeInTheDocument()
    })
})
