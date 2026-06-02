import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import type { SidebarSection, SidebarProps } from './Sidebar'
import Portal from '../layout/Portal'

export interface AppShellProps {
    /**
     * Top navigation bar.
     * Typically `<TopBar brand={...} actions={...} />`.
     * On mobile, a hamburger button is injected to the left of this slot when
     * `sidebarSections` is non-empty. The TopBar should leave some leading space
     * (or use its `center` / `actions` props) to avoid overlap.
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
 *
 * **Responsive behaviour:**
 * - **≥ md (768 px):** Sidebar renders inline, collapsible via its own toggle.
 * - **< md (mobile):** Sidebar becomes a fixed overlay drawer. A hamburger
 *   button appears to the left of the TopBar slot to open it. Tapping the
 *   backdrop or the sidebar's own toggle closes it.
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
    const [expanded,   setExpanded]   = useState(sidebarDefaultExpanded)
    const [isMobile,   setIsMobile]   = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Track mobile breakpoint
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)')
        const update = (e: MediaQueryList | MediaQueryListEvent) => setIsMobile(e.matches)
        update(mq)
        mq.addEventListener('change', update as (e: MediaQueryListEvent) => void)
        return () => mq.removeEventListener('change', update as (e: MediaQueryListEvent) => void)
    }, [])

    // Auto-close mobile sidebar on resize to desktop
    useEffect(() => {
        if (!isMobile) setMobileOpen(false)
    }, [isMobile])

    const hasSidebar = sidebarSections.length > 0

    return (
        <div className={`flex flex-col h-screen bg-background ${className}`}>

            {/* ── TopBar row ── */}
            {topBar && (
                <div className="flex-shrink-0 flex items-stretch z-topbar">
                    {/* Mobile hamburger — injected to the left of the TopBar on small screens */}
                    {hasSidebar && (
                        <button
                            type="button"
                            className={[
                                'md:hidden flex-shrink-0 self-stretch flex items-center justify-center w-14',
                                'border-r border-border',
                                'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
                                'transition-colors duration-100',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                            ].join(' ')}
                            onClick={() => setMobileOpen((o) => !o)}
                            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? (
                                /* X icon */
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            ) : (
                                /* Hamburger icon */
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    )}
                    {/* TopBar fills remaining width */}
                    <div className="flex-1 min-w-0">
                        {topBar}
                    </div>
                </div>
            )}

            {/* ── Body row: Sidebar + Content ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Desktop inline sidebar */}
                {hasSidebar && !isMobile && (
                    <Sidebar
                        sections={sidebarSections}
                        isExpanded={expanded}
                        onToggle={() => setExpanded((e) => !e)}
                        expandedWidth={sidebarExpandedWidth}
                        collapsedWidth={sidebarCollapsedWidth}
                        footer={sidebarFooter}
                    />
                )}

                {/* Mobile sidebar overlay — portaled to <body> so the fixed
                    backdrop and drawer always cover the real viewport, never
                    a transformed/contained ancestor (page-transition libs,
                    CSS `contain`, parent `will-change`, etc.). */}
                {hasSidebar && isMobile && (
                    <Portal>
                        {/* Backdrop */}
                        <AnimatePresence>
                            {mobileOpen && (
                                <motion.div
                                    className="fixed inset-0 bg-backdrop z-overlay md:hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    onClick={() => setMobileOpen(false)}
                                    aria-hidden="true"
                                />
                            )}
                        </AnimatePresence>

                        {/* Sidebar panel */}
                        <AnimatePresence>
                            {mobileOpen && (
                                <motion.div
                                    className="fixed inset-y-0 left-0 z-modal md:hidden"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{
                                        type: 'tween',
                                        duration: 0.26,
                                        ease: [0.16, 1, 0.3, 1], // ease-out-expo
                                    }}
                                >
                                    <Sidebar
                                        sections={sidebarSections}
                                        isExpanded={true}
                                        onToggle={() => setMobileOpen(false)}
                                        expandedWidth={sidebarExpandedWidth}
                                        collapsedWidth={sidebarCollapsedWidth}
                                        footer={sidebarFooter}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Portal>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="h-full p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

// Re-export SidebarSection for consumer convenience
export type { SidebarSection, SidebarItem } from './Sidebar'
