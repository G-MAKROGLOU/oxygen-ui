import React from 'react'
import COLORS from '../../utils/colors'

export interface SearchInputProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
}

/**
 * Search text field with a magnifier icon on the right.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
    {
        value,
        onChange,
        disabled,
        label,
        htmlFor,
        placeholder,
        name,
        inputStyle,
        style,
        layout = 'vertical',
    },
    ref
) {
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
                style={style ?? {}}
            >
                {label && (
                    <label className="text-lg font-bold ml-1 max-content text-prussian-blue dark:text-white" htmlFor={htmlFor}>
                        {label}
                    </label>
                )}
                <div className="bg-white flex items-center gap-1 rounded-lg focus:outline-oxford-blue-700-opaque pr-2">
                    <input
                        ref={ref}
                        disabled={disabled}
                        value={value}
                        onChange={onChange}
                        // `type="search"` gives consumers the native clear button
                        // and an Enter-friendly virtual keyboard hint on mobile.
                        type="search"
                        enterKeyHint="search"
                        name={name}
                        id={htmlFor}
                        className="focus:outline-none pl-2 h-9 w-56 outline-offset-2 text-prussian-blue mt-1 rounded-lg disabled:bg-disabled disabled:cursor-not-allowed"
                        style={inputStyle ?? {}}
                        placeholder={placeholder ?? ''}
                    />
                    {/* Search icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={COLORS.PALETTE['prussian-blue']} className="w-6 h-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    )
})

export default SearchInput
