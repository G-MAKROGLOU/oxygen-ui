import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PopConfirm from './PopConfirm'

describe('PopConfirm', () => {
    it('opens on trigger click and confirms', async () => {
        const onConfirm = vi.fn()
        render(
            <PopConfirm title="Delete this?" confirmText="Delete" onConfirm={onConfirm}>
                <button>Open</button>
            </PopConfirm>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        expect(await screen.findByText('Delete this?')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
        await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    })

    it('cancels without firing confirm', async () => {
        const onConfirm = vi.fn()
        const onCancel = vi.fn()
        render(
            <PopConfirm title="Sure?" onConfirm={onConfirm} onCancel={onCancel}>
                <button>Open</button>
            </PopConfirm>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        await screen.findByText('Sure?')
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1))
        expect(onConfirm).not.toHaveBeenCalled()
    })
})
