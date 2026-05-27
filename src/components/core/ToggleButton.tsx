import React from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

export interface ToggleItem {
    key: string
    label?: React.ReactNode
    icon?: React.ReactNode
}

export interface ToggleButtonProps {
    items: ToggleItem[]
    onChange: (key: string) => void
    activeKey: string
}

/**
 * Segmented toggle-button group powered by Radix ToggleGroup.
 *
 * Radix handles keyboard navigation (arrow keys), focus ring, and
 * `role="group"` / `aria-pressed` ARIA attributes.
 *
 * @example
 * <ToggleButton
 *   items={[
 *     { key: 'grid', icon: <Icon.Grid /> },
 *     { key: 'list', icon: <Icon.List /> },
 *   ]}
 *   activeKey={view}
 *   onChange={setView}
 * />
 */
export default function ToggleButton({ items, onChange, activeKey }: ToggleButtonProps) {
    return (
        <ToggleGroup.Root
            type="single"
            value={activeKey}
            onValueChange={(val) => {
                // Radix passes '' when user clicks the already-selected item → keep current
                if (val) onChange(val)
            }}
            className="flex items-center"
        >
            {items.map((item, index) => (
                <ToggleGroup.Item
                    key={item.key}
                    value={item.key}
                    aria-label={typeof item.label === 'string' ? item.label : item.key}
                    className={[
                        index === 0 && 'rounded-l-lg border-r border-ice-dark',
                        index === items.length - 1 && 'rounded-r-lg border-l border-ice-dark dark:border-manatee',
                        'p-2 cursor-pointer transition-all duration-300',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-usafa-blue',
                        'bg-ice dark:bg-manatee hover:bg-ice-dark dark:hover:bg-black-coral',
                        'data-[state=on]:bg-ice-dark dark:data-[state=on]:bg-indigo-dye',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {item.icon ?? item.label}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup.Root>
    )
}
