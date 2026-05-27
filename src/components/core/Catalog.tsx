import React from 'react'
import CatalogGrid from './CatalogGrid'
import CatalogCarousel from './CatalogCarousel'
import { GridCardItem } from './GridCard'

export interface CatalogProps {
    /** 'grid' | 'carousel' */
    display?: 'grid' | 'carousel'
    items?: GridCardItem[]
    buttonText?: string
    onOpen?: (item: GridCardItem) => void
}

/**
 * Switches between grid and carousel layouts for a list of application tiles.
 *
 * @example
 * <Catalog display="carousel" items={apps} onOpen={({ to }) => navigate(to!)} />
 */
export default function Catalog({ display = 'grid', items = [], buttonText, onOpen }: CatalogProps) {
    return (
        <div className="w-full h-full">
            {display === 'grid' ? (
                <CatalogGrid items={items} buttonText={buttonText} onOpen={onOpen} />
            ) : (
                <CatalogCarousel items={items} buttonText={buttonText} onOpen={onOpen} />
            )}
        </div>
    )
}
