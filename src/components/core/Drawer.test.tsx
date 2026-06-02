import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Drawer from './Drawer'

describe('Drawer', () => {
    it('renders the title and body when open', () => {
        render(<Drawer open title="Filters">body content</Drawer>)
        expect(screen.getByText('Filters')).toBeInTheDocument()
        expect(screen.getByText('body content')).toBeInTheDocument()
    })

    it('does not render the body when closed', () => {
        render(<Drawer open={false} title="Filters">body content</Drawer>)
        expect(screen.queryByText('Filters')).toBeNull()
    })

    it('fires onClose when the close button is clicked', () => {
        const onClose = vi.fn()
        render(<Drawer open title="Filters" onClose={onClose}>body</Drawer>)
        fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
        expect(onClose).toHaveBeenCalled()
    })

    it('renders Ok / Cancel buttons by default', () => {
        render(<Drawer open title="x">body</Drawer>)
        expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('hides the footer when hasFooter=false', () => {
        render(<Drawer open title="x" hasFooter={false}>body</Drawer>)
        expect(screen.queryByRole('button', { name: 'Ok' })).toBeNull()
    })
})
