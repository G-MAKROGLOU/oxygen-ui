import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Button, { type ButtonProps } from '../inputs/Button'

export interface MenuButtonItem {
    /** Stable key. */
    key: string | number
    /** Row label. */
    label: React.ReactNode
    /** Leading icon. */
    icon?: React.ReactNode
    /** Fired on select (click / Enter / Space). */
    onSelect?: () => void
    disabled?: boolean
    /** Destructive styling (red). */
    danger?: boolean
    /** Render a divider above this item. */
    separatorBefore?: boolean
}

export interface MenuButtonProps {
    /** Trigger label. */
    label?: React.ReactNode
    /** The menu rows. */
    items: MenuButtonItem[]
    /** Trigger button variant. Default `'secondary'`. */
    variant?: ButtonProps['variant']
    /** Trigger button size. Default `'md'`. */
    size?: ButtonProps['size']
    /** Leading icon on the trigger. */
    icon?: React.ReactNode
    /** Hide the trailing chevron. */
    hideChevron?: boolean
    disabled?: boolean
    /** Menu alignment to the trigger. Default `'start'`. */
    align?: 'start' | 'center' | 'end'
    /** Side to open on. Default `'bottom'`. */
    side?: 'top' | 'right' | 'bottom' | 'left'
    className?: string
}

const Chevron = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-150 group-data-[state=open]:rotate-180"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
)

/**
 * A {@link Button} that opens a dropdown menu of actions, built on Radix
 * DropdownMenu (full keyboard nav, focus management, typeahead, and ARIA).
 * Pass the rows as `items`; the trailing chevron flips while the menu is open.
 *
 * @example
 * <MenuButton
 *   label="Actions"
 *   items={[
 *     { key: 'edit', label: 'Edit', icon: <EditIcon />, onSelect: edit },
 *     { key: 'dup', label: 'Duplicate', onSelect: duplicate },
 *     { key: 'del', label: 'Delete', danger: true, separatorBefore: true, onSelect: remove },
 *   ]}
 * />
 */
export default function MenuButton({
    label,
    items,
    variant = 'secondary',
    size = 'md',
    icon,
    hideChevron = false,
    disabled,
    align = 'start',
    side = 'bottom',
    className = '',
}: MenuButtonProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    icon={icon}
                    disabled={disabled}
                    className={`group ${className}`.trim()}
                    content={
                        <span className="inline-flex items-center gap-1.5">
                            {label}
                            {!hideChevron && <Chevron />}
                        </span>
                    }
                />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align={align}
                    side={side}
                    sideOffset={6}
                    collisionPadding={8}
                    className={[
                        'z-[400] min-w-[10rem] rounded-lg border border-border bg-surface p-1 shadow-lg',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    ].join(' ')}
                >
                    {items.map((item) => (
                        <React.Fragment key={item.key}>
                            {item.separatorBefore && <DropdownMenu.Separator className="my-1 h-px bg-border" />}
                            <DropdownMenu.Item
                                disabled={item.disabled}
                                onSelect={() => item.onSelect?.()}
                                className={[
                                    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm outline-none cursor-pointer select-none transition-colors',
                                    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                                    item.danger
                                        ? 'text-status-error data-[highlighted]:bg-status-error/10'
                                        : 'text-foreground data-[highlighted]:bg-surface-raised',
                                ].join(' ')}
                            >
                                {item.icon && <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{item.icon}</span>}
                                <span className="flex-1 truncate">{item.label}</span>
                            </DropdownMenu.Item>
                        </React.Fragment>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
