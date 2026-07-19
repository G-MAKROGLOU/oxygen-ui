import React from 'react'

export interface TopBarProps {
    /** Brand area, logo, wordmark, or app name. Rendered on the leading edge. */
    brand?: React.ReactNode
    /**
     * Centre content, primary navigation links, breadcrumb, or page title.
     * On mobile (< md breakpoint) this moves below the brand row.
     */
    center?: React.ReactNode
    /**
     * Trailing actions, theme toggle, user avatar, notification bell, etc.
     * Rendered on the trailing edge.
     */
    actions?: React.ReactNode
    /**
     * Height in pixels (default 56). Controls the `h-*` style directly so
     * child scroll-offset calculations can consume it as a CSS var.
     */
    height?: number
    /** Additional className on the root element */
    className?: string
}

/**
 * App-shell top navigation bar.
 *
 * Three named slots: brand (leading), center, actions (trailing).
 * All slots are optional, omit what you don't need.
 *
 * The component is sticky by default (`sticky top-0`) with `z-[100]`.
 * Height is exposed as `--topbar-height` CSS variable on the element so
 * layout children can reference it for scroll-offset or sticky positioning.
 *
 * Light/dark aware via Phase B semantic tokens.
 *
 * @example
 * <TopBar
 *   brand={<Logo />}
 *   center={<NavLinks />}
 *   actions={
 *     <>
 *       <ThemeSwitch checked={isDark} onChange={toggleDark} />
 *       <UserAvatar />
 *     </>
 *   }
 * />
 */
export default function TopBar({
    brand,
    center,
    actions,
    height = 56,
    className = '',
}: TopBarProps) {
    return (
        <header
            className={[
                'sticky top-0 z-[100]',
                'flex items-center justify-between gap-4',
                'border-b border-border bg-surface',
                'px-4 md:px-6',
                className,
            ].join(' ')}
            style={{
                height,
                // Expose as CSS var so consumers can write:
                //   padding-top: calc(var(--topbar-height) + 1rem)
                ['--topbar-height' as string]: `${height}px`,
            }}
        >
            {/* ── Brand ── */}
            {brand !== undefined ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {brand}
                </div>
            ) : (
                // Reserve leading space even when brand is null so center stays centred
                <div aria-hidden="true" className="flex-shrink-0 w-0" />
            )}

            {/* ── Centre ── */}
            {center !== undefined && (
                <div className="flex flex-1 items-center justify-center min-w-0">
                    {center}
                </div>
            )}

            {/* ── Actions ── */}
            {actions !== undefined && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                </div>
            )}
        </header>
    )
}
