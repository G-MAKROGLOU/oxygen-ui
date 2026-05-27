import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import type { SidebarSection, SidebarProps } from './Sidebar'

export interface AppShellProps {
    /**
     * Top navigation bar.
     * Typically `<TopBar brand={...} actions={...} />`.
     */
    topBar?: React.ReactNode

    /** Sidebar navigation sections */
    sidebarSections?: SidebarSection[]

    /** Expanded width of the sidebar in px (default 220) */
    sidebarExpandedWidth?: SidebarProps['expandedWidth']

    /** Collapsed width of the sidebar in px (default 52) */
    sidebarCollapsedWidth?: SidebarProps['collapsedWidth']

    /** Start expanded (default false) */
    sidebarDefaultExpanded?: boolean

    /** Slot rendered at the bottom of the sidebar */
    sidebarFooter?: SidebarProps['footer']

    /** Main page content */
    children?: React.ReactNode

    /** Root element className */
    className?: string
}

/**
 * Full-page application layout skeleton.
 *
 * Composes a sticky TopBar + collapsible Sidebar + scrollable content area.
 * The main area shifts with the sidebar width via a Framer Motion margin animation.
 *
 * @example
 * <AppShell
 *   topBar={<TopBar brand={<Logo />} actions={<ThemeSwitch ... />} />}
 *   sidebarSections={NAV_SECTIONS}
 * >
 *   <PageContent />
 * </AppShell>
 */
export default function AppShell({
    topBar,
    sidebarSections = [],
    sidebarExpandedWidth  = 220,
    sidebarCollapsedWidth = 52,
    sidebarDefaultExpanded = false,
    sidebarFooter,
    children,
    className = '',
}: AppShellProps) {
    const [expanded, setExpanded] = useState(sidebarDefaultExpanded)

    return (
        <div className={`flex flex-col h-screen bg-background ${className}`}>
            {/* ── TopBar ── */}
            {topBar && (
                <div className="flex-shrink-0 z-[200]">
                    {topBar}
                </div>
            )}

            {/* ── Body row: Sidebar + Content ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {sidebarSections.length > 0 && (
                    <Sidebar
                        sections={sidebarSections}
                        isExpanded={expanded}
                        onToggle={() => setExpanded((e) => !e)}
                        expandedWidth={sidebarExpandedWidth}
                        collapsedWidth={sidebarCollapsedWidth}
                        footer={sidebarFooter}
                    />
                )}

                {/* Main content — shifts right as sidebar expands */}
                <motion.main
                    className="flex-1 overflow-y-auto overflow-x-hidden"
                    animate={{ marginLeft: 0 }}
                    transition={{ type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    // The Sidebar itself is flex-shrink-0 and uses Framer Motion on its own
                    // width, so the main area reflowing via flex is sufficient.
                    // This motion.main exists for custom override / future controlled layout.
                >
                    <div className="h-full p-6">
                        {children}
                    </div>
                </motion.main>
            </div>
        </div>
    )
}

// Re-export SidebarSection for consumer convenience
export type { SidebarSection, SidebarItem } from './Sidebar'
