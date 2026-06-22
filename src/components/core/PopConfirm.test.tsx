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

    it('awaits an async onConfirm: shows loading, stays open until it settles, then closes', async () => {
        let resolveConfirm: () => void = () => {}
        const onConfirm = vi.fn(() => new Promise<void>((res) => { resolveConfirm = res }))
        render(
            <PopConfirm title="Delete this?" confirmText="Delete" onConfirm={onConfirm}>
                <button>Open</button>
            </PopConfirm>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        const confirmBtn = await screen.findByRole('button', { name: 'Delete' })
        fireEvent.click(confirmBtn)

        // In flight: confirm is disabled (loading), prompt still open.
        await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled())
        expect(screen.getByText('Delete this?')).toBeInTheDocument()

        // Settle → prompt closes.
        resolveConfirm()
        await waitFor(() => expect(screen.queryByText('Delete this?')).not.toBeInTheDocument())
    })

    it('locks dismissal while an async confirm is in flight', async () => {
        let resolveConfirm: () => void = () => {}
        const onConfirm = vi.fn(() => new Promise<void>((res) => { resolveConfirm = res }))
        const onCancel = vi.fn()
        render(
            <PopConfirm title="Delete this?" confirmText="Delete" onConfirm={onConfirm} onCancel={onCancel}>
                <button>Open</button>
            </PopConfirm>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
        await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled())

        // Cancel is disabled and Escape is ignored while loading.
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
        fireEvent.keyDown(screen.getByText('Delete this?'), { key: 'Escape' })
        await Promise.resolve()
        expect(screen.getByText('Delete this?')).toBeInTheDocument()
        expect(onCancel).not.toHaveBeenCalled()

        resolveConfirm()
        await waitFor(() => expect(screen.queryByText('Delete this?')).not.toBeInTheDocument())
    })
})
