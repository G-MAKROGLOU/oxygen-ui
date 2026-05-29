import React, { useId, useRef, useState } from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

export interface TagsInputProps {
    /** Controlled list of tags. */
    value?: string[]
    /** Uncontrolled initial tags. */
    defaultValue?: string[]
    onChange?: (tags: string[]) => void
    label?: React.ReactNode
    htmlFor?: string
    name?: string
    placeholder?: string
    layout?: 'horizontal' | 'vertical'
    size?: FieldSize
    disabled?: boolean
    errorMessage?: React.ReactNode
    required?: boolean
    /** Maximum number of tags. Further input is ignored once reached. */
    maxTags?: number
    /** Reject duplicate tags (case-insensitive). Default `true`. */
    dedupe?: boolean
    /**
     * Validate a candidate tag before adding. Return `false` (or a string error
     * to surface) to reject. Receives the trimmed candidate + current tags.
     */
    validate?: (tag: string, tags: string[]) => boolean | string
    /** Characters that commit the current input as a tag. Default Enter + comma. */
    separators?: string[]
}

/**
 * Free-text entry that produces removable tag chips, distinct from Dropdown
 * (which picks from a fixed list). Type and press Enter or comma to add;
 * Backspace on an empty field removes the last tag; pasting a delimited string
 * splits into multiple tags. Optional dedupe, max-count, and per-tag validation.
 *
 * @example
 * ```tsx
 * <TagsInput label="Recipients" value={emails} onChange={setEmails}
 *   validate={(t) => /.+@.+\..+/.test(t) || 'Not a valid email'} />
 * ```
 */
export default function TagsInput({
    value,
    defaultValue,
    onChange,
    label,
    htmlFor,
    name,
    placeholder = 'Add and press Enter',
    layout = 'vertical',
    size = 'md',
    disabled,
    errorMessage,
    required,
    maxTags,
    dedupe = true,
    validate,
    separators = ['Enter', ','],
}: TagsInputProps) {
    const errorId = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [internal, setInternal] = useState<string[]>(defaultValue ?? [])
    const [draft, setDraft] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)

    const tags = value ?? internal
    const hasError = errorMessage != null || localError != null
    const errorText = errorMessage ?? localError ?? undefined

    const commitTags = (next: string[]) => {
        setInternal(next)
        onChange?.(next)
    }

    const addTag = (raw: string): boolean => {
        const tag = raw.trim()
        if (!tag) return false
        if (maxTags != null && tags.length >= maxTags) return false
        if (dedupe && tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
            setLocalError(`"${tag}" is already added`)
            return false
        }
        if (validate) {
            const res = validate(tag, tags)
            if (res !== true) {
                setLocalError(typeof res === 'string' ? res : `"${tag}" is not valid`)
                return false
            }
        }
        setLocalError(null)
        commitTags([...tags, tag])
        return true
    }

    const removeTag = (idx: number) => {
        commitTags(tags.filter((_, i) => i !== idx))
        setLocalError(null)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (separators.includes(e.key)) {
            e.preventDefault()
            if (addTag(draft)) setDraft('')
        } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text')
        // Split paste on commas / newlines / semicolons; if it yields multiple
        // parts, add them all and prevent the raw paste.
        const parts = text.split(/[\n,;]+/).map((p) => p.trim()).filter(Boolean)
        if (parts.length > 1) {
            e.preventDefault()
            let added = false
            for (const p of parts) added = addTag(p) || added
            if (added) setDraft('')
        }
    }

    const atMax = maxTags != null && tags.length >= maxTags

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorText}
            layout={layout}
            required={required}
        >
            <div
                className={`flex flex-wrap items-center gap-1.5 min-h-[36px] ${fieldShell({ size, hasError, disabled, focusWithin: true, sized: false })} px-2 py-1.5`}
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, idx) => (
                    <span
                        key={`${tag}-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-raised text-foreground text-xs pl-2 pr-1 py-0.5 border border-border"
                    >
                        {tag}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={(e) => { e.stopPropagation(); removeTag(idx) }}
                            aria-label={`Remove ${tag}`}
                            className="inline-flex items-center justify-center w-4 h-4 rounded text-foreground-muted hover:text-status-error hover:bg-surface transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        >
                            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    id={htmlFor}
                    name={name}
                    disabled={disabled || atMax}
                    value={draft}
                    onChange={(e) => { setDraft(e.target.value); if (localError) setLocalError(null) }}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    onBlur={() => { if (addTag(draft)) setDraft('') }}
                    placeholder={atMax ? '' : (tags.length === 0 ? placeholder : '')}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorId : undefined}
                    autoComplete="off"
                    className="flex-1 min-w-[6rem] bg-transparent outline-none text-sm placeholder:text-foreground-muted disabled:cursor-not-allowed"
                />
            </div>
        </Field>
    )
}
