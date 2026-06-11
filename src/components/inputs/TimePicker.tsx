import React, { useId, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Field, fieldShell, type FieldSize } from './_field'

export interface TimePickerProps {
    /** Value as `"HH:mm"` (24h) or `"HH:mm:ss"`. `null`/`undefined` = unset. */
    value?: string | null
    /** Fires when the value changes. */
    onChange?: (value: string | null) => void
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** Placeholder shown when the field is empty. */
    placeholder?: string
    /** Label/control orientation: 'horizontal' or 'vertical'. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls height, padding, and font. Default 'md'. */
    size?: FieldSize
    /** Display in 12-hour format with AM/PM (value stays 24h `"HH:mm"`). */
    use12Hours?: boolean
    /** Include a seconds column. Default `false`. */
    withSeconds?: boolean
    /** Minute step. Default `1`. Use `5` / `15` for coarse pickers. */
    minuteStep?: number
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Validation message — shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Extra classes merged onto the field root element. */
    className?: string
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Inline style applied to the control shell. */
    style?: React.CSSProperties
}

const pad = (n: number) => n.toString().padStart(2, '0')

function parse(value?: string | null): { h: number; m: number; s: number } | null {
    if (!value) return null
    const [h, m, s] = value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return { h, m, s: Number.isNaN(s) ? 0 : s }
}

function display(value: string | null | undefined, use12: boolean, withSeconds: boolean): string {
    const p = parse(value)
    if (!p) return ''
    if (use12) {
        const period = p.h >= 12 ? 'PM' : 'AM'
        const h12 = p.h % 12 === 0 ? 12 : p.h % 12
        return `${h12}:${pad(p.m)}${withSeconds ? `:${pad(p.s)}` : ''} ${period}`
    }
    return `${pad(p.h)}:${pad(p.m)}${withSeconds ? `:${pad(p.s)}` : ''}`
}

/**
 * Time picker with scrollable hour / minute (/ second) columns in a popover.
 * Value is a 24-hour `"HH:mm"` (or `"HH:mm:ss"`) string regardless of whether
 * the display is 12- or 24-hour, so it's stable to store and submit.
 *
 * @example
 * ```tsx
 * <TimePicker label="Departure" value={time} onChange={setTime} minuteStep={15} use12Hours />
 * ```
 */
export default function TimePicker({
    value,
    onChange,
    label,
    htmlFor,
    name,
    placeholder = 'Select a time…',
    layout = 'vertical',
    size = 'md',
    use12Hours = false,
    withSeconds = false,
    minuteStep = 1,
    disabled,
    errorMessage,
    helperText,
    className,
    required,
    style,
}: TimePickerProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const [open, setOpen] = useState(false)

    const parsed = parse(value) ?? { h: 0, m: 0, s: 0 }

    const update = (next: Partial<{ h: number; m: number; s: number }>) => {
        const merged = { ...parsed, ...next }
        onChange?.(`${pad(merged.h)}:${pad(merged.m)}${withSeconds ? `:${pad(merged.s)}` : ''}`)
    }

    const hours = use12Hours
        ? Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
        : Array.from({ length: 24 }, (_, i) => i)     // 0..23
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
    const seconds = Array.from({ length: 60 }, (_, i) => i)

    // For 12h display, map the stored 24h hour to a column selection.
    const selectedHourCol = use12Hours ? (parsed.h % 12 === 0 ? 12 : parsed.h % 12) : parsed.h
    const period = parsed.h >= 12 ? 'PM' : 'AM'

    const setHour12 = (h12: number, p: 'AM' | 'PM') => {
        const h24 = p === 'AM' ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12)
        update({ h: h24 })
    }

    const Column = ({ items, selected, onPick, fmt }: {
        items: number[]; selected: number; onPick: (n: number) => void; fmt?: (n: number) => string
    }) => (
        <div className="flex flex-col overflow-y-auto max-h-48 w-14 hidden-scrollbar" role="listbox">
            {items.map((n) => (
                <button
                    key={n}
                    type="button"
                    role="option"
                    aria-selected={selected === n}
                    onClick={() => onPick(n)}
                    className={`py-1.5 text-sm rounded-md text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        selected === n ? 'bg-accent text-accent-fg' : 'text-foreground hover:bg-surface-raised'
                    }`}
                >
                    {fmt ? fmt(n) : pad(n)}
                </button>
            ))}
        </div>
    )

    return (
        <Field className={className} label={label} htmlFor={htmlFor} errorId={errorId} errorMessage={errorMessage} helperText={helperText} layout={layout} required={required}>
            <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                <Popover.Trigger asChild>
                    <button
                        id={htmlFor}
                        type="button"
                        disabled={disabled}
                        style={style}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`flex items-center justify-between cursor-pointer select-none ${!style?.width ? 'min-w-[160px]' : ''} ${fieldShell({ size, hasError, disabled })}`}
                    >
                        <span className={`text-sm truncate ${value ? '' : 'text-foreground-muted'}`}>
                            {display(value, use12Hours, withSeconds) || placeholder}
                        </span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0 text-foreground-muted ml-2" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" />
                        </svg>
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        align="start"
                        sideOffset={4}
                            collisionPadding={8}
                        className="bg-surface text-foreground border border-border rounded-lg shadow-md z-popover p-2 flex gap-1 animate-in fade-in-0 zoom-in-95"
                    >
                        <Column items={hours} selected={selectedHourCol}
                            onPick={(h) => use12Hours ? setHour12(h, period as 'AM' | 'PM') : update({ h })}
                            fmt={use12Hours ? (n) => String(n) : pad} />
                        <Column items={minutes} selected={parsed.m} onPick={(m) => update({ m })} />
                        {withSeconds && <Column items={seconds} selected={parsed.s} onPick={(s) => update({ s })} />}
                        {use12Hours && (
                            <div className="flex flex-col gap-1 w-12">
                                {(['AM', 'PM'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setHour12(selectedHourCol, p)}
                                        className={`py-1.5 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                            period === p ? 'bg-accent text-accent-fg' : 'text-foreground hover:bg-surface-raised'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {name && <input type="hidden" name={name} value={value ?? ''} />}
        </Field>
    )
}
