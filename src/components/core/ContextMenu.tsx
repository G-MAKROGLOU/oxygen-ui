import React, { useEffect, useRef, useState } from 'react'
import COLORS from '../../utils/colors'

export interface ContextMenuActionItem {
    key: string | number
    value: React.ReactNode
    icon?: React.ReactNode
    onClick?: (path?: string, reportType?: string) => void
    path?: string
    reportType?: string
    children?: ContextMenuActionItem[]
}

export interface ContextMenuPosition {
    x: number
    y: number
}

export interface ContextMenuProps {
    items: ContextMenuActionItem[]
    position: ContextMenuPosition
    visible: boolean
    onClose: () => void
}

/**
 * Right-click context menu positioned at arbitrary screen coordinates.
 *
 * Decoupled from `useData()` — the app manages `visible`, `position`, and
 * `items` in its own state and passes them here.
 *
 * @example
 * const [ctx, setCtx] = useState({ visible: false, items: [], position: { x: 0, y: 0 } })
 *
 * <div onContextMenu={(e) => {
 *   e.preventDefault()
 *   setCtx({ visible: true, items: menuItems, position: { x: e.clientX, y: e.clientY } })
 * }}>...</div>
 *
 * <ContextMenu {...ctx} onClose={() => setCtx(c => ({ ...c, visible: false }))} />
 */
export default function ContextMenu({ items, position, visible, onClose }: ContextMenuProps) {
    const contextRef = useRef<HTMLDivElement>(null)
    const childMenuRef = useRef<HTMLDivElement>(null)

    const [hasArrowUp, setHasArrowUp] = useState(true)
    const [childArrowUp, setChildArrowUp] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(-1)
    const [hoveredChild, setHoveredChild] = useState(-1)
    const [activeChildren, setActiveChildren] = useState<ContextMenuActionItem[]>([])

    useEffect(() => {
        const clickAway = ({ target }: MouseEvent) => {
            if (contextRef.current && !contextRef.current.contains(target as Node)) {
                if (childMenuRef.current) {
                    childMenuRef.current.classList.add('opacity-0')
                    childMenuRef.current.style.left = '0px'
                    childMenuRef.current.style.top = '0px'
                }
                setActiveChildren([])
                onClose()
            }
        }
        window.addEventListener('click', clickAway)
        return () => window.removeEventListener('click', clickAway)
    }, [onClose])

    useEffect(() => {
        const current = contextRef.current
        const child = childMenuRef.current
        if (!current || !child) return

        const { height, width } = current.getBoundingClientRect()
        if (position.y + height >= window.innerHeight) {
            current.style.top = `${position.y - (height - 40)}px`
            setHasArrowUp(false)
        } else {
            current.style.top = `${position.y}px`
            setHasArrowUp(true)
        }
        current.style.left = `${position.x}px`
        child.style.width = `${width}px`
        child.classList.add('opacity-0')
    }, [position])

    const onItemClick = (e: React.MouseEvent, item: ContextMenuActionItem) => {
        if (item.onClick) {
            if (childMenuRef.current) {
                childMenuRef.current.classList.add('opacity-0')
                childMenuRef.current.style.left = '0px'
                childMenuRef.current.style.top = '0px'
            }
            setActiveChildren([])
            item.onClick(item.path, item.reportType)
        } else if (item.children?.length) {
            const targetBbox = (e.target as HTMLElement).getBoundingClientRect()
            const childHeight = childMenuRef.current?.getBoundingClientRect().height ?? 0
            const contextBbox = contextRef.current?.getBoundingClientRect() ?? { y: 0, width: 0, height: 0 }
            const contextWidth = contextBbox.width

            if (targetBbox.y + childHeight >= window.innerHeight) {
                setChildArrowUp(false)
                if (childMenuRef.current) childMenuRef.current.style.top = `${targetBbox.y - childHeight}px`
            } else {
                setChildArrowUp(true)
                if (childMenuRef.current)
                    childMenuRef.current.style.top = `${targetBbox.y - contextBbox.y + targetBbox.height / 2 - 10}px`
            }
            setActiveChildren(item.children)
            if (childMenuRef.current) {
                childMenuRef.current.classList.remove('opacity-0')
                childMenuRef.current.style.left = `${Math.round(contextWidth + 10)}px`
            }
        }
    }

    if (!visible) return null

    return (
        <div
            ref={contextRef}
            className={`transition-all duration-150 absolute rounded-lg bg-ice text-prussian-blue z-30 flex ${
                hasArrowUp && hoveredItem === 0
                    ? 'context-arrow-up context-arrow-hovered'
                    : !hasArrowUp && hoveredItem === items.length - 1
                    ? 'context-arrow-down context-arrow-hovered'
                    : hasArrowUp
                    ? 'context-arrow-up'
                    : 'context-arrow-down'
            }`}
        >
            <ul className="z-50">
                {items.map((item, index) => (
                    <li
                        key={item.key}
                        onContextMenu={(e) => e.preventDefault()}
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(-1)}
                        className={`flex items-center justify-between transition-all duration-300 p-2 cursor-pointer hover:bg-ice-dark ${
                            index === 0 ? 'rounded-tl-lg rounded-tr-lg' : ''
                        } ${index === items.length - 1 ? 'rounded-bl-lg rounded-br-lg' : ''}`}
                        onClick={(e) => onItemClick(e, item)}
                    >
                        <div className="flex items-center gap-2 pointer-events-none">
                            {item.icon}
                            {item.value}
                        </div>
                        <div className="pointer-events-none">
                            {item.children && (
                                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Sub-menu */}
            <div
                ref={childMenuRef}
                className={`transition-all duration-150 absolute rounded-lg bg-ice text-prussian-blue ${
                    childArrowUp && hoveredChild === 0
                        ? 'context-arrow-up context-arrow-hovered'
                        : !childArrowUp && hoveredChild === activeChildren.length - 1
                        ? 'context-arrow-down context-arrow-hovered'
                        : childArrowUp
                        ? 'context-arrow-up'
                        : 'context-arrow-down'
                }`}
            >
                <ul>
                    {activeChildren.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center gap-2 p-2 cursor-pointer transition-all duration-150 hover:bg-ice-dark ${
                                index === 0 ? 'rounded-tl-lg rounded-tr-lg' : ''
                            } ${index === activeChildren.length - 1 ? 'rounded-bl-lg rounded-br-lg' : ''}`}
                            onClick={() => item.onClick?.(item.path, item.reportType)}
                            onMouseEnter={() => setHoveredChild(index)}
                            onMouseLeave={() => setHoveredChild(-1)}
                        >
                            {item.icon}
                            {item.value}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
