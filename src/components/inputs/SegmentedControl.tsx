import React from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { FieldSize } from './_field'

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
 * @example
 * ```tsx
 * <SegmentedControl
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
    'aria-label': ariaLabel,
}: SegmentedControlProps) {
    const sz = SIZE[size]
    return (
        <ToggleGroup.Root
            type="single"
            value={value}
            defaultValue={defaultValue}
            onValueChange={(v) => { if (v) onChange?.(v) }}
            disabled={disabled}
            aria-label={ariaLabel}
            className={[
                'inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1',
                sz.h,
                fullWidth ? 'flex w-full' : '',
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
    )
}
