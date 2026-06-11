import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import SearchInput from './SearchInput'
import Tag from './_tag'
import { fieldShell, FieldLabel } from './_field'

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
    /** Enable multi-select (value becomes an array of keys). */
    isMultiselect?: boolean
    /** Show a search box inside the dropdown panel. */
    hasSearch?: boolean
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** Controlled value. */
    value?: DropdownValue
    /** Fires when the value changes. */
    onChange?: (e: { target: { value: DropdownValue; id?: string; name?: string } }) => void
    /** Blur handler — useful for touched/validation timing. */
    onBlur?: React.FocusEventHandler
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Validation message — shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Inline style applied to the control shell. */
    style?: React.CSSProperties
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** The selectable items. */
    items?: DropdownItem[]
    /** Inline style applied to the label. */
    labelStyle?: React.CSSProperties
    /** Placeholder shown when the field is empty. */
    placeholder?: string
    /** Size preset. Default `'md'`. */
    size?: import('./_field').FieldSize
    /** Extra classes merged onto the component root. */
    className?: string
}

/**
 * Single-line tag row for multi-select values. Shows as many removable tag
 * chips as fit on one line, then collapses the remainder into a "+N more"
 * chip — so the trigger never grows in width OR height as the selection
 * changes.
 *
 * Sizing is measured off a hidden, off-layout copy of the full tag set (so the
 * widths are always available even after we've collapsed the visible row), and
 * recomputed via a ResizeObserver whenever the trigger width changes.
 */
function MultiTagRow({
    values,
    disabled,
    labelFor,
    onRemove,
}: {
    values: (string | number)[]
    disabled?: boolean
    labelFor: (key: string | number) => React.ReactNode
    onRemove: (key: string | number) => void
}) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const [visibleCount, setVisibleCount] = useState(values.length)

    const key = values.map(String).join('|')

    useLayoutEffect(() => {
        const wrap = wrapRef.current
        const measure = measureRef.current
        if (!wrap || !measure) return

        const GAP = 6 // gap-1.5 → 0.375rem

        const recompute = () => {
            const avail = wrap.clientWidth
            const tagEls = Array.from(measure.querySelectorAll<HTMLElement>('[data-mt]'))
            const moreEl = measure.querySelector<HTMLElement>('[data-mm]')
            const widths = tagEls.map((e) => e.offsetWidth)
            const moreW = moreEl ? moreEl.offsetWidth : 0
            if (widths.length === 0) { setVisibleCount(0); return }

            // How many tags fit with no "+N more" chip?
            let used = 0
            let count = 0
            for (let i = 0; i < widths.length; i++) {
                const w = widths[i] + (i > 0 ? GAP : 0)
                if (used + w <= avail) { used += w; count++ } else break
            }

            // If some are hidden, reserve room for the "+N more" chip and
            // shrink the visible count until tags + chip fit.
            if (count < widths.length) {
                while (count > 0) {
                    let t = 0
                    for (let i = 0; i < count; i++) t += widths[i] + (i > 0 ? GAP : 0)
                    t += GAP + moreW
                    if (t <= avail) break
                    count--
                }
            }
            setVisibleCount(count)
        }

        recompute()
        const ro = new ResizeObserver(recompute)
        ro.observe(wrap)
        return () => ro.disconnect()
    }, [key])

    const hidden = values.length - visibleCount
    const moreChip = (n: number) => (
        <span className="inline-flex items-center flex-shrink-0 rounded-md border border-border bg-surface-raised text-foreground-secondary text-xs px-2 py-0.5">
            +{n} more
        </span>
    )

    return (
        <div ref={wrapRef} className="relative flex-1 min-w-0 flex flex-nowrap items-center gap-1.5 overflow-hidden">
            {/* Hidden measuring copy — full set + a sample more chip. Off-layout
                so it never affects the trigger size, but measurable. */}
            <div
                ref={measureRef}
                aria-hidden="true"
                className="absolute invisible pointer-events-none flex flex-nowrap items-center gap-1.5"
                style={{ left: -9999, top: -9999 }}
            >
                {values.map((val) => (
                    <span data-mt key={`m-${val}`}>
                        <Tag removeLabel="x" onRemove={() => {}}>{labelFor(val)}</Tag>
                    </span>
                ))}
                <span data-mm>{moreChip(values.length)}</span>
            </div>

            {/* Visible row */}
            {values.slice(0, visibleCount).map((val) => (
                <Tag
                    key={String(val)}
                    disabled={disabled}
                    removeLabel={`Remove ${labelFor(val)}`}
                    onRemove={() => onRemove(val)}
                >
                    {labelFor(val)}
                </Tag>
            ))}
            {hidden > 0 && moreChip(hidden)}
        </div>
    )
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
    helperText,
    required,
    errorMessage,
    style = {},
    htmlFor,
    items = [],
    labelStyle = {},
    placeholder,
    size = 'md',
    className = '',
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

    // Remove a selected value via its tag's × button. In multi-select this
    // toggles the option off; in single-select it clears the field.
    const removeSelected = (key: string | number) => {
        if (isMultiselect) {
            const next = selectedItems.filter((it) => it !== key)
            setSelectedItems(next)
            onChange?.({ target: { value: next, id: htmlFor, name } })
        } else {
            setSelectedItems([])
            onChange?.({ target: { value: '', id: htmlFor, name } })
        }
    }

    const labelFor = (key: string | number) => innerItems.find((it) => it.key === key)?.label ?? String(key)

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
        <div className={className || undefined}>
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col gap-1.5' : 'flex-row items-start gap-3'}`}
            >
                <FieldLabel
                    label={label}
                    htmlFor={htmlFor}
                    required={required}
                    helperText={helperText}
                    horizontal={layout === 'horizontal'}
                    style={labelStyle}
                />

                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Trigger asChild>
                        <div
                            id={htmlFor}
                            role="combobox"
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? errorId : undefined}
                            // A definite width keeps the trigger from shrink-
                            // wrapping to its tags — the selection count changes
                            // what's shown, never the box size. Override via
                            // `style={{ width: '100%' }}` to fill a container.
                            style={{ width: 240, ...style }}
                            className={`flex items-center justify-between gap-2 cursor-pointer select-none min-h-[36px] px-3 py-1.5 ${fieldShell({ size, hasError, disabled, sized: false })}`}
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
                            {/* Selected value(s) — rendered as removable tags.
                                Clicking a tag's × deselects (multi) or clears
                                (single). The × calls stopPropagation so it
                                doesn't toggle the popover. Multi-select collapses
                                overflow into a "+N more" chip on a single line. */}
                            {!value || (Array.isArray(value) && value.length === 0) ? (
                                <span className="flex-1 min-w-0 truncate text-foreground-muted text-sm">{placeholder}</span>
                            ) : Array.isArray(value) ? (
                                <MultiTagRow
                                    values={value}
                                    disabled={disabled}
                                    labelFor={labelFor}
                                    onRemove={removeSelected}
                                />
                            ) : (
                                <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                                    <Tag
                                        disabled={disabled}
                                        removeLabel={`Remove ${labelFor(value)}`}
                                        onRemove={() => removeSelected(value)}
                                    >
                                        {labelFor(value)}
                                    </Tag>
                                </div>
                            )}

                            {/* Chevron — currentColor follows trigger text */}
                            <div className={`flex-shrink-0 text-foreground-muted transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true">
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </Popover.Trigger>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            collisionPadding={8}
                            style={{ width: style?.width || 240 }}
                            className="bg-surface text-foreground border border-border rounded-lg shadow-md z-popover p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
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
                <div id={errorId} className="text-status-error text-xs mt-1">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
