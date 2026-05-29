import React, { useId } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

export interface SwitchInputProps {
    checked?: boolean
    onChange?: (e: { target: { checked: boolean } }) => void
    checkedIcon?: React.ReactNode
    uncheckedIcon?: React.ReactNode
}

/**
 * Form switch (on/off toggle) powered by Radix Switch.
 *
 * Radix handles keyboard activation, focus ring, and `role="switch"` ARIA.
 * Accepts optional icon slots for the thumb in checked/unchecked states.
 *
 * Emits `{ target: { checked } }` for compatibility with existing handlers.
 *
 * @example
 * <Switch
 *   checked={form.enabled}
 *   onChange={({ target }) => setField('enabled', target.checked)}
 * />
 */
export default function Switch({
    checked = false,
    onChange,
    checkedIcon,
    uncheckedIcon,
}: SwitchInputProps) {
    const id = useId()

    return (
        <div>
            {/* Spacing is the parent's responsibility — no baked-in margins. */}
            <label htmlFor={id} className="flex items-center cursor-pointer select-none">
                <SwitchPrimitive.Root
                    id={id}
                    checked={checked}
                    onCheckedChange={(c) => onChange?.({ target: { checked: c } })}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-foreground-secondary data-[state=checked]:bg-accent transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring"
                >
                    {/* Thumb is 20px inside a 24px track (2px inset each side),
                        travelling 2px → 22px. Keeping the thumb SMALLER than the
                        track is what makes it read as a clean pill rather than a
                        bulging blob. */}
                    <SwitchPrimitive.Thumb
                        className="pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground shadow transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
                    >
                        {checkedIcon && uncheckedIcon
                            ? checked
                                ? <span className="flex items-center justify-center w-3 h-3">{checkedIcon}</span>
                                : <span className="flex items-center justify-center w-3 h-3">{uncheckedIcon}</span>
                            : null}
                    </SwitchPrimitive.Thumb>
                </SwitchPrimitive.Root>
            </label>
        </div>
    )
}
