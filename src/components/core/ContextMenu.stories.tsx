import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ContextMenu from './ContextMenu'
import type { ContextMenuActionItem } from './ContextMenu'

const meta: Meta<typeof ContextMenu> = {
    title: 'Menu/ContextMenu',
    component: ContextMenu,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Right-click context menu built on `@radix-ui/react-context-menu`. Wrap any element that should respond to right-click; Radix handles positioning, keyboard navigation (↑↓ → ← Enter Esc), portaling, and ARIA roles.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof ContextMenu>

const FlatItems: ContextMenuActionItem[] = [
    { key: 'open',  value: 'Open'                       },
    { key: 'edit',  value: 'Edit'                       },
    { key: 'share', value: 'Share',  disabled: true     },
    { key: 'del',   value: 'Delete'                     },
]

const NestedItems: ContextMenuActionItem[] = [
    { key: 'view',   value: 'View details' },
    {
        key: 'export', value: 'Export',
        children: [
            { key: 'csv',  value: 'Export as CSV'   },
            { key: 'xlsx', value: 'Export as Excel' },
            { key: 'pdf',  value: 'Export as PDF',  disabled: true },
        ],
    },
    {
        key: 'move', value: 'Move to',
        children: [
            { key: 'arch', value: 'Archive'    },
            { key: 'trash', value: 'Trash'     },
            { key: 'fav',   value: 'Favourites' },
        ],
    },
    { key: 'rename', value: 'Rename' },
    { key: 'del',    value: 'Delete' },
]

// ─── Stories ────────────────────────────────────────────────────────────────

export const FlatMenu: Story = {
    name: 'Flat menu',
    parameters: {
        docs: {
            description: {
                story:
                    'Right-click the surface to open. Use ↑↓ to navigate, Enter to activate, Esc to close. Disabled items are shown but cannot be activated.',
            },
        },
    },
    render: () => (
        <ContextMenu items={FlatItems}>
            <div className="rounded-lg border border-dashed border-border bg-surface text-foreground p-12 text-sm select-none">
                Right-click here
            </div>
        </ContextMenu>
    ),
}

export const NestedSubMenus: Story = {
    name: 'Nested sub-menus',
    parameters: {
        docs: {
            description: {
                story:
                    'Hover or arrow-right onto an item with children to open the sub-menu. Arrow-left closes it. Sub-menus auto-flip to the left when there is no room on the right.',
            },
        },
    },
    render: () => (
        <ContextMenu items={NestedItems}>
            <div className="rounded-lg border border-dashed border-border bg-surface text-foreground p-12 text-sm select-none">
                Right-click here (try "Export" or "Move to")
            </div>
        </ContextMenu>
    ),
}

export const InsideACard: Story = {
    name: 'Wrapped around a real component',
    parameters: {
        docs: {
            description: {
                story:
                    'The entire React subtree under `<ContextMenu>` becomes the right-click target, wrap a card, a row, an image, anything.',
            },
        },
    },
    render: () => (
        <ContextMenu items={FlatItems}>
            <article className="rounded-lg bg-surface border border-border shadow-sm p-5 w-80">
                <h3 className="text-base font-semibold text-foreground">Vessel #142</h3>
                <p className="mt-1 text-sm text-foreground-secondary">
                    Right-click anywhere on this card to open the action menu.
                </p>
            </article>
        </ContextMenu>
    ),
}

export const Playground: Story = {
    args: { triggerLabel: 'Right-click me' },
    argTypes: { triggerLabel: { control: 'text' } },
    render: (args: { triggerLabel: string }) => (
        <ContextMenu items={FlatItems}>
            <div className="flex h-40 w-72 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-foreground-secondary">{args.triggerLabel}</div>
        </ContextMenu>
    ),
}
