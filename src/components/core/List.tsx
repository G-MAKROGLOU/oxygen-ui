import React from 'react'

export interface ListItem {
    key: string | number
    label: React.ReactNode
    [key: string]: any
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
                <div
                    key={item.key}
                    role="option"
                    aria-selected={activeKey === item.key}
                    className={`hover:bg-ice-dark dark:hover:bg-independence cursor-pointer p-3 border-b border-b-ice-dark dark:border-b-independence transition-all duration-300 ${
                        activeKey === item.key ? 'bg-ice-dark dark:bg-independence' : ''
                    }`}
                    onClick={() => onItemClick(item)}
                >
                    {item.label}
                </div>
            ))}
        </div>
    )
}
