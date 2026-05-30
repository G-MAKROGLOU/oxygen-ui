import React from 'react'
import GridCard, { GridCardItem } from './GridCard'

export interface CatalogGridProps {
    items: GridCardItem[]
    buttonText?: string
    onOpen?: (item: GridCardItem) => void
    /** Extra classes merged onto the grid root. */
    className?: string
}

/**
 * Wrapping flex grid of `GridCard` tiles.
 */
export default function CatalogGrid({ items, buttonText, onOpen, className = '' }: CatalogGridProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
            {items.map((item) => (
                <GridCard key={item.key} item={item} buttonText={buttonText} onOpen={onOpen} />
            ))}
        </div>
    )
}
