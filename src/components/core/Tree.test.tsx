import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Tree, { TreeNode } from './Tree'

const LEAF_NODES: TreeNode[] = [
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Beta' },
]

const NESTED_NODES: TreeNode[] = [
    {
        key: 'parent',
        label: 'Parent node',
        children: [
            { key: 'child-1', label: 'Child one',  parentLabel: 'Parent node' },
            { key: 'child-2', label: 'Child two',  parentLabel: 'Parent node' },
        ],
    },
    { key: 'leaf', label: 'Standalone leaf' },
]

describe('Tree', () => {
    // ── Rendering ─────────────────────────────────────────────────────────

    it('renders all leaf node labels', () => {
        render(<Tree nodes={LEAF_NODES} onNodeClick={vi.fn()} />)
        expect(screen.getByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('Beta')).toBeInTheDocument()
    })

    it('renders parent label', () => {
        render(<Tree nodes={NESTED_NODES} onNodeClick={vi.fn()} defaultExpandAll />)
        expect(screen.getByText('Parent node')).toBeInTheDocument()
    })

    it('renders child labels when expanded', () => {
        render(<Tree nodes={NESTED_NODES} onNodeClick={vi.fn()} defaultExpandAll />)
        expect(screen.getByText('Child one')).toBeInTheDocument()
        expect(screen.getByText('Child two')).toBeInTheDocument()
    })

    it('renders an empty tree without crashing', () => {
        const { container } = render(<Tree nodes={[]} onNodeClick={vi.fn()} />)
        expect(container.firstChild).toBeInTheDocument()
    })

    // ── Leaf click ────────────────────────────────────────────────────────

    it('calls onNodeClick with correct payload for a leaf', () => {
        const handler = vi.fn()
        render(<Tree nodes={LEAF_NODES} onNodeClick={handler} />)
        fireEvent.click(screen.getByText('Alpha'))
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'a', label: 'Alpha', isParent: false })
        )
    })

    it('calls onNodeClick only once per click', () => {
        const handler = vi.fn()
        render(<Tree nodes={LEAF_NODES} onNodeClick={handler} />)
        fireEvent.click(screen.getByText('Beta'))
        expect(handler).toHaveBeenCalledTimes(1)
    })

    // ── Parent click ──────────────────────────────────────────────────────

    it('calls onNodeClick with isParent=true when parent label is clicked', () => {
        const handler = vi.fn()
        render(<Tree nodes={NESTED_NODES} onNodeClick={handler} defaultExpandAll />)
        fireEvent.click(screen.getByText('Parent node'))
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'parent', isParent: true })
        )
    })

    // ── defaultExpandedKeys ───────────────────────────────────────────────

    it('expands specific keys via defaultExpandedKeys', () => {
        render(
            <Tree
                nodes={NESTED_NODES}
                onNodeClick={vi.fn()}
                defaultExpandedKeys={['parent']}
            />
        )
        expect(screen.getByText('Child one')).toBeInTheDocument()
    })
})

describe('Tree deep-nesting indentation (regression)', () => {
    // 7 levels: Vessels → group → fleet → class → vessel → mode → report-type.
    // Depth-based inline padding used to stack on top of the per-level ml-3.5
    // wrapper, pushing deep leaves past the panel edge (clipped by
    // overflow-hidden). Indentation must come from nesting alone.
    const deep = (level: number): TreeNode =>
        level === 7
            ? { key: `n${level}`, label: `Node ${level}` }
            : { key: `n${level}`, label: `Node ${level}`, children: [deep(level + 1)] }

    it('applies no inline left padding at any depth', () => {
        render(<Tree nodes={[deep(1)]} onNodeClick={vi.fn()} defaultExpandAll />)

        const leaf = screen.getByText('Node 7').closest('button')!
        expect(leaf.style.paddingLeft).toBe('')

        // No element in the deepest leaf's ancestry carries inline paddingLeft
        let el: HTMLElement | null = leaf
        while (el) {
            expect(el.style.paddingLeft).toBe('')
            el = el.parentElement
        }
    })
})
