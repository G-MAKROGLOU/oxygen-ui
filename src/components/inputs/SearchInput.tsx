import React from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

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
    /** Size preset. Default `'md'`. */
    size?: FieldSize
    /** Override the leading search icon. */
    icon?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
}

const SearchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
    </svg>
)

/**
 * Search field with a leading magnifier icon. Uses `type="search"` for the
 * native clear affordance and a search-friendly mobile keyboard. Full-width
 * by default. Override the icon via `icon`.
 *
 * @example
 * ```tsx
 * <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vessels…" />
 * ```
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
    { value, onChange, disabled, label, htmlFor, placeholder, name, inputStyle, style, layout = 'vertical', size = 'md', icon, helperText },
    ref,
) {
    return (
        <Field label={label} htmlFor={htmlFor} layout={layout} helperText={helperText}>
            <div
                className={`flex items-center ${fieldShell({ size, disabled, focusWithin: true })}`}
                style={style}
            >
                <span className="flex-shrink-0 mr-2 text-foreground-muted">{icon ?? SearchIcon}</span>
                <input
                    ref={ref}
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    type="search"
                    enterKeyHint="search"
                    name={name}
                    id={htmlFor}
                    className="min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed placeholder:text-foreground-muted"
                    style={inputStyle}
                    placeholder={placeholder ?? ''}
                />
            </div>
        </Field>
    )
})

export default SearchInput
