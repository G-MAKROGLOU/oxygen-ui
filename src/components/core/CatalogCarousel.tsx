import React, { useEffect, useMemo, useRef, useState } from 'react'
import GridCard, { GridCardItem } from './GridCard'
import OpaqueGridCard from './OpaqueGridCard'
import COLORS from '../../utils/colors'

export interface CatalogCarouselProps {
    items: GridCardItem[]
    buttonText?: string
    onOpen?: (item: GridCardItem) => void
    /** Extra classes merged onto the carousel root. */
    className?: string
}

/**
 * Three-card carousel (previous → active (scaled) → next).
 *
 * Decoupled from ThemeContext — uses CSS `dark:` classes.
 */
export default function CatalogCarousel({ items, buttonText, onOpen, className = '' }: CatalogCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [indexPool, setIndexPool] = useState<number[]>([])
    const cardRefs = useRef<{ cardIndex: number; ref: HTMLDivElement }[]>([])

    const getIndexes = useMemo(() => {
        let nextIndex = activeIndex + 1
        let previousIndex = activeIndex - 1
        if (activeIndex === 0) previousIndex = items.length - 1
        if (activeIndex === items.length - 1) nextIndex = 0
        return { previousIndex, nextIndex }
    }, [activeIndex, items.length])

    useEffect(() => {
        const { nextIndex, previousIndex } = getIndexes
        let indexes = [previousIndex, activeIndex, nextIndex]
        if (activeIndex !== 0 && activeIndex !== items.length - 1) {
            indexes = [...indexes].sort((a, b) => a - b)
        }
        setIndexPool(indexes)

        const timeouts: ReturnType<typeof setTimeout>[] = []
        cardRefs.current.forEach(({ cardIndex, ref }) => {
            if (cardIndex !== 1) {
                ref.classList.remove('animate-in')
                const t = setTimeout(() => ref.classList.add('animate-in'), 50)
                timeouts.push(t)
            }
            if (cardIndex === 1) {
                ref.classList.remove('scale-125')
                const t2 = setTimeout(() => {
                    if (cardIndex === 1) ref.classList.add('scale-125')
                }, 100)
                timeouts.push(t2)
            }
        })
        return () => timeouts.forEach(clearTimeout)
    }, [activeIndex, getIndexes, items.length])

    const nextApp = () =>
        setActiveIndex((prev) => (prev + 1 === items.length ? 0 : prev + 1))

    const previousApp = () =>
        setActiveIndex((prev) => (prev - 1 === -1 ? items.length - 1 : prev - 1))

    return (
        <div className={`flex items-center justify-center w-full h-full ${className}`.trim()}>
            <div className="flex items-center gap-10">
                <button
                    type="button"
                    onClick={previousApp}
                    aria-label="Previous"
                    className="cursor-pointer rounded-lg transition-all duration-300 hover:bg-ice-dark dark:hover:bg-independence rotate-180"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-10 w-10 dark:stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div className="flex">
                    {indexPool.map((index, id) => {
                        const item = items[index]
                        if (!item) return null
                        return id === 1 ? (
                            <div
                                key={id}
                                ref={(ref) => {
                                    if (cardRefs.current.length < 3 && ref)
                                        cardRefs.current.push({ cardIndex: id, ref })
                                }}
                                className="transition-all duration-300 scale-125 z-10 shadow-2xl rounded-lg"
                            >
                                <GridCard item={item} buttonText={buttonText} onOpen={onOpen} />
                            </div>
                        ) : (
                            <div
                                key={id}
                                ref={(ref) => {
                                    if (cardRefs.current.length < 3 && ref)
                                        cardRefs.current.push({ cardIndex: id, ref })
                                }}
                                className="transition-all duration-300 shadow-2xl rounded-lg"
                            >
                                <OpaqueGridCard item={item} isRight={id === 2} buttonText={buttonText} onOpen={onOpen} />
                            </div>
                        )
                    })}
                </div>

                <button
                    type="button"
                    onClick={nextApp}
                    aria-label="Next"
                    className="cursor-pointer rounded-lg transition-all duration-300 hover:bg-ice-dark dark:hover:bg-independence"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-10 w-10 dark:stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
