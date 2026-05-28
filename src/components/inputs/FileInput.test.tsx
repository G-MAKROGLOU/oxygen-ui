import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileInput from './FileInput'

describe('FileInput', () => {
    it('renders a keyboard-accessible dropzone', () => {
        render(<FileInput name="x" />)
        const dropzone = screen.getByRole('button', { name: /upload file/i })
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
})
