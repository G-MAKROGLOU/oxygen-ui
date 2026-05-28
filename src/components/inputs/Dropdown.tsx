import React, { useEffect, useId, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import SearchInput from './SearchInput'
import DropdownPill from './DropdownPill'

export interface DropdownItem {
    key: string | number
    label: React.ReactNode
    icon?: React.ReactNode
}

/**
 * Item key type — DOM-friendly subset of `React.Key` (no bigint, since UI
 * keys are always strings or numbers in practice).
 */
export type DropdownKey = string | number

/**
 * Selected value(s). In single-select mode this is a single key matching
 * one of the items. In multi-select mode it is an array of keys.
 */
export type DropdownValue = DropdownKey | DropdownKey[]

export interface DropdownProps {
    isMultiselect?: boolean
    hasSearch?: boolean
    label?: React.ReactNode
    name?: string
    value?: DropdownValue
    onChange?: (e: { target: { value: DropdownValue; id?: string; name?: string } }) => void
    onBlur?: React.FocusEventHandler
    disabled?: boolean
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    errorMessage?: React.ReactNode
    style?: React.CSSProperties
    htmlFor?: string
    items?: DropdownItem[]
    labelStyle?: React.CSSProperties
    placeholder?: string
}

/**
 * Select / multi-select dropdown powered by Radix Popover.
 *
 * Radix handles focus-trap within the popover, keyboard dismiss (Escape),
 * and correct portal-based z-index stacking.
 *
 * Emits `{ target: { value, id, name } }` for form-compatibility.
 *
 * @example
 * // Single-select
 * <Dropdown label="Vessel" items={vessels} value={form.vessel} onChange={handleChange} htmlFor="vessel" />
 *
 * // Multi-select
 * <Dropdown isMultiselect label="Fuels" items={fuels} value={form.fuels} onChange={handleChange} />
 */
export default function Dropdown({
    isMultiselect = false,
    hasSearch = true,
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
    labelStyle = {},
    placeholder,
}: DropdownProps) {
    const [open, setOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [innerItems, setInnerItems] = useState<DropdownItem[]>([])
    // Stable id for the error region so the combobox can point at it via
    // aria-describedby when validation fails.
    const errorId = useId()
    const hasError = errorMessage != null

    useEffect(() => {
        setInnerItems(items)
    }, [items])

    useEffect(() => {
        if (isMultiselect && Array.isArray(value)) {
            setSelectedItems(value)
        }
    }, [isMultiselect, value])

    const selectItem = (key: string | number) => {
        if (isMultiselect) {
            const next = selectedItems.includes(key)
                ? selectedItems.filter((it) => it !== key)
                : [...selectedItems, key]
            setSelectedItems(next)
            onChange?.({ target: { value: next, id: htmlFor, name } })
        } else {
            setSelectedItems([key])
            onChange?.({ target: { value: key, id: htmlFor, name } })
            setOpen(false)
        }
    }

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value
        setSearchTerm(term)
        setInnerItems(
            term.trim() === ''
                ? items
                : items.filter((it) =>
                      String(it.label).toLowerCase().includes(term.toLowerCase())
                  )
        )
    }

    const isSelected = (key: string | number) =>
        Array.isArray(value) ? value.includes(key) : value === key

    return (
        <div className="mt-2">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
            >
                {label && (
                    <label
                        className="text-sm font-medium ml-1 max-content select-none text-foreground"
                        htmlFor={htmlFor}
                        style={labelStyle}
                    >
                        {label}
                    </label>
                )}

                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Trigger asChild>
                        <div
                            id={htmlFor}
                            role="combobox"
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? errorId : undefined}
                            style={style}
                            className={`flex items-center justify-between relative h-9 rounded-lg border border-border cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${disabled ? 'cursor-not-allowed bg-surface-raised text-foreground-muted' : 'bg-surface text-foreground'} ${hasError ? 'border-status-error' : ''}`}
                            tabIndex={disabled ? -1 : 0}
                            onKeyDown={(e) => {
                                if (disabled) return
                                // Open on Enter, Space, ArrowDown, ArrowUp — the
                                // canonical combobox activation keys per WAI-ARIA.
                                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    setOpen(true)
                                }
                            }}
                        >
                            {/* Selected value(s) */}
                            <div
                                className={`h-7 pl-2 ${!style?.width ? 'min-w-[240px]' : ''} flex items-center gap-1 overflow-hidden`}
                            >
                                {!value || (Array.isArray(value) && value.length === 0) ? (
                                    <span className="text-foreground-muted text-sm">{placeholder}</span>
                                ) : Array.isArray(value) ? (
                                    <>
                                        {value.slice(0, 1).map((val) => (
                                            <DropdownPill
                                                key={String(val)}
                                                hasSiblings={value.length > 1}
                                                value={innerItems.find((it) => it.key === val)?.label}
                                            />
                                        ))}
                                        {value.length > 1 && <DropdownPill value={`+${value.length - 1} more`} />}
                                    </>
                                ) : (
                                    <DropdownPill value={innerItems.find((it) => it.key === value)?.label} />
                                )}
                            </div>

                            {/* Chevron — currentColor follows trigger text */}
                            <div className={`transition-transform duration-200 mr-2 ${open ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
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
                            className="bg-surface text-foreground border border-border rounded-lg shadow-md z-50 p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                            onInteractOutside={() => setOpen(false)}
                        >
                            {hasSearch && (
                                <div className="mb-2">
                                    <SearchInput
                                        style={{ width: '100%' }}
                                        inputStyle={{ width: '100%' }}
                                        value={searchTerm}
                                        onChange={onSearchChange}
                                        placeholder="Search..."
                                    />
                                </div>
                            )}
                            <div role="listbox" aria-multiselectable={isMultiselect} className="max-h-40 overflow-y-auto">
                                {innerItems.map((item) => (
                                    // aria-rowindex was previously set here but
                                    // it's invalid ARIA on role="option" (it
                                    // belongs on rows of a grid/treegrid). Dropped.
                                    // tabIndex={0} + Enter/Space handler makes the
                                    // option keyboard-activatable; the full
                                    // combobox roving-tabindex pattern is deferred
                                    // until the planned Phase-5 rewrite.
                                    <div
                                        key={item.key}
                                        role="option"
                                        aria-selected={isSelected(item.key)}
                                        tabIndex={0}
                                        className={`flex items-center justify-between p-2 hover:bg-accent hover:text-accent-fg transition-colors duration-150 text-sm rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                            selectedItems.includes(item.key) ? 'bg-surface-raised text-foreground' : 'text-foreground'
                                        }`}
                                        onClick={() => selectItem(item.key)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                selectItem(item.key)
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            {item.icon && <div>{item.icon}</div>}
                                            {item.label}
                                        </div>
                                        {isSelected(item.key) && (
                                            // currentColor — checkmark follows
                                            // the item's text colour, which
                                            // flips automatically on hover.
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                                <path
                                                    d="M4 10l4.5 4.5L16 6"
                                                    stroke="currentColor"
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
            {hasError && (
                <div id={errorId} className="text-center text-status-error text-xs mt-1">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
