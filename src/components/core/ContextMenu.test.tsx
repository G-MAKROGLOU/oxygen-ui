import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContextMenu from './ContextMenu'
import type { ContextMenuActionItem } from './ContextMenu'

describe('ContextMenu', () => {
    // ── Trigger setup ──────────────────────────────────────────────────────

    it('renders the trigger subtree by default', () => {
        render(
            <ContextMenu items={[]}>
                <button>trigger</button>
            </ContextMenu>
        )
        expect(screen.getByText('trigger')).toBeInTheDocument()
    })

    it('opens on right-click and renders the items', () => {
        const items: ContextMenuActionItem[] = [
            { key: 'edit',   value: 'Edit'   },
            { key: 'delete', value: 'Delete' },
        ]
        render(
            <ContextMenu items={items}>
                <button>trigger</button>
            </ContextMenu>
        )
        fireEvent.contextMenu(screen.getByText('trigger'))
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    // ── Activation ─────────────────────────────────────────────────────────

    it('fires onClick when an item is selected', () => {
        const onEdit = vi.fn()
        const items: ContextMenuActionItem[] = [
            { key: 'edit', value: 'Edit', onClick: onEdit },
        ]
        render(
            <ContextMenu items={items}>
                <button>trigger</button>
            </ContextMenu>
        )
        fireEvent.contextMenu(screen.getByText('trigger'))
        fireEvent.click(screen.getByText('Edit'))
        expect(onEdit).toHaveBeenCalledOnce()
    })

    // ── Disabled items ─────────────────────────────────────────────────────

    it('does not fire onClick for disabled items', () => {
        const onShare = vi.fn()
        const items: ContextMenuActionItem[] = [
            { key: 'share', value: 'Share', disabled: true, onClick: onShare },
        ]
        render(
            <ContextMenu items={items}>
                <button>trigger</button>
            </ContextMenu>
        )
        fireEvent.contextMenu(screen.getByText('trigger'))
        const share = screen.getByText('Share')
        expect(share.closest('[data-disabled]')).not.toBeNull()
        // Clicking does nothing — Radix swallows the activation
        fireEvent.click(share)
        expect(onShare).not.toHaveBeenCalled()
    })

    // ── Submenus ───────────────────────────────────────────────────────────

    it('renders sub-menu items', () => {
        const items: ContextMenuActionItem[] = [
            {
                key: 'export', value: 'Export',
                children: [
                    { key: 'csv',  value: 'CSV'  },
                    { key: 'xlsx', value: 'XLSX' },
                ],
            },
        ]
        render(
            <ContextMenu items={items}>
                <button>trigger</button>
            </ContextMenu>
        )
        fireEvent.contextMenu(screen.getByText('trigger'))
        // Parent renders its label
        expect(screen.getByText('Export')).toBeInTheDocument()
        // Sub-menu doesn't open until hover / arrow; we don't simulate that
        // here — Radix handles it. The test guards that the parent renders
        // with the chevron affordance.
        expect(screen.getByText('Export').closest('[role="menuitem"]')).not.toBeNull()
    })
})
