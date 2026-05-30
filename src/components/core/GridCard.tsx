import React from 'react'
import Button from '../inputs/Button'

export interface GridCardItem {
    key: string | number
    title: React.ReactNode
    description?: React.ReactNode
    /** Image URL or JSX element */
    cover?: string | React.ReactNode
    enabled?: boolean
    /** Arbitrary route or payload — passed back to onOpen */
    to?: string
    [key: string]: any
}

export interface GridCardProps {
    item: GridCardItem
    buttonText?: string
    /** Called when the button is clicked. Receives the full item. */
    onOpen?: (item: GridCardItem) => void
    /** Extra classes merged onto the card root. */
    className?: string
    /** Inline style on the card root. */
    style?: React.CSSProperties
}

/**
 * Application card tile (grid layout).
 *
 * Decoupled from React Router — navigation is delegated to the `onOpen` prop.
 *
 * @example
 * <GridCard
 *   item={{ key: 'reports', title: 'Reports', enabled: true, to: '/reports' }}
 *   onOpen={({ to }) => navigate(to!)}
 * />
 */
export default function GridCard({ item, buttonText = 'Open Application', onOpen, className = '', style }: GridCardProps) {
    return (
        <div className={`flex flex-col w-[200px] h-[250px] rounded-lg bg-ice dark:bg-independence items-center justify-between p-2 shadow-2xl ${className}`.trim()} style={style}>
            <div className="text-prussian-blue dark:text-white text-lg font-bold text-center h-1/4">
                <h2>{item.title}</h2>
            </div>
            <div className="h-1/4 flex items-center justify-center">
                {typeof item.cover === 'string' ? (
                    <img src={item.cover} alt="Grid Card Cover" />
                ) : (
                    item.cover
                )}
            </div>
            <div className="text-prussian-blue text-sm dark:text-white text-center h-1/4">
                <p>{item.description}</p>
            </div>
            <div>
                <Button
                    disabled={!item.enabled}
                    style={{ width: 'max-content', padding: '0 8px', margin: '0' }}
                    content={buttonText}
                    onClick={() => onOpen?.(item)}
                />
            </div>
        </div>
    )
}
