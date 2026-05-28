import React from 'react'

export interface ListItem {
    key: string | number
    label: React.ReactNode
}

export interface ListProps {
    items: ListItem[]
    onItemClick: (item: ListItem) => void
    activeKey?: string | number
}

/**
 * Vertical clickable list with active-item highlight.
 *
 * @example
 * <List
 *   items={vessels.map(v => ({ key: v.imo, label: v.name }))}
 *   activeKey={selectedImo}
 *   onItemClick={(item) => setSelected(item.key)}
 * />
 */
export default function List({ items, onItemClick, activeKey }: ListProps) {
    return (
        <div role="listbox">
            {items.map((item) => (
                // tabIndex + Enter/Space onKeyDown makes each option
                // keyboard-activatable. Previously the items were only mouse-
                // clickable — keyboard-only users couldn't select anything.
                <div
                    key={item.key}
                    role="option"
                    aria-selected={activeKey === item.key}
                    tabIndex={0}
                    className={`hover:bg-ice-dark dark:hover:bg-independence cursor-pointer p-3 border-b border-b-ice-dark dark:border-b-independence transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        activeKey === item.key ? 'bg-ice-dark dark:bg-independence' : ''
                    }`}
                    onClick={() => onItemClick(item)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onItemClick(item)
                        }
                    }}
                >
                    {item.label}
                </div>
            ))}
        </div>
    )
}
