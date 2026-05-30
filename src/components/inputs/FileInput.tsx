import React, { useId, useRef, useState } from 'react'
import { Field } from './_field'

export interface FileInputProps {
    /** Allow selecting more than one file. */
    allowMultiple?: boolean
    /** Fires when the value changes. */
    onChange?: (e: { target: { files: File[]; name?: string; id?: string; value?: string } }) => void
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** Accepted MIME types / extensions, e.g. `'.xlsx,application/pdf'`. */
    accept?: string
    /** Primary call-to-action copy. Default `'Click to upload or drag and drop'`. */
    prompt?: React.ReactNode
    /** Secondary hint under the prompt — typically the accepted types / max size. */
    hint?: React.ReactNode
    /** Maximum file size in bytes. Files above this are rejected with an error. */
    maxSize?: number
    /** Validation message — shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Override the upload glyph in the empty state. */
    icon?: React.ReactNode
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const UploadGlyph = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
)

const FileGlyph = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 001 1h4M5 3h9l5 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
)

/**
 * Drag-and-drop file input with an enterprise dropzone aesthetic: a calm
 * dashed surface with a contained icon badge, primary + secondary copy, an
 * accent-tinted drag-over state, and selected files shown as horizontal chips
 * with name + size and a remove button.
 *
 * Keyboard-accessible (the dropzone is a `role="button"` activatable via
 * Enter / Space) and form-friendly (`errorMessage`, `required`, `name`).
 *
 * @example
 * ```tsx
 * <FileInput
 *   label="Crew manifest"
 *   accept=".xlsx,.csv"
 *   hint="XLSX or CSV, up to 5 MB"
 *   maxSize={5 * 1024 * 1024}
 *   onChange={(e) => setFile(e.target.files[0])}
 * />
 * ```
 */
export default function FileInput({
    allowMultiple = false,
    onChange,
    name,
    htmlFor,
    label,
    accept,
    prompt = 'Click to upload or drag and drop',
    hint,
    maxSize,
    errorMessage,
    helperText,
    disabled,
    required,
    icon,
}: FileInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const errorId = useId()
    const [files, setFiles] = useState<File[]>([])
    const [dragging, setDragging] = useState(false)
    const [sizeError, setSizeError] = useState<string | null>(null)

    const effectiveError = errorMessage ?? sizeError ?? undefined

    const openPicker = () => { if (!disabled) inputRef.current?.click() }

    const commit = (list: File[]) => {
        if (maxSize != null) {
            const tooBig = list.find((f) => f.size > maxSize)
            if (tooBig) {
                setSizeError(`"${tooBig.name}" exceeds the ${formatBytes(maxSize)} limit`)
                return
            }
        }
        setSizeError(null)
        setFiles(list)
        onChange?.({ target: { files: list, name, id: htmlFor ?? name } })
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (disabled) return
        const dropped = Array.from(e.dataTransfer.files ?? [])
        commit(allowMultiple ? dropped : dropped.slice(0, 1))
    }

    const removeFile = (idx: number) => {
        const next = files.filter((_, i) => i !== idx)
        setFiles(next)
        setSizeError(null)
        onChange?.({ target: { files: next, name, id: htmlFor ?? name, value: '' } })
        if (next.length === 0 && inputRef.current) inputRef.current.value = ''
    }

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={effectiveError} helperText={helperText}
            required={required}
        >
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={typeof prompt === 'string' ? prompt : 'Upload file'}
                aria-disabled={disabled || undefined}
                aria-invalid={effectiveError != null || undefined}
                aria-describedby={effectiveError != null ? errorId : undefined}
                onClick={openPicker}
                onKeyDown={(e) => {
                    if (disabled) return
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() }
                }}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={[
                    'group flex flex-col items-center justify-center gap-3 w-full rounded-xl border border-dashed px-6 py-8 text-center',
                    'transition-colors duration-150 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring',
                    disabled
                        ? 'border-border bg-surface-raised cursor-not-allowed opacity-60'
                        : effectiveError != null
                        ? 'border-status-error bg-surface cursor-pointer'
                        : dragging
                        ? 'border-accent bg-surface-raised cursor-copy'
                        : 'border-border bg-surface hover:border-border-strong cursor-pointer',
                ].join(' ')}
            >
                <input
                    id={htmlFor ?? name}
                    name={name}
                    onChange={(e) => commit(Array.from(e.target.files ?? []))}
                    ref={inputRef}
                    hidden
                    type="file"
                    accept={accept}
                    multiple={allowMultiple}
                    disabled={disabled}
                />

                {/* Icon badge — a contained surface, not a giant raw glyph. */}
                <span
                    className={[
                        'flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150',
                        dragging ? 'bg-accent text-accent-fg' : 'bg-surface-raised text-foreground-secondary group-hover:text-foreground',
                    ].join(' ')}
                >
                    {icon ?? UploadGlyph}
                </span>

                <div className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">
                        {dragging ? 'Drop to upload' : prompt}
                    </div>
                    {hint && <div className="text-xs text-foreground-muted">{hint}</div>}
                </div>
            </div>

            {/* Selected file chips */}
            {files.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                    {files.map((file, idx) => (
                        <li
                            key={`${idx}-${file.name}`}
                            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                        >
                            <span className="flex-shrink-0 text-foreground-muted">{FileGlyph}</span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-sm text-foreground truncate">{file.name}</span>
                                <span className="block text-xs text-foreground-muted">{formatBytes(file.size)}</span>
                            </span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                                aria-label={`Remove ${file.name}`}
                                className="flex-shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-status-error hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Field>
    )
}
