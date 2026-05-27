import React from 'react'
import Button from '../inputs/Button'
import { GridCardItem } from './GridCard'

export interface OpaqueGridCardProps {
    item: GridCardItem
    isRight?: boolean
    buttonText?: string
    onOpen?: (item: GridCardItem) => void
}

/**
 * Opaque carousel variant of GridCard (left or right edge of the carousel).
 *
 * Decoupled from React Router and ThemeContext.
 * Uses CSS `dark:` classes instead of `useTheme()`.
 *
 * @example
 * <OpaqueGridCard item={sideItem} isRight onOpen={({ to }) => navigate(to!)} />
 */
export default function OpaqueGridCard({
    item,
    isRight = false,
    buttonText = 'Open Application',
    onOpen,
}: OpaqueGridCardProps) {
    return (
        <div
            className={`flex flex-col w-[200px] h-[250px] rounded-lg items-center p-2 ${
                !isRight
                    ? 'opaque-carousel-card-left dark:opaque-carousel-card-dark-left'
                    : 'opaque-carousel-card-right dark:opaque-carousel-card-dark-right'
            }`}
        >
            <div
                className={`${
                    !isRight
                        ? 'opaque-carousel-card-text-right dark:opaque-carousel-card-text-dark-right'
                        : 'opaque-carousel-card-text-left dark:opaque-carousel-card-text-dark-left'
                } text-prussian-blue dark:text-white text-lg font-bold text-center h-1/4 select-none`}
            >
                <h2>{item.title}</h2>
            </div>
            <div className="h-1/4 flex items-center justify-center">
                {typeof item.cover === 'string' ? (
                    <img src={item.cover} alt="Grid Card Cover" />
                ) : (
                    item.cover
                )}
            </div>
            <div
                className={`${
                    !isRight
                        ? 'opaque-carousel-card-text-right dark:opaque-carousel-card-text-dark-right'
                        : 'opaque-carousel-card-text-left dark:opaque-carousel-card-text-dark-left'
                } text-prussian-blue dark:text-white text-center h-1/4 select-none text-sm`}
            >
                <p>{item.description}</p>
            </div>
            <div>
                <Button
                    style={{
                        width: 'max-content',
                        padding: '0 8px',
                        margin: '0',
                        background: !isRight
                            ? 'linear-gradient(90deg, #0353A4 6.29%, rgba(3, 83, 164, 0) 97.35%)'
                            : 'linear-gradient(270deg, #0353A4 3.97%, rgba(3, 83, 164, 0) 94.04%)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                    content={
                        <div
                            className={
                                !isRight
                                    ? 'opaque-carousel-card-text-dark-right'
                                    : 'opaque-carousel-card-text-dark-left'
                            }
                        >
                            {buttonText}
                        </div>
                    }
                    onClick={() => onOpen?.(item)}
                />
            </div>
        </div>
    )
}
