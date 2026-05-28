import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TreeSelect from './TreeSelect'
import type { TreeSelectNode } from './TreeSelect'

const TREE: TreeSelectNode[] = [
    { key: 'eu', label: 'Europe', children: [
        { key: 1, label: 'Aegean Fleet' },
        { key: 2, label: 'Adriatic Fleet' },
    ]},
    { key: 7, label: 'Americas Fleet' },
]

function Harness(props: React.ComponentProps<typeof TreeSelect> & { onSelect?: (v: string | number) => void }) {
    const [v, setV] = useState<string | number | null>(props.value ?? null)
    return (
        <TreeSelect
            {...props}
            value={v}
            onChange={({ target }) => {
                setV(target.value)
                props.onSelect?.(target.value)
            }}
        />
    )
}

describe('TreeSelect', () => {
    // ── Trigger ────────────────────────────────────────────────────────────

    it('renders the placeholder when no value', () => {
        render(<Harness items={TREE} placeholder="Pick one" />)
        expect(screen.getByText('Pick one')).toBeInTheDocument()
    })

    it('renders the selected node label when value matches a leaf', () => {
        render(<Harness items={TREE} value={1} defaultExpandedKeys={['eu']} />)
        // Trigger button shows the leaf's label
        const triggers = screen.getAllByText('Aegean Fleet')
        expect(triggers.length).toBeGreaterThan(0)
    })

    // ── Opening + expand/collapse ──────────────────────────────────────────

    it('opens the popover and renders top-level items', () => {
        render(<Harness items={TREE} />)
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.getByText('Europe')).toBeInTheDocument()
        expect(screen.getByText('Americas Fleet')).toBeInTheDocument()
        // Children are hidden until expanded
        expect(screen.queryByText('Aegean Fleet')).toBeNull()
    })

    it('expands a branch when its chevron is clicked', () => {
        render(<Harness items={TREE} />)
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
        expect(screen.getByText('Aegean Fleet')).toBeInTheDocument()
    })

    it('honours defaultExpandedKeys on open', () => {
        render(<Harness items={TREE} defaultExpandedKeys={['eu']} />)
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.getByText('Aegean Fleet')).toBeInTheDocument()
    })

    // ── Selection ──────────────────────────────────────────────────────────

    it('fires onChange when a leaf is selected', () => {
        const onSelect = vi.fn()
        render(<Harness items={TREE} defaultExpandedKeys={['eu']} onSelect={onSelect} />)
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Aegean Fleet'))
        expect(onSelect).toHaveBeenCalledWith(1)
    })

    it('does NOT fire onChange when parentsSelectable=false and a parent is clicked', () => {
        const onSelect = vi.fn()
        render(<Harness items={TREE} parentsSelectable={false} onSelect={onSelect} />)
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Europe'))
        expect(onSelect).not.toHaveBeenCalled()
        // Clicking the parent toggles expand
        expect(screen.getByText('Aegean Fleet')).toBeInTheDocument()
    })

    // ── ARIA hygiene ───────────────────────────────────────────────────────

    it('renders treeitems with aria-selected and aria-expanded', () => {
        render(<Harness items={TREE} value={1} defaultExpandedKeys={['eu']} />)
        fireEvent.click(screen.getByRole('combobox'))
        const items = screen.getAllByRole('treeitem')
        // 'Europe' has children → aria-expanded='true'
        const europe = items.find((i) => i.textContent?.includes('Europe'))
        expect(europe).toHaveAttribute('aria-expanded', 'true')
        // 'Aegean Fleet' is the selected leaf → aria-selected='true'
        const aegean = items.find((i) => i.textContent?.includes('Aegean Fleet'))
        expect(aegean).toHaveAttribute('aria-selected', 'true')
    })

    // ── Error region a11y ──────────────────────────────────────────────────

    it('links aria-describedby to the error region when errorMessage is present', () => {
        render(<Harness items={TREE} errorMessage="required" />)
        const trigger = screen.getByRole('combobox')
        expect(trigger).toHaveAttribute('aria-invalid', 'true')
        const errId = trigger.getAttribute('aria-describedby')
        expect(errId).toBeTruthy()
        expect(document.getElementById(errId!)).toHaveTextContent('required')
    })

    // ── Disabled ───────────────────────────────────────────────────────────

    it('does not open when disabled', () => {
        render(<Harness items={TREE} disabled />)
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.queryByText('Europe')).toBeNull()
    })
})
