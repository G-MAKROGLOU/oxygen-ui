import React, { createContext, useContext } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'

type Align = 'start' | 'center' | 'end'
const MegaMenuContext = createContext<{ align: Align }>({ align: 'start' })

// ── Root ──────────────────────────────────────────────────────────────────────

export interface MegaMenuProps {
    /** `MegaMenu.Item` children. */
    children: React.ReactNode
    /** Where the dropdown panel aligns under the bar. Default `'start'`. */
    align?: 'start' | 'center' | 'end'
    /** Delay (ms) before a hovered item opens. Default `200`. */
    delayDuration?: number
    /** Extra classes merged onto the menu bar root. */
    className?: string
    style?: React.CSSProperties
    'aria-label'?: string
}

/**
 * Horizontal navigation bar with wide "mega" dropdown panels, built on
 * `@radix-ui/react-navigation-menu` (hover-intent open, arrow-key navigation,
 * focus management, and a shared animated viewport for free).
 *
 * Compose top-level items with `MegaMenu.Item`. An item with children opens a
 * panel (`MegaMenu.Panel` → `MegaMenu.Section` → `MegaMenu.Link`, plus an
 * optional `MegaMenu.Featured` promo column); an item with just `href` is a
 * plain top-level link. Each panel positions itself under the bar and sizes to
 * its content.
 *
 * @example
 * ```tsx
 * <MegaMenu aria-label="Main">
 *   <MegaMenu.Item label="Products">
 *     <MegaMenu.Panel>
 *       <MegaMenu.Section title="Platform">
 *         <MegaMenu.Link href="/analytics" icon={<ChartIcon />} description="Dashboards & reports">
 *           Analytics
 *         </MegaMenu.Link>
 *       </MegaMenu.Section>
 *     </MegaMenu.Panel>
 *   </MegaMenu.Item>
 *   <MegaMenu.Item label="Pricing" href="/pricing" />
 * </MegaMenu>
 * ```
 */
function MegaMenu({ children, align = 'start', delayDuration = 200, className = '', style, 'aria-label': ariaLabel }: MegaMenuProps) {
    return (
        <MegaMenuContext.Provider value={{ align }}>
            <NavigationMenu.Root
                delayDuration={delayDuration}
                aria-label={ariaLabel}
                className={['relative z-10 flex w-full', className].filter(Boolean).join(' ')}
                style={style}
            >
                <NavigationMenu.List className="flex items-center gap-1">
                    {children}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </MegaMenuContext.Provider>
    )
}

// ── Item ──────────────────────────────────────────────────────────────────────

export interface MegaMenuItemProps {
    /** Top-level label shown in the bar. */
    label: React.ReactNode
    /** Optional leading icon for the top-level item. */
    icon?: React.ReactNode
    /** When set (and no children), the item is a plain top-level link. */
    href?: string
    /** The panel (`MegaMenu.Panel`) revealed on hover/focus. Omit for a link. */
    children?: React.ReactNode
    className?: string
}

const TOP_ITEM =
    'group/top inline-flex items-center gap-1.5 h-10 px-3 rounded-md text-sm font-medium select-none ' +
    'text-foreground-secondary hover:text-foreground hover:bg-surface-raised ' +
    'data-[state=open]:text-accent data-[active]:text-accent ' +
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

