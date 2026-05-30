import React, { useId, useState } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Field, type FieldSize } from './_field'

export interface SegmentedOption {
    value: string
    label: React.ReactNode
    icon?: React.ReactNode
    disabled?: boolean
}

export interface SegmentedControlProps {
    options: SegmentedOption[]
    /** Controlled selected value. */
    value?: string
    /** Uncontrolled initial value. */
    defaultValue?: string
    onChange?: (value: string) => void
    /** Size preset. Default `'md'`. */
    size?: FieldSize
    /** Stretch to fill the container, segments share the width equally. */
    fullWidth?: boolean
    disabled?: boolean

    // ── Field participation ─────────────────────────────────────────────────
    /** Optional label, positioned per `layout`. */
    label?: React.ReactNode
    /** Label/control orientation. Default `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Native form field name (emits a hidden input carrying the value). */
    name?: string
    required?: boolean
    errorMessage?: React.ReactNode
    'aria-label'?: string
}

const SIZE: Record<FieldSize, { h: string; text: string; pad: string }> = {
    sm: { h: 'h-control-sm', text: 'text-xs', pad: 'px-2.5' },
    md: { h: 'h-control-md', text: 'text-sm', pad: 'px-3.5' },
    lg: { h: 'h-control-lg', text: 'text-sm', pad: 'px-4' },
}

/**
 * Text-first segmented control for 2 to 4 mutually exclusive options
 * (view switchers, billing period, density). Built on
 * `@radix-ui/react-toggle-group` (single, non-deselectable) so arrow-key
 * roving focus comes for free.
 *
 * The selected segment lifts onto a surface-white "pill" inside a tinted
 * track, the macOS / iOS segmented-control pattern, rendered with the
 * system's tight radii and accent-colored active text.
 *
 * Form-ready: optional `label` (positioned via `layout`), `helperText`,
 * `errorMessage`, and a hidden input emitted when `name` is set.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   label="View"
 *   value={view}
 *   onChange={setView}
 *   options={[
 *     { value: 'list', label: 'List' },
 *     { value: 'board', label: 'Board' },
 *     { value: 'calendar', label: 'Calendar' },
 *   ]}
 * />
 * ```
 */
export default function SegmentedControl({
    options,
    value,
    defaultValue,
    onChange,
    size = 'md',
    fullWidth = false,
    disabled,
    label,
    layout = 'vertical',
    helperText,
    name,
    required,
    errorMessage,
    'aria-label': ariaLabel,
}: SegmentedControlProps) {
    const sz = SIZE[size]
    const groupId = useId()
    const errorId = useId()
    const hasError = errorMessage != null

    // Mirror the value internally so the hidden form input (and uncontrolled
    // usage) reflect the current selection.
    const isControlled = value !== undefined
    const [internal, setInternal] = useState(defaultValue)
    const current = isControlled ? value : internal

    const handle = (v: string) => {
        if (!v) return
        if (!isControlled) setInternal(v)
        onChange?.(v)
    }

    return (
        <Field
            label={label}
            htmlFor={groupId}
            errorId={errorId}
            errorMessage={errorMessage}
            layout={layout}
            required={required}
            helperText={helperText}
        >
            {name && <input type="hidden" name={name} value={current ?? ''} />}
            <ToggleGroup.Root
                id={groupId}
                type="single"
                value={current}
                onValueChange={handle}
                disabled={disabled}
                aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                className={[
                    'inline-flex items-center gap-1 rounded-lg border bg-surface-raised p-1',
                    hasError ? 'border-status-error' : 'border-border',
                    sz.h,
                    fullWidth ? 'flex w-full' : 'w-fit',
                    disabled ? 'opacity-60 cursor-not-allowed' : '',
                ].filter(Boolean).join(' ')}
            >
                {options.map((opt) => (
                    <ToggleGroup.Item
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                        className={[
                            'inline-flex items-center justify-center gap-1.5 rounded-md select-none whitespace-nowrap',
                            'transition-colors duration-150 h-full',
                            sz.text,
                            sz.pad,
                            fullWidth ? 'flex-1' : '',
                            // Resting: muted text, transparent. Hover lifts the text.
                            'text-foreground-secondary hover:text-foreground',
                            // Active: surface-white pill + accent text + subtle shadow.
                            'data-[state=on]:bg-surface data-[state=on]:text-accent data-[state=on]:shadow-sm',
                            'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                        ].filter(Boolean).join(' ')}
                    >
                        {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                        {opt.label}
                    </ToggleGroup.Item>
                ))}
            </ToggleGroup.Root>
        </Field>
    )
}
