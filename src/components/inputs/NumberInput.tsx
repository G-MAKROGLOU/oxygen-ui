import React from 'react'
import COLORS from '../../utils/colors'

export interface NumberInputProps {
    step?: number
    value?: any
    onChange?: (e: { target: { value: number; id?: string; name?: string } }) => void
    label?: React.ReactNode
    htmlFor?: string
    name?: string
    disabled?: boolean
    /** 'horizontal' | 'vertical' */
    layout?: string
    errorMessage?: React.ReactNode
    inputStyle?: React.CSSProperties
    labelStyle?: React.CSSProperties
    placeholder?: string
    style?: React.CSSProperties
    min?: number
    max?: number
    readOnly?: boolean
    [key: string]: any
}

/**
 * Number input with increment / decrement controls.
 */
export default function NumberInput({
    step = 1,
    value,
    onChange,
    label,
    htmlFor,
    name,
    disabled,
    layout,
    errorMessage,
    inputStyle,
    labelStyle,
    placeholder,
    style = {},
    min,
    max,
    readOnly = false,
}: NumberInputProps) {
    const onIncrement = () => {
        let newValue = value ? parseFloat(value) + step : 0 + step
        if (max !== undefined && newValue > max) return
        onChange?.({ target: { value: newValue, id: htmlFor, name } })
    }

    const onDecrement = () => {
        let newValue = value ? parseFloat(value) - step : 0 - step
        if (min !== undefined && newValue < min) return
        onChange?.({ target: { value: newValue, id: htmlFor, name } })
    }

    return (
        <div>
            <div className="flex items-center justify-between pr-1 pl-1">
                <div
                    className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
                >
                    <label
                        className="text-md font-bold ml-1 w-60 select-none text-prussian-blue dark:text-white"
                        style={labelStyle}
                        htmlFor={htmlFor}
                    >
                        {label}
                    </label>
                    <div
                        style={style}
                        className={`${disabled ? 'bg-disabled' : 'bg-white'} rounded-lg flex items-center pr-1 pl-2 w-max`}
                    >
                        <input
                            min={min}
                            max={max}
                            autoComplete="off"
                            disabled={disabled}
                            name={name}
                            id={htmlFor}
                            step={step}
                            value={value}
                            onChange={onChange as any}
                            type="number"
                            className="focus:outline-0 focus-visible:outline-0 h-9 w-60 text-prussian-blue disabled:bg-disabled disabled:cursor-not-allowed transition-all"
                            style={inputStyle ?? {}}
                            placeholder={placeholder ?? ''}
                            readOnly={readOnly}
                        />
                        <div className="flex flex-col">
                            <span
                                onClick={onIncrement}
                                className="rotate-180 cursor-pointer transition-all duration-300 hover:bg-ice rounded-sm"
                            >
                                {/* ChevronDown up */}
                                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                            <span
                                onClick={onDecrement}
                                className="cursor-pointer transition-all duration-300 hover:bg-ice rounded-sm"
                            >
                                {/* ChevronDown down */}
                                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center text-error min-h-0">{errorMessage}</div>
        </div>
    )
}
