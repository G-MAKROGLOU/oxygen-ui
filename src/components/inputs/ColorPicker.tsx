import React, { useId, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Field, fieldShell, type FieldSize } from './_field'

export interface ColorPickerProps {
    /** Hex string, e.g. `"#0466c8"`. */
    value?: string
    /** Fires when the value changes. */
    onChange?: (hex: string) => void
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** Label/control orientation: 'horizontal' or 'vertical'. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls height, padding, and font. Default 'md'. */
    size?: FieldSize
    /** Preset swatches shown in the popover. Defaults to a balanced 12-color set. */
    swatches?: string[]
    /** Show the native eyedropper / full picker fallback via `<input type="color">`. Default `true`. */
    allowCustom?: boolean
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
    /** Placeholder shown when the field is empty. */
    placeholder?: string
}

const DEFAULT_SWATCHES = [
    '#0466c8', '#1e8449', '#d68910', '#c0392b', '#8e44ad', '#16a085',
    '#2c3e50', '#7f8c8d', '#e84393', '#00b894', '#fdcb6e', '#0a1929',
]

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Color picker: a swatch trigger that opens a popover with preset swatches, a
 * hex input, and (optionally) the native full picker for custom colors. Value
 * is a hex string, easy to store and submit.
 *
 * @example
 * ```tsx
 * <ColorPicker label="Brand colour" value={color} onChange={setColor} />
 * ```
 */
export default function ColorPicker({
    value = '',
    onChange,
    label,
    htmlFor,
    name,
    layout = 'vertical',
    size = 'md',
    swatches = DEFAULT_SWATCHES,
    allowCustom = true,
    disabled,
    errorMessage,
    helperText,
    className,
    required,
    placeholder = 'Pick a colour…',
}: ColorPickerProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState(value)

    const valid = HEX_RE.test(value)

    const pick = (hex: string) => {
        onChange?.(hex)
        setDraft(hex)
    }

    const commitDraft = (raw: string) => {
        const hex = raw.startsWith('#') ? raw : `#${raw}`
        setDraft(hex)
        if (HEX_RE.test(hex)) onChange?.(hex)
    }

    return (
        <Field className={className} label={label} htmlFor={htmlFor} errorId={errorId} errorMessage={errorMessage} helperText={helperText} layout={layout} required={required}>
            <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                <Popover.Trigger asChild>
                    <button
                        id={htmlFor}
                        type="button"
                        disabled={disabled}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`flex items-center gap-2 cursor-pointer select-none ${fieldShell({ size, hasError, disabled })}`}
                    >
                        <span
                            className="h-4 w-4 flex-shrink-0 rounded border border-border"
                            style={{ backgroundColor: valid ? value : 'transparent' }}
                            aria-hidden="true"
                        />
                        <span className={`flex-1 text-left text-sm truncate ${valid ? 'text-foreground' : 'text-foreground-muted'}`}>
                            {valid ? value.toLowerCase() : placeholder}
                        </span>
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        align="start"
                        sideOffset={4}
                            collisionPadding={8}
                        className="bg-surface text-foreground border border-border rounded-lg shadow-md z-popover p-3 w-56 animate-in fade-in-0 zoom-in-95"
                    >
                        <div className="grid grid-cols-6 gap-2 mb-3">
                            {swatches.map((sw) => (
                                <button
                                    key={sw}
                                    type="button"
                                    onClick={() => { pick(sw); setOpen(false) }}
                                    aria-label={sw}
                                    className={`h-7 w-7 rounded-md border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                        value.toLowerCase() === sw.toLowerCase() ? 'border-accent ring-2 ring-focus-ring' : 'border-border'
                                    }`}
                                    style={{ backgroundColor: sw }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                value={draft}
                                onChange={(e) => commitDraft(e.target.value)}
                                placeholder="#0466c8"
                                aria-label="Hex colour"
                                className={`flex-1 ${fieldShell({ size: 'sm' })}`}
                            />
                            {allowCustom && (
                                <input
                                    type="color"
                                    value={valid ? value : '#000000'}
                                    onChange={(e) => pick(e.target.value)}
                                    aria-label="Custom colour"
                                    className="h-7 w-9 rounded-md border border-border bg-surface cursor-pointer p-0.5"
                                />
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {name && <input type="hidden" name={name} value={valid ? value : ''} />}
        </Field>
    )
}
