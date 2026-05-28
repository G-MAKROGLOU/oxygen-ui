import type { ReactNode } from 'react'

export interface DropdownPillProps {
    value?: ReactNode
    hasSiblings?: boolean
}

/**
 * Pill chip used inside Dropdown to display selected values.
 */
export default function DropdownPill({ value, hasSiblings = false }: DropdownPillProps) {
    return (
        <div
            className={`bg-accent text-accent-fg text-sm text-ellipsis ${hasSiblings ? 'w-24' : 'w-max'} p-1 px-2 rounded-lg whitespace-nowrap overflow-hidden`}
        >
            {value}
        </div>
    )
}
