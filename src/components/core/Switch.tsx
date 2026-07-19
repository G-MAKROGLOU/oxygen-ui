import React, { useId } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

export interface ThemeSwitchProps {
    checked: boolean
    onChange: (e: { target: { checked: boolean } }) => void
    /** Optional accessible label (defaults to "Toggle dark mode") */
    label?: string
    /** Extra classes merged onto the root label. */
    className?: string
}

/**
 * Theme (dark-mode) toggle switch powered by Radix Switch.
 *
 * The thumb color indicates mode: green = light, slate = dark.
 * Layout (position, margin) is the parent's responsibility, this component
 * renders inline with no external margins.
 *
 * @example
 * <ThemeSwitch checked={isDark} onChange={({ target }) => setDark(target.checked)} />
 */
export default function ThemeSwitch({ checked, onChange, label = 'Toggle dark mode', className = '' }: ThemeSwitchProps) {
    const id = useId()

    return (
        <label htmlFor={id} className={`flex items-center gap-2 cursor-pointer select-none ${className}`.trim()}>
            <SwitchPrimitive.Root
                id={id}
                checked={checked}
                onCheckedChange={(c) => onChange({ target: { checked: c } })}
                aria-label={label}
                className={[
                    'relative inline-flex h-6 w-11 items-center rounded-full',
                    'transition-colors duration-200',
                    'bg-foreground-secondary data-[state=checked]:bg-accent',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                ].join(' ')}
            >
                <SwitchPrimitive.Thumb
                    className={[
                        'pointer-events-none block h-5 w-5 rounded-full shadow-sm',
                        'transition-transform duration-200',
                        'data-[state=checked]:translate-x-[22px]',
                        'data-[state=unchecked]:translate-x-[2px]',
                        // Moon icon (dark mode indicator) when checked, sun when unchecked
                        checked ? 'bg-oxford-blue-900' : 'bg-white',
                    ].join(' ')}
                >
                    {/* Micro icon inside thumb */}
                    {checked ? (
                        // Moon
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 m-1 text-manatee" aria-hidden="true">
                            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
                        </svg>
                    ) : (
                        // Sun
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 m-1 text-usafa-blue" aria-hidden="true">
                            <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707z" />
                        </svg>
                    )}
                </SwitchPrimitive.Thumb>
            </SwitchPrimitive.Root>
        </label>
    )
}
