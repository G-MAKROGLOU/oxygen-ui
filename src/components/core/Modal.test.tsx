import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
    // ── Visibility ────────────────────────────────────────────────────────

    it('renders nothing meaningful when closed', () => {
        render(<Modal isOpen={false} title="Confirm" />)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the dialog when open', () => {
        render(<Modal isOpen title="Confirm" />)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // ── Content ───────────────────────────────────────────────────────────

    it('renders the title text', () => {
        render(<Modal isOpen title="Delete item?" />)
        expect(screen.getByText('Delete item?')).toBeInTheDocument()
    })

    it('renders children content when open', () => {
        render(
            <Modal isOpen title="Info">
                <p>Body paragraph</p>
            </Modal>
        )
        expect(screen.getByText('Body paragraph')).toBeInTheDocument()
    })

    it('does not render children when closed', () => {
        render(
            <Modal isOpen={false} title="Info">
                <p>Body paragraph</p>
            </Modal>
        )
        expect(screen.queryByText('Body paragraph')).not.toBeInTheDocument()
    })

    // ── Footer ────────────────────────────────────────────────────────────

    it('renders Ok and Cancel buttons by default', () => {
        render(<Modal isOpen title="Confirm" />)
        expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('hides footer buttons when hasFooter=false', () => {
        render(<Modal isOpen title="Info" hasFooter={false} />)
        expect(screen.queryByRole('button', { name: 'Ok' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    })

    it('renders custom ok/cancel text', () => {
        render(<Modal isOpen title="Confirm" okText="Yes, delete" cancelText="No, keep" />)
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'No, keep' })).toBeInTheDocument()
    })

    // ── Callbacks ─────────────────────────────────────────────────────────

    it('calls onOk when Ok is clicked', () => {
        const onOk = vi.fn()
        render(<Modal isOpen title="Confirm" onOk={onOk} />)
        fireEvent.click(screen.getByRole('button', { name: 'Ok' }))
        expect(onOk).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Cancel is clicked', () => {
        const onCancel = vi.fn()
        render(<Modal isOpen title="Confirm" onCancel={onCancel} />)
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn()
        render(<Modal isOpen title="Confirm" onClose={onClose} />)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    // ── Responsive sizing ─────────────────────────────────────────────────

    it('applies maxWidth from size[0]', () => {
        render(<Modal isOpen title="Info" size={[480]} />)
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveStyle({ maxWidth: '480px' })
    })
})
