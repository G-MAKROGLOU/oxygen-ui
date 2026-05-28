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
            <label htmlFor={id} className="flex items-center cursor-pointer mr-12 select-none">
                <SwitchPrimitive.Root
                    id={id}
                    checked={checked}
                    onCheckedChange={(c) => onChange?.({ target: { checked: c } })}
                    className="relative inline-flex h-6 w-14 items-center rounded-full bg-prussian-blue dark:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-usafa-blue"
                >
                    <SwitchPrimitive.Thumb
                        className="pointer-events-none inline-flex h-8 w-8 items-center justify-center rounded-full bg-independence dark:bg-prussian-blue shadow transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[-4px]"
                    >
                        {checkedIcon && uncheckedIcon
                            ? checked
                                ? checkedIcon
                                : uncheckedIcon
                            : null}
                    </SwitchPrimitive.Thumb>
                </SwitchPrimitive.Root>
            </label>
        </div>
    )
}
