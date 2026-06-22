import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
    // ── Visibility ────────────────────────────────────────────────────────

    it('renders nothing meaningful when closed', () => {
        render(<Modal open={false} title="Confirm" />)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the dialog when open', () => {
        render(<Modal open title="Confirm" />)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // ── Content ───────────────────────────────────────────────────────────

    it('renders the title text', () => {
        render(<Modal open title="Delete item?" />)
        expect(screen.getByText('Delete item?')).toBeInTheDocument()
    })

    it('renders children content when open', () => {
        render(
            <Modal open title="Info">
                <p>Body paragraph</p>
            </Modal>
        )
        expect(screen.getByText('Body paragraph')).toBeInTheDocument()
    })

    it('does not render children when closed', () => {
        render(
            <Modal open={false} title="Info">
                <p>Body paragraph</p>
            </Modal>
        )
        expect(screen.queryByText('Body paragraph')).not.toBeInTheDocument()
    })

    // ── Footer ────────────────────────────────────────────────────────────

    it('renders Ok and Cancel buttons by default', () => {
        render(<Modal open title="Confirm" />)
        expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('hides footer buttons when hasFooter=false', () => {
        render(<Modal open title="Info" hasFooter={false} />)
        expect(screen.queryByRole('button', { name: 'Ok' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    })

    it('defaults Ok to primary (accent) and Cancel to ghost', () => {
        render(<Modal open title="Confirm" />)
        expect(screen.getByRole('button', { name: 'Ok' }).className).toContain('bg-accent')
        const cancel = screen.getByRole('button', { name: 'Cancel' })
        expect(cancel.className).not.toContain('bg-accent')
    })

    it('honors okVariant / cancelVariant overrides', () => {
        render(<Modal open title="Delete?" okVariant="danger" cancelVariant="secondary" />)
        expect(screen.getByRole('button', { name: 'Ok' }).className).toContain('bg-status-error')
        expect(screen.getByRole('button', { name: 'Cancel' }).className).toContain('border-accent')
    })

    it('renders custom ok/cancel text', () => {
        render(<Modal open title="Confirm" okText="Yes, delete" cancelText="No, keep" />)
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'No, keep' })).toBeInTheDocument()
    })

    // ── Callbacks ─────────────────────────────────────────────────────────

    it('calls onOk when Ok is clicked', () => {
        const onOk = vi.fn()
        render(<Modal open title="Confirm" onOk={onOk} />)
        fireEvent.click(screen.getByRole('button', { name: 'Ok' }))
        expect(onOk).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Cancel is clicked', () => {
        const onCancel = vi.fn()
        render(<Modal open title="Confirm" onCancel={onCancel} />)
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn()
        render(<Modal open title="Confirm" onClose={onClose} />)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    // ── Responsive sizing ─────────────────────────────────────────────────

    it('applies maxWidth from the named size scale', () => {
        render(<Modal open title="Info" size="lg" />)
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveStyle({ maxWidth: '800px' })
    })

    it('lets an explicit width override the size scale', () => {
        render(<Modal open title="Info" size="lg" width={480} />)
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveStyle({ maxWidth: '480px' })
    })
})
