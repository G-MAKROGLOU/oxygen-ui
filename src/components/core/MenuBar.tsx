import React from 'react'
import MenuBarItem, { MenuBarItemProps } from './MenuBarItem'

export interface MenuBarItemConfig extends MenuBarItemProps {
    key: string
}

export interface MenuBarProps {
    items: MenuBarItemConfig[]
}

/**
 * Vertical icon sidebar (left edge of the app).
 *
 * Decoupled from React Router, useAuth, and useData.
 * The app composes the items array (with `onClick` handlers) and passes it in.
 *
 * @example
 * const items: MenuBarItemConfig[] = [
 *   { key: 'dash', icon: <Icon.Dashboard />, title: 'Dashboard', isActive: pathname === '/dashboard', onClick: () => navigate('/dashboard') },
 *   { key: 'logout', icon: <Icon.PowerOff />, title: 'Sign Out', isActive: false, onClick: logOut },
 * ]
 * <MenuBar items={items} />
 */
export default function MenuBar({ items }: MenuBarProps) {
    return (
        // `calculated-height` was an orphaned CSS class. Replaced with `h-full`
        // so the MenuBar fills whatever vertical space its parent gives it.
        <nav
            aria-label="Main navigation"
            className="w-16 h-full bg-surface-raised rounded-tr-lg rounded-br-lg flex flex-col gap-2 items-center p-2 z-50"
        >
            {items.map((item) => (
                <MenuBarItem
                    key={item.key}
                    icon={item.icon}
                    title={item.title}
                    isActive={item.isActive}
                    onClick={item.onClick}
                />
            ))}
        </nav>
    )
}