function MegaMenuItem({ label, icon, href, children, className = '' }: MegaMenuItemProps) {
    const { align } = useContext(MegaMenuContext)
    const pos = align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'end' ? 'right-0' : 'left-0'
    if (!children) {
        return (
            <NavigationMenu.Item>
                <NavigationMenu.Link href={href} className={[TOP_ITEM, className].filter(Boolean).join(' ')}>
                    {icon && <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{icon}</span>}
                    {label}
                </NavigationMenu.Link>
            </NavigationMenu.Item>
        )
    }
    return (
        <NavigationMenu.Item>
            <NavigationMenu.Trigger className={[TOP_ITEM, className].filter(Boolean).join(' ')}>
                {icon && <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{icon}</span>}
                {label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"
                    className="h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 group-data-[state=open]/top:rotate-180 group-data-[state=open]/top:text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </NavigationMenu.Trigger>
            {/* The panel is a self-positioning absolute dropdown (no shared
                Radix Viewport). It sizes to its own content, so there's no
                viewport-width feedback loop. Positioned under the bar (the
                Root is `relative`) per the `align` prop. */}
            <NavigationMenu.Content
                className={`absolute top-full mt-2 ${pos} z-20 overflow-hidden rounded-lg border border-border bg-surface shadow-lg
                    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
                    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`}
            >
                {children}
            </NavigationMenu.Content>
        </NavigationMenu.Item>
    )
}

// ── Panel layout ────────────────────────────────────────────────────────────────

export interface MegaMenuPanelProps {
    children: React.ReactNode
    /** Cap the panel to roughly this many side-by-side columns before wrapping. Default: single row. */
    columns?: 1 | 2 | 3 | 4
    className?: string
    style?: React.CSSProperties
}

function MegaMenuPanel({ children, columns, className = '', style }: MegaMenuPanelProps) {
    // Flex, not grid: an absolutely-positioned dropdown shrink-wraps to its
    // content here (sections size to their min-width), so the panel width is
    // stable. `columns` just caps the width so sections wrap into rows.
    const maxWidth = columns ? `${columns * 248}px` : 'min(92vw, 880px)'
    return (
        <div
            className={['flex flex-wrap gap-6 p-6', className].filter(Boolean).join(' ')}
            style={{ maxWidth, ...style }}
        >
            {children}
        </div>
    )
}

// ── Section (a titled column of links) ──────────────────────────────────────────

export interface MegaMenuSectionProps {
    /** Section heading (uppercase eyebrow). */
    title?: React.ReactNode
    children: React.ReactNode
    className?: string
}

function MegaMenuSection({ title, children, className = '' }: MegaMenuSectionProps) {
    return (
        <div className={['min-w-[200px] flex flex-col', className].filter(Boolean).join(' ')}>
            {title && (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground-muted select-none">
                    {title}
                </p>
            )}
            <div className="flex flex-col gap-0.5">{children}</div>
        </div>
    )
}

// ── Link (rich icon + title + description) ───────────────────────────────────────

export interface MegaMenuLinkProps {
    href?: string
    /** Leading icon, shown in a tinted square. */
    icon?: React.ReactNode
    /** Secondary line under the title. */
    description?: React.ReactNode
    /** Mark as the active route. */
    active?: boolean
    onClick?: React.MouseEventHandler
    children: React.ReactNode
    className?: string
}

function MegaMenuLink({ href, icon, description, active, onClick, children, className = '' }: MegaMenuLinkProps) {
    return (
        <NavigationMenu.Link
            active={active}
            href={href}
            onClick={onClick}
            className={[
                'group/link flex items-start gap-3 rounded-md p-3 transition-colors select-none',
                'hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                'data-[active]:bg-surface-raised',
                className,
            ].filter(Boolean).join(' ')}
        >
            {icon && (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-surface-raised text-accent group-hover/link:bg-surface group-data-[active]/link:bg-surface transition-colors">
                    <span className="h-[18px] w-[18px] inline-flex items-center justify-center">{icon}</span>
                </span>
            )}
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground group-data-[active]/link:text-accent">{children}</span>
                {description && <span className="text-xs text-foreground-muted leading-snug mt-0.5">{description}</span>}
            </span>
        </NavigationMenu.Link>
    )
}

// ── Featured (promo column) ──────────────────────────────────────────────────────

export interface MegaMenuFeaturedProps {
    children: React.ReactNode
    className?: string
}

function MegaMenuFeatured({ children, className = '' }: MegaMenuFeaturedProps) {
    return (
        <div className={['min-w-[220px] rounded-lg bg-surface-raised border border-border p-4 flex flex-col', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    )
}

// ── Compound export ─────────────────────────────────────────────────────────────

MegaMenu.Item = MegaMenuItem
MegaMenu.Panel = MegaMenuPanel
MegaMenu.Section = MegaMenuSection
MegaMenu.Link = MegaMenuLink
MegaMenu.Featured = MegaMenuFeatured

export default MegaMenu
