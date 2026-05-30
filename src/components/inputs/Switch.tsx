import React, { useId, useState } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { Field } from './_field'

export interface SwitchInputProps {
    /** Controlled on/off state. */
    checked?: boolean
    /** Uncontrolled initial state. */
    defaultChecked?: boolean
    onChange?: (e: { target: { checked: boolean; name?: string } }) => void
    /** Thumb icon shown when on. */
    checkedIcon?: React.ReactNode
    /** Thumb icon shown when off. */
    uncheckedIcon?: React.ReactNode

    // ── Field-level labelling (mode 1) ──────────────────────────────────────
    /**
     * Central field label, positioned per `layout` (above in vertical, beside
     * in horizontal) — the same affordance every other input uses.
     */
    label?: React.ReactNode
    /** Label/control orientation. Default `'horizontal'`. */
    layout?: 'horizontal' | 'vertical'
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode

    // ── Per-state labelling (mode 2) ────────────────────────────────────────
    /** Label rendered to the left of the track, emphasised while off. */
    offLabel?: React.ReactNode
    /** Label rendered to the right of the track, emphasised while on. */
    onLabel?: React.ReactNode

    // ── Form participation ──────────────────────────────────────────────────
    name?: string
    required?: boolean
    disabled?: boolean
    errorMessage?: React.ReactNode
}

/**
 * Form switch (on/off toggle) powered by Radix Switch.
 *
 * Two labelling modes, usable together or apart:
 * - **central `label`** positioned by `layout` (the standard field label), and
 * - **per-state `offLabel` / `onLabel`** flanking the track, each emphasised
 *   when its state is active (the "Off ▮ On" pattern).
 *
 * Form-ready: pass `name` for native serialisation (Radix emits a hidden
 * input), `errorMessage` for validation, `required` for the asterisk.
 *
 * Works controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`).
 *
 * @example
 * <Switch label="Email notifications" checked={on} onChange={({ target }) => setOn(target.checked)} />
 * <Switch offLabel="Monthly" onLabel="Yearly" checked={yearly} onChange={...} />
 */
export default function Switch({
    checked,
    defaultChecked = false,
    onChange,
    checkedIcon,
    uncheckedIcon,
    label,
    layout = 'horizontal',
    helperText,
    offLabel,
    onLabel,
    name,
    required,
    disabled,
    errorMessage,
}: SwitchInputProps) {
    const id = useId()
    const errorId = useId()
    const hasError = errorMessage != null

    // Controlled when `checked` is provided; otherwise track internally so the
    // per-state labels still light up correctly.
    const isControlled = checked !== undefined
    const [internal, setInternal] = useState(defaultChecked)
    const isOn = isControlled ? checked : internal

    const handle = (c: boolean) => {
        if (!isControlled) setInternal(c)
        onChange?.({ target: { checked: c, name } })
    }

    const stateLabel = (active: boolean) =>
        [
            'text-sm select-none transition-colors',
            active ? 'text-foreground font-medium' : 'text-foreground-muted',
            disabled ? 'opacity-50' : 'cursor-pointer',
        ].filter(Boolean).join(' ')

    return (
        <Field
            label={label}
            htmlFor={id}
            errorId={errorId}
            errorMessage={errorMessage}
            layout={layout}
            required={required}
            helperText={helperText}
            // The switch track is short (24px); centre the label against it
            // rather than nudging down to a 36px input's first line.
            labelAlign="center"
        >
            <div className="flex items-center gap-2.5">
                {offLabel != null && (
                    <label htmlFor={id} className={stateLabel(!isOn)}>{offLabel}</label>
                )}

                <SwitchPrimitive.Root
                    id={id}
                    name={name}
                    checked={isOn}
                    onCheckedChange={handle}
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorId : undefined}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-foreground-secondary data-[state=checked]:bg-accent transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {/* Thumb is 20px inside a 24px track (2px inset each side),
                        travelling 2px → 22px. Keeping the thumb SMALLER than the
                        track is what makes it read as a clean pill rather than a
                        bulging blob. */}
                    <SwitchPrimitive.Thumb
                        className="pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground shadow transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
                    >
                        {checkedIcon && uncheckedIcon
                            ? <span className="flex items-center justify-center w-3 h-3">{isOn ? checkedIcon : uncheckedIcon}</span>
                            : null}
                    </SwitchPrimitive.Thumb>
                </SwitchPrimitive.Root>

                {onLabel != null && (
                    <label htmlFor={id} className={stateLabel(isOn)}>{onLabel}</label>
                )}
            </div>
        </Field>
    )
}
