import React, { useEffect, useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

export interface TabItem {
    key: string
    title: React.ReactNode
    content: React.ReactNode
}

export interface TabsProps {
    tabs?: TabItem[]
    onTabChange?: (prev: TabItem | undefined, next: TabItem | undefined) => void
    onTabClose?: (key: string) => void
    /** Only mount the active tab's content */
    isLazy?: boolean
    tabsClosable?: boolean
    defaultActiveTab?: string
}

/**
 * Scrollable pill-style tabs powered by Radix Tabs.
 *
 * Radix handles roving-tabindex keyboard navigation and ARIA roles.
 * Rounded pill style, fully themed via semantic design tokens.
 * Supports dynamic tab add/remove with automatic activation.
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { key: 'v1', title: 'Vessel 1', content: <Panel1 /> },
 *     { key: 'v2', title: 'Vessel 2', content: <Panel2 /> },
 *   ]}
 *   tabsClosable
 *   onTabClose={(key) => removetab(key)}
 * />
 */
export default function Tabs({
    tabs = [],
    onTabChange,
    onTabClose,
    isLazy,
    tabsClosable = true,
    defaultActiveTab,
}: TabsProps) {
    const [value, setValue] = useState<string>(() => defaultActiveTab ?? tabs[0]?.key ?? '')

    // Sync when external defaultActiveTab changes
    useEffect(() => {
        if (defaultActiveTab) setValue(defaultActiveTab)
    }, [defaultActiveTab])

    // When tabs are added / removed, keep a valid active tab
    useEffect(() => {
        if (tabs.length === 0) {
            setValue('')
            return
        }
        const exists = tabs.find((t) => t.key === value)
        if (!exists) {
            // Activate last tab (mimics original behaviour on close)
            setValue(tabs[tabs.length - 1].key)
        }
    }, [tabs, value])

    const handleValueChange = (newValue: string) => {
        const prev = tabs.find((t) => t.key === value)
        const next = tabs.find((t) => t.key === newValue)
        onTabChange?.(prev, next)
        setValue(newValue)
    }

    const toPreviousTab = () => {
        const idx = tabs.findIndex((t) => t.key === value)
        if (idx > 0) handleValueChange(tabs[idx - 1].key)
    }

    const toNextTab = () => {
        const idx = tabs.findIndex((t) => t.key === value)
        if (idx < tabs.length - 1) handleValueChange(tabs[idx + 1].key)
    }

    if (tabs.length === 0) return null

    return (
        <TabsPrimitive.Root
            value={value}
            onValueChange={handleValueChange}
            className="h-full max-w-full flex flex-col gap-2"
        >
            {/* Tab strip */}
            <div className="bg-surface border border-border rounded-lg flex items-center justify-between flex-shrink-0 w-full p-1 overflow-hidden">
                {/* Left chevron */}
                <button
                    type="button"
                    onClick={toPreviousTab}
                    aria-label="Previous tab"
                    className="cursor-pointer rounded-lg transition-colors duration-150 hover:bg-surface-raised text-foreground-secondary hover:text-foreground rotate-180 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Pills list */}
                <TabsPrimitive.List
                    aria-label="Tabs"
                    className="flex-1 flex items-center gap-1 overflow-x-auto overflow-y-hidden rounded-lg scroll-smooth snap-x snap-mandatory hidden-scrollbar"
                >
                    {tabs.map((tab) => (
                        // Trigger + close button are SIBLINGS, not nested.
                        // Nesting a clickable element inside <button> is invalid
                        // HTML and breaks keyboard activation of the inner one.
                        // The wrapper carries `group` so the close button can
                        // react to the trigger's `data-state=active` for styling.
                        <div
                            key={tab.key}
                            className="snap-start snap-always relative flex items-center flex-1 min-w-[120px] max-w-[220px] flex-shrink-0 group"
                        >
                            <TabsPrimitive.Trigger
                                value={tab.key}
                                className={`w-full ${tabsClosable ? 'pr-8' : 'pr-3'} pl-3 py-2 rounded-3xl cursor-pointer transition-all duration-200 select-none h-10 text-left
                                           text-foreground-secondary bg-surface-raised
                                           hover:bg-surface hover:text-foreground
                                           data-[state=active]:bg-accent data-[state=active]:text-accent-foreground
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                            >
                                <span className="truncate text-sm block">{tab.title}</span>
                            </TabsPrimitive.Trigger>
                            {tabsClosable && (
                                <button
                                    type="button"
                                    aria-label={`Close ${tab.title}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onTabClose?.(tab.key)
                                    }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-foreground-secondary group-data-[state=active]:text-accent-foreground hover:bg-black/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </TabsPrimitive.List>

                {/* Right chevron */}
                <button
                    type="button"
                    onClick={toNextTab}
                    aria-label="Next tab"
                    className="cursor-pointer rounded-lg transition-colors duration-150 hover:bg-surface-raised text-foreground-secondary hover:text-foreground flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Content pane */}
            <div className="p-2 rounded-lg w-full flex-1 min-h-0 bg-surface border border-border overflow-hidden">
                {isLazy ? (
                    // Mount only the active content
                    tabs
                        .filter((t) => t.key === value)
                        .map((t) => (
                            <TabsPrimitive.Content key={t.key} value={t.key} className="w-full h-full focus:outline-none">
                                {t.content}
                            </TabsPrimitive.Content>
                        ))
                ) : (
                    // Pre-mount all, hide non-active via Radix
                    tabs.map((t) => (
                        <TabsPrimitive.Content key={t.key} value={t.key} className="w-full h-full focus:outline-none" forceMount>
                            <div className={`w-full h-full ${t.key === value ? 'block' : 'hidden'}`}>
                                {t.content}
                            </div>
                        </TabsPrimitive.Content>
                    ))
                )}
            </div>
        </TabsPrimitive.Root>
    )
}
