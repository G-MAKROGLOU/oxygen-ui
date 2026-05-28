import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IconButton from './IconButton'

describe('IconButton', () => {
    it('renders the icon', () => {
        render(<IconButton icon={<span data-testid="ic">x</span>} />)
        expect(screen.getByTestId('ic')).toBeInTheDocument()
    })

    it('fires onClick', () => {
        const fn = vi.fn()
        render(<IconButton icon={<span>x</span>} onClick={fn} />)
        fireEvent.click(screen.getByRole('button'))
        expect(fn).toHaveBeenCalledOnce()
    })

    it('is disabled when loading', () => {
        render(<IconButton icon={<span>x</span>} loading loadingIcon={<span data-testid="spin">…</span>} />)
        expect(screen.getByRole('button')).toBeDisabled()
        expect(screen.getByTestId('spin')).toBeInTheDocument()
    })

    it('respects buttonType', () => {
        render(<IconButton icon={<span>x</span>} buttonType="submit" />)
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
})
