import React, { useId, useState } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Field, FieldHelpIcon, type FieldSize } from './_field'

/**
 * Slider value. A single number for a one-thumb slider, or a `[min, max]`
 * tuple for a two-thumb range slider. The shape you pass determines the mode.
 */
export type SliderValue = number | [number, number]

export interface SliderMark {
    value: number
    label?: React.ReactNode
}

export interface SliderProps {
    /** Controlled value. */
    value?: SliderValue
    /** Uncontrolled initial value. */
    defaultValue?: SliderValue
    /** Fires when the value changes. */
    onChange?: (value: SliderValue) => void
    /** Fired once at the end of a drag/keyboard interaction. */
    onChangeEnd?: (value: SliderValue) => void
    /** Minimum allowed value. */
    min?: number
    /** Maximum allowed value. */
    max?: number
    /** Step increment between values. */
    step?: number
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** Show the current value(s) next to the label. */
    showValue?: boolean
    /** Format the displayed value (tooltip + value readout). */
    formatValue?: (n: number) => string
    /** Tick marks under the track. */
    marks?: SliderMark[]
    /** Show a value tooltip above the thumb while dragging. */
    tooltip?: boolean
    /** Size preset, controls height, padding, and font. Default 'md'. */
    size?: FieldSize
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Validation message, shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Extra classes merged onto the field root element. */
    className?: string
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
}

const TRACK_H: Record<FieldSize, string> = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }
const THUMB: Record<FieldSize, string> = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

const toArray = (v: SliderValue | undefined): number[] | undefined =>
    v == null ? undefined : Array.isArray(v) ? v : [v]

/**
 * Range slider on `@radix-ui/react-slider`. Pass a single number for a
 * one-thumb slider or a `[min, max]` tuple for a two-thumb range. Optional
 * tick marks, a drag tooltip, and a value readout beside the label.
 *
 * @example Single
 * ```tsx
 * <Slider label="Volume" value={vol} onChange={(v) => setVol(v as number)} showValue />
 * ```
 *
 * @example Range with marks
 * ```tsx
 * <Slider
 *   label="Price"
 *   value={[20, 80]}
 *   onChange={(v) => setRange(v as [number, number])}
 *   marks={[{ value: 0, label: '$0' }, { value: 50, label: '$50' }, { value: 100, label: '$100' }]}
 *   tooltip
 * />
 * ```
 */
export default function Slider({
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = false,
    formatValue = (n) => String(n),
    marks,
    tooltip = false,
    size = 'md',
    disabled,
    errorMessage,
    helperText,
    className,
    required,
    name,
    htmlFor,
}: SliderProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const isRange = Array.isArray(value ?? defaultValue)

    // Track the live value for the tooltip / readout even in uncontrolled mode.
    const [internal, setInternal] = useState<number[]>(
        () => toArray(value) ?? toArray(defaultValue) ?? [min],
    )
    const current = toArray(value) ?? internal
    const [dragging, setDragging] = useState(false)

    const emit = (arr: number[]) => {
        setInternal(arr)
        const next: SliderValue = isRange ? [arr[0], arr[1]] : arr[0]
        onChange?.(next)
    }

    const valueText = current.map(formatValue).join(' – ')

    return (
        <Field className={className} label={undefined} errorId={errorId} errorMessage={errorMessage}>
            {(label || showValue) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <span className="flex items-center gap-1">
                            <label htmlFor={htmlFor} className="text-sm font-medium text-foreground select-none">
                                {label}
                                {required && <span className="text-status-error ml-0.5" aria-hidden="true">*</span>}
                            </label>
                            {helperText != null && <FieldHelpIcon text={helperText} />}
                        </span>
                    )}
                    {showValue && (
                        <span className="text-sm text-foreground-secondary tabular-nums">{valueText}</span>
                    )}
                </div>
            )}

            <SliderPrimitive.Root
                id={htmlFor}
                name={name}
                value={toArray(value)}
                defaultValue={toArray(defaultValue)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                onValueChange={(v) => { emit(v); setDragging(true) }}
                onValueCommit={(v) => {
                    setDragging(false)
                    onChangeEnd?.(isRange ? [v[0], v[1]] : v[0])
                }}
                className="relative flex items-center select-none touch-none w-full h-5"
            >
                <SliderPrimitive.Track className={`relative grow rounded-full bg-surface-raised border border-border ${TRACK_H[size]}`}>
                    <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
                </SliderPrimitive.Track>
                {current.map((_, i) => (
                    <SliderPrimitive.Thumb
                        key={i}
                        className={`group relative block ${THUMB[size]} rounded-full border-2 border-accent bg-surface shadow-sm transition-shadow
                            focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring
                            disabled:cursor-not-allowed`}
                    >
                        {tooltip && (
                            <span
                                className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-xs text-background tabular-nums whitespace-nowrap transition-opacity ${
                                    dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                                }`}
                            >
                                {formatValue(current[i])}
                            </span>
                        )}
                    </SliderPrimitive.Thumb>
                ))}
            </SliderPrimitive.Root>

            {marks && marks.length > 0 && (
                <div className="relative mt-2 h-4">
                    {marks.map((m) => {
                        const pct = ((m.value - min) / (max - min)) * 100
                        return (
                            <span
                                key={m.value}
                                className="absolute -translate-x-1/2 text-xs text-foreground-muted tabular-nums"
                                style={{ left: `${pct}%` }}
                            >
                                {m.label ?? m.value}
                            </span>
                        )
                    })}
                </div>
            )}
        </Field>
    )
}
