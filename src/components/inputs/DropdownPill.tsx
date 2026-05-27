export interface DropdownPillProps {
    value?: React.ReactNode
    hasSiblings?: boolean
}

/**
 * Pill chip used inside Dropdown to display selected values.
 */
export default function DropdownPill({ value, hasSiblings = false }: DropdownPillProps) {
    return (
        <div
            className={`bg-prussian-blue text-white text-sm text-ellipsis ${hasSiblings ? 'w-24' : 'w-max'} p-1 rounded-lg whitespace-nowrap overflow-hidden`}
        >
            {value}
        </div>
    )
}
