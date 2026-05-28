import React from 'react'
import Tooltip from './Tooltip'

export interface MenuBarItemProps {
    icon: React.ReactNode
    isActive: boolean
    title: string
    /** Called when the item is clicked (navigation or logout etc.) */
    onClick?: () => void
}

/**
 * Single item in the MenuBar sidebar.
 *
 * Decoupled from React Router and context — navigation is delegated to `onClick`.
 * The Tooltip is powered by Radix (same as the standalone Tooltip component).
 *
 * @example
 * <MenuBarItem
 *   icon={<Icon.Dashboard />}
 *   title="Dashboard"
 *   isActive={pathname === '/dashboard'}
 *   onClick={() => navigate('/dashboard')}
 * />
 */
export default function MenuBarItem({ icon, isActive, title, onClick }: MenuBarItemProps) {
    return (
        <Tooltip title={title} placement="right">
            <div
                role="button"
                aria-label={title}
                aria-current={isActive ? 'page' : undefined}
                className={`transition duration-300 hover:bg-prussian-blue ${
                    isActive ? 'bg-prussian-blue' : ''
                } rounded-lg p-2 cursor-pointer`}
                onClick={onClick}
                tabIndex={0}
                onKeyDown={(e) => {
                    // Space and Enter are both canonical activation keys for
                    // role="button". preventDefault stops Space from scrolling
                    // the page when the button is focused.
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick?.()
                    }
                }}
            >
                {icon}
            </div>
        </Tooltip>
    )
}
