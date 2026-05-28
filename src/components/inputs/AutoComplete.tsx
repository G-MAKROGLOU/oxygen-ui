import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import COLORS from '../../utils/colors'

export interface AutoCompleteItem {
    key: string
    value: string
    label: string
    icon?: React.ReactNode
}

export interface AutoCompleteProps {
    disabled?: boolean
    label?: React.ReactNode
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    items?: AutoCompleteItem[]
    onItemClick?: (value: string) => void
    /** Custom "empty" message */
    emptyText?: string
}

/**
 * Search-as-you-type autocomplete powered by Radix Popover.
 *
 * The popover opens when the input is focused and closes when an item is
 * selected or the user clicks away. Radix handles portal-based z-stacking.
 *
 * @example
 * <AutoComplete
 *   label="Vessel"
 *   items={vessels.map(v => ({ key: v.imo, value: v.imo, label: v.name }))}
 *   onItemClick={(imo) => setVessel(imo)}
 * />
 */
export default function AutoComplete({
    disabled,
    label,
    placeholder,
    name,
    inputStyle,
    style,
    layout = 'vertical',
    items = [],
    onItemClick,
    emptyText = 'No results found',
}: AutoCompleteProps) {
    const [term, setTerm] = useState('')
    const [open, setOpen] = useState(false)

    const foundItems = term.trim()
        ? items.filter(
              ({ key, label }) =>
                  label.toLowerCase().includes(term.toLowerCase()) ||
                  key.toLowerCase().includes(term.toLowerCase())
          )
        : []

    const handleSelect = (item: AutoCompleteItem) => {
        setTerm(`${item.label} (${item.value})`)
        onItemClick?.(item.value)
        setOpen(false)
    }

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
                style={style ?? {}}
            >
                {label && (
                    <label className="text-lg font-bold ml-1 max-content text-prussian-blue dark:text-white">
                        {label}
                    </label>
                )}

                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Anchor asChild>
                        <div className="bg-white flex items-center gap-1 rounded-lg pr-2">
                            <input
                                disabled={disabled}
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value)
                                    setOpen(true)
                                }}
                                onFocus={() => setOpen(true)}
                                type="text"
                                name={name}
                                className="focus:outline-none pl-2 h-9 w-56 outline-offset-2 text-prussian-blue mt-1 rounded-lg disabled:bg-disabled disabled:cursor-not-allowed"
                                style={inputStyle ?? {}}
                                placeholder={placeholder ?? ''}
                                autoComplete="off"
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                aria-autocomplete="list"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={COLORS.PALETTE['prussian-blue']} className="w-5 h-5 flex-shrink-0">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </Popover.Anchor>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            className="w-64 bg-ice dark:bg-midnight-green-eagle-900 rounded-lg mt-1 shadow-md z-50 overflow-y-auto max-h-36 animate-in fade-in-0 zoom-in-95"
                        >
                            {foundItems.length === 0 ? (
                                <div className="h-full w-full flex flex-col items-center justify-center py-4 text-sm text-prussian-blue dark:text-white">
                                    {emptyText}
                                </div>
                            ) : (
                                <div role="listbox">
                                    {foundItems.map((item) => (
                                        // tabIndex + Enter/Space onKeyDown
                                        // makes each option keyboard-activatable.
                                        // Full roving-tabindex / arrow-key nav
                                        // is deferred to the Phase-5 rewrite.
                                        <div
                                            key={item.key}
                                            role="option"
                                            tabIndex={0}
                                            className="text-sm flex items-center gap-2 p-2 transition-all duration-150 hover:bg-ice-dark dark:hover:bg-prussian-blue cursor-pointer text-prussian-blue dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                            onClick={() => handleSelect(item)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleSelect(item)
                                                }
                                            }}
                                        >
                                            {item.icon}
                                            <span>
                                                {item.label} ({item.value})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </div>
        </div>
    )
}
