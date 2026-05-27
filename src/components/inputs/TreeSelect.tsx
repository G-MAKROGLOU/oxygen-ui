import React, { useEffect, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import DropdownPill from './DropdownPill'
import COLORS from '../../utils/colors'

export interface TreeSelectItem {
    key: string | number
    label: React.ReactNode
    icon?: React.ReactNode
}

export interface TreeSelectProps {
    hasSearch?: boolean
    label?: React.ReactNode
    name?: string
    value?: any
    onChange?: (e: { target: { value: any; id?: string; name?: string } }) => void
    onBlur?: React.FocusEventHandler
    disabled?: boolean
    /** 'horizontal' | 'vertical' */
    layout?: string
    errorMessage?: React.ReactNode
    style?: React.CSSProperties
    htmlFor?: string
    items?: TreeSelectItem[]
}

/**
 * Single-value select with a flat list, powered by Radix Popover.
 * Functionally similar to Dropdown (single-select only).
 *
 * @example
 * <TreeSelect label="Fleet" items={fleets} value={form.fleet} onChange={handleChange} htmlFor="fleet" />
 */
export default function TreeSelect({
    label,
    name,
    value,
    onChange,
    disabled,
    layout = 'horizontal',
    errorMessage,
    style = {},
    htmlFor,
    items = [],
}: TreeSelectProps) {
    const [open, setOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | number | null>(null)
    const [innerItems, setInnerItems] = useState<TreeSelectItem[]>([])

    useEffect(() => {
        setInnerItems(items)
    }, [items])

    const selectItem = (key: string | number) => {
        onChange?.({ target: { value: key, id: htmlFor, name } })
        setOpen(false)
    }

    return (
        <div className="mt-2">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
            >
                {label && (
                    <label
                        className="text-md font-bold ml-1 max-content select-none text-prussian-blue dark:text-white"
                        htmlFor={htmlFor}
                    >
                        {label}
                    </label>
                )}

                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Trigger asChild>
                        <div
                            id={htmlFor}
                            style={style}
                            role="combobox"
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            className={`flex items-center justify-between relative h-9 rounded-lg p-2 cursor-pointer ${disabled ? 'cursor-not-allowed bg-disabled' : 'bg-white'}`}
                            tabIndex={disabled ? -1 : 0}
                        >
                            {/* Value display */}
                            <div className={`h-7 ${!style?.width ? 'min-w-[240px]' : ''} focus:outline-none text-prussian-blue flex items-center gap-1`}>
                                {Array.isArray(value) ? (
                                    <>
                                        {value.slice(0, 1).map((val, id) => (
                                            <DropdownPill
                                                key={id}
                                                hasSiblings={value.length > 1}
                                                value={innerItems.find((it) => it.key === val)?.label}
                                            />
                                        ))}
                                        {value.length > 1 && <DropdownPill value={`+${value.length - 1} more`} />}
                                    </>
                                ) : value != null ? (
                                    <DropdownPill value={innerItems.find((it) => it.key === value)?.label} />
                                ) : null}
                            </div>

                            {/* Chevron */}
                            <div className={`transition-transform duration-300 ml-2 ${open ? 'rotate-180' : 'rotate-0'}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </Popover.Trigger>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            style={{ width: style?.width || 240 }}
                            className="bg-ice rounded-lg shadow-md z-50 p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                        >
                            <div role="listbox" className="max-h-40 overflow-y-auto">
                                {innerItems.map((item, idx) => (
                                    <div
                                        key={item.key}
                                        role="option"
                                        aria-selected={value === item.key}
                                        aria-rowindex={idx}
                                        className={`flex items-center justify-between p-2 hover:bg-prussian-blue hover:text-white transition-all duration-150 text-sm text-prussian-blue rounded-lg cursor-pointer`}
                                        onClick={() => selectItem(item.key)}
                                        onMouseEnter={() => setHoveredItem(item.key)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            {item.icon && <div>{item.icon}</div>}
                                            {item.label}
                                        </div>
                                        {value === item.key && (
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                <path
                                                    d="M4 10l4.5 4.5L16 6"
                                                    stroke={hoveredItem === item.key ? '#fff' : COLORS.PALETTE['prussian-blue']}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </div>
            <div className="text-center text-error dark:text-prussian-blue min-h-0">{errorMessage}</div>
        </div>
    )
}
