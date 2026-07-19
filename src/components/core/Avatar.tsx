import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'

export interface AvatarProps {
    /** Image URL. If missing or fails to load, `fallback` renders instead. */
    src?: string
    /** Alt text, required when `src` is provided for screen readers. */
    alt?: string
    /**
     * Fallback rendered when the image is unavailable. Pass either:
     * - a string (e.g. user initials like "JD"), rendered with semi-bold weight
     * - any ReactNode (icon, emoji)
     * - omit entirely, a generic "person" silhouette is used
     */
    fallback?: React.ReactNode
    /** Size preset. Default `'md'`. */
    size?: AvatarSize
    /** Circle (default) or rounded square. */
    shape?: AvatarShape
    /**
     * Optional presence indicator dot in the bottom-right corner.
     * `'online' | 'offline' | 'away' | 'busy'`.
     */
    status?: AvatarStatus
    className?: string
}

const SIZE_PX: Record<AvatarSize, number> = {
    xs: 20,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
}

const TEXT_CLASS: Record<AvatarSize, string> = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
}

const STATUS_CLASS: Record<AvatarStatus, string> = {
    online:  'bg-status-success',
    offline: 'bg-foreground-muted',
    away:    'bg-status-warning',
    busy:    'bg-status-error',
}

/**
 * Circular (or rounded-square) user avatar built on `@radix-ui/react-avatar`.
 * Radix handles the image-load lifecycle: it tries to load `src`, falls back
 * to the `fallback` slot after a short delay if the image is missing or fails
 * to decode, and re-attempts on `src` change.
 *
 * **Fallback strategy** (in order):
 * 1. `fallback` prop if provided (string or ReactNode)
 * 2. Two-character initials extracted from `alt` if `alt` is provided
 * 3. A generic "person" silhouette SVG
 *
 * **Status dot** is an optional presence indicator in the bottom-right -
 * online (green), away (amber), busy (red), offline (grey).
 *
 * @example Basic with image
 * ```tsx
 * <Avatar src="/users/jd.jpg" alt="Jane Doe" />
 * ```
 *
 * @example Fallback to initials
 * ```tsx
 * <Avatar alt="Jane Doe" size="lg" />
 * ```
 *
 * @example Online presence + square shape
 * ```tsx
 * <Avatar src={user.photo} alt={user.name} status="online" shape="square" />
 * ```
 */
export default function Avatar({
    src,
    alt,
    fallback,
    size = 'md',
    shape = 'circle',
    status,
    className = '',
}: AvatarProps) {
    const px = SIZE_PX[size]

    const initialsFallback = (() => {
        if (fallback) return fallback
        if (alt) {
            const parts = alt.trim().split(/\s+/).slice(0, 2)
            const initials = parts.map((p) => p[0]?.toUpperCase() ?? '').join('')
            if (initials) return initials
        }
        return <PersonSilhouette />
    })()

    return (
        <span
            className={`relative inline-block flex-shrink-0 ${className}`}
            style={{ width: px, height: px }}
        >
            <AvatarPrimitive.Root
                className={`flex w-full h-full items-center justify-center overflow-hidden bg-surface-raised text-foreground-secondary select-none ${
                    shape === 'circle' ? 'rounded-full' : 'rounded-md'
                }`}
            >
                {src && (
                    <AvatarPrimitive.Image
                        src={src}
                        alt={alt ?? ''}
                        className="h-full w-full object-cover"
                    />
                )}
                <AvatarPrimitive.Fallback
                    delayMs={src ? 300 : 0}
                    className={`flex h-full w-full items-center justify-center font-semibold ${TEXT_CLASS[size]}`}
                >
                    {initialsFallback}
                </AvatarPrimitive.Fallback>
            </AvatarPrimitive.Root>

            {status && (
                <span
                    className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background ${STATUS_CLASS[status]}`}
                    style={{
                        width:  Math.max(6, Math.round(px / 4)),
                        height: Math.max(6, Math.round(px / 4)),
                    }}
                    aria-label={`Status: ${status}`}
                    role="status"
                />
            )}
        </span>
    )
}

function PersonSilhouette() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]" aria-hidden="true">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 1116 0H4z" />
        </svg>
    )
}
