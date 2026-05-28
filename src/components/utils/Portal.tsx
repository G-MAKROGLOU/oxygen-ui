import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
    /** Content to render at the target node. */
    children: React.ReactNode
    /**
     * Where to mount the portal.
     * - omitted / undefined → `document.body` (the safe default for viewport-anchored UI)
     * - HTMLElement        → that exact node
     * - () => HTMLElement  → resolved at mount time (lets you query the DOM after layout)
     * - null               → portal is disabled and renders nothing
     */
    target?: HTMLElement | (() => HTMLElement | null) | null
}

/**
 * SSR-safe portal helper. Renders `children` at a detached DOM node — by
 * default `document.body` — so that any `position: fixed` descendant resolves
 * against the real viewport, never against a transformed, filtered, or
 * contained ancestor.
 *
 * ## Why this exists
 *
 * Per CSS spec, **any ancestor with `transform`, `filter`, `perspective`,
 * `will-change`, or `contain: layout|paint|strict` creates a new containing
 * block for `position: fixed` descendants**. The fixed element then resolves
 * its coordinates against that ancestor, not the viewport — silently breaking
 * full-screen overlays, toast viewports, mobile drawers, and loading screens
 * whenever the consumer wraps the component in:
 *   - a page-transition library (Framer Motion, view transitions)
 *   - a modal/drawer (Storybook's centered-layout wrapper hits this too)
 *   - a card with `contain: layout` or `will-change: transform`
 *   - a CSS filter (backdrop-blur, drop-shadow on a card)
 *
 * Portaling to `document.body` makes the component **immune** to any
 * styling its consumer applies to ancestor elements. This is the same
 * pattern Radix UI uses internally for every overlay primitive
 * (`Dialog.Portal`, `Tooltip.Portal`, `Popover.Portal`, etc.).
 *
 * ## When to use it
 *
 * Wrap any element that uses `position: fixed` to anchor itself to the
 * viewport — full-screen overlays, toast viewports, drawers, loading
 * screens, command palettes. If you're using a Radix primitive, prefer
 * its built-in `*.Portal` component (they're equivalent but match the
 * primitive's lifecycle).
 *
 * ## SSR / hydration
 *
 * `document.body` isn't available during SSR or the very first client
 * render. The component renders `null` until `useEffect` resolves the
 * target post-mount, then re-renders with the portal in place. Content
 * that needs to appear immediately on mount will paint one frame later
 * — acceptable for overlays (the trigger interaction is what kicks them
 * off anyway).
 *
 * @example Full-screen loading overlay
 * <Portal>
 *   <div className="fixed inset-0 bg-black/40 z-overlay">
 *     <Spinner />
 *   </div>
 * </Portal>
 *
 * @example Mount to a specific element
 * <Portal target={() => document.getElementById('app-root')}>
 *   <Drawer />
 * </Portal>
 *
 * @example Conditionally disable (e.g. SSR-only render)
 * <Portal target={shouldPortal ? undefined : null}>
 *   <Banner />
 * </Portal>
 */
export default function Portal({ children, target }: PortalProps) {
    const [resolved, setResolved] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (target === null) {
            setResolved(null)
            return
        }
        const node =
            typeof target === 'function' ? target() :
            target ?? document.body
        setResolved(node ?? null)
    }, [target])

    return resolved ? createPortal(children, resolved) : null
}
