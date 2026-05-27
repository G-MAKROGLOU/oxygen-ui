import React, { useId } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

export interface ThemeSwitchProps {
    checked: boolean
    onChange: (e: { target: { checked: boolean } }) => void
}

/**
 * Theme (dark-mode) toggle switch powered by Radix Switch.
 *
 * Displays a red/green dot to indicate the checked state.
 * Used as the dark-mode toggle in the TopBar.
 *
 * @example
 * <Switch checked={isDarkMode} onChange={({ target }) => setDarkMode(target.checked)} />
 */
export default function Switch({ checked, onChange }: ThemeSwitchProps) {
    const id = useId()

    return (
        <div className="relative bottom-5">
            <label htmlFor={id} className="flex items-center cursor-pointer mr-12 select-none">
                <SwitchPrimitive.Root
                    id={id}
                    checked={checked}
                    onCheckedChange={(c) => onChange({ target: { checked: c } })}
                    className="relative inline-flex h-6 w-14 items-center rounded-full bg-prussian-blue dark:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-usafa-blue"
                >
                    <SwitchPrimitive.Thumb
                        className="pointer-events-none inline-flex h-8 w-8 rounded-full shadow transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[-4px]"
                    >
                        <div
                            className={`rounded-full w-8 h-8 ${checked ? 'bg-success' : 'bg-error'} transition-colors duration-200`}
                        />
                    </SwitchPrimitive.Thumb>
                </SwitchPrimitive.Root>
            </label>
        </div>
    )
}
