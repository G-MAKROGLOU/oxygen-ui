import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import VirtualList from './VirtualList'

const ITEMS = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))

describe('VirtualList', () => {
    it('mounts only a small window of rows, not the whole dataset', () => {
        render(
            <VirtualList
                items={ITEMS}
                rowHeight={40}
                height={400}
                getKey={(it) => it.id}
                renderItem={(it) => <div>{it.name}</div>}
            />,
        )
        const rows = screen.getAllByRole('listitem')
        // Windowed: far fewer than 1000 rows are in the DOM.
        expect(rows.length).toBeGreaterThan(0)
        expect(rows.length).toBeLessThan(100)
        expect(screen.getByText('Item 0')).toBeInTheDocument()
        expect(screen.queryByText('Item 500')).not.toBeInTheDocument()
    })

    it('renders the empty state when there are no items', () => {
        render(<VirtualList items={[]} rowHeight={40} renderItem={() => null} emptyState="Nothing here" />)
        expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('filters via the built-in search', () => {
        render(
            <VirtualList
                items={ITEMS}
                rowHeight={40}
                height={400}
                searchable
                searchKeys={['name']}
                getKey={(it) => it.id}
                renderItem={(it) => <div>{it.name}</div>}
            />,
        )
        fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: 'Item 742' } })
        expect(screen.getByText('Item 742')).toBeInTheDocument()
        expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
    })
})
