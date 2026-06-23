import { createContext, useContext } from 'react'

/**
 * The DOM node of the nearest modal dialog's content (Modal / Drawer), or
 * `null` when not inside one.
 *
 * Modal dialogs install a scroll-lock (react-remove-scroll) that blocks wheel
 * events everywhere outside the dialog content. Floating UI portals (Popover,
 * Dropdown menus) default to `document.body`, which is outside that subtree, so
 * their internal scroll areas never receive the wheel. Components that portal a
 * scrollable surface read this context and portal into the dialog content
 * instead, where the lock treats them as an exempt shard.
 */
export const DialogContainerContext = createContext<HTMLElement | null>(null)

/** The nearest Modal/Drawer content node to portal floating content into, or `null`. */
export function useDialogContainer(): HTMLElement | null {
    return useContext(DialogContainerContext)
}
