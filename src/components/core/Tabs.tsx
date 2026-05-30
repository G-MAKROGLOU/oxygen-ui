import React, {
    createContext,
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion, useReducedMotion } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TabsVariant = 'underline' | 'segmented' | 'enclosed'
export type TabsSize = 'sm' | 'md' | 'lg'
export type TabsOrientation = 'horizontal' | 'vertical'

interface TabsContextValue {
    value: string | undefined
    variant: TabsVariant
    size: TabsSize
    orientation: TabsOrientation
    indicatorId: string
    reduced: boolean
}

const TabsContext = createContext<TabsContextValue | null>(null)
function useTabsContext(): TabsContextValue {
    const ctx = useContext(TabsContext)
    if (!ctx) throw new Error('Tabs.List / Tabs.Trigger / Tabs.Panel must be rendered inside <Tabs>.')
    return ctx
}

const SIZE: Record<TabsSize, { trigger: string; icon: string; add: string }> = {
    sm: { trigger: 'h-8 text-xs px-2.5',  icon: 'h-3.5 w-3.5', add: 'h-8 w-8' },
    md: { trigger: 'h-10 text-sm px-3',   icon: 'h-4 w-4',     add: 'h-10 w-9' },
    lg: { trigger: 'h-12 text-sm px-4',   icon: 'h-[18px] w-[18px]', add: 'h-12 w-10' },
}

// Marker (sliding indicator) motion. Exponential ease-out per the design system;
// reduced-motion collapses to an instant move (no spatial animation).
const MARKER_TRANSITION = { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const }

// ── Root ──────────────────────────────────────────────────────────────────────

export interface TabsProps {
    /** Controlled active tab value. */
    value?: string
    /** Uncontrolled initial active tab value. */
    defaultValue?: string
    /** Fires with the next active value. */
    onValueChange?: (value: string) => void
    /** Visual style. `'underline'` (default) | `'segmented'` | `'enclosed'`. */
    variant?: TabsVariant
    /** Size preset. Default `'md'`. */
    size?: TabsSize
    /** `'horizontal'` (default) strip + panel below, or `'vertical'` rail + panel beside. */
    orientation?: TabsOrientation
    /** Extra classes merged onto the root. */
    className?: string
    /** Inline style on the root. */
    style?: React.CSSProperties
    children: React.ReactNode
}

/**
 * Compositional, motion-forward tab system on Radix Tabs.
 *
 * The active tab is marked by a thin cobalt indicator that *slides* between
 * tabs (the design system's "one rare accent" rule, not a full-fill pill).
 * Three variants — `underline` (signature), `segmented` (lifted-pill track),
 * `enclosed` (folder tabs) — plus horizontal/vertical orientation, icons,
 * count badges, closeable + add-tab, and overflow scrolling with chevrons that
 * appear only when the strip actually overflows.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="overview" variant="underline">
 *   <Tabs.List aria-label="Sections">
 *     <Tabs.Trigger value="overview" icon={<HomeIcon />}>Overview</Tabs.Trigger>
 *     <Tabs.Trigger value="activity" badge={12}>Activity</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Panel value="overview">…</Tabs.Panel>
 *   <Tabs.Panel value="activity">…</Tabs.Panel>
 * </Tabs>
 * ```
 */
function Tabs({
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    size = 'md',
    orientation = 'horizontal',
    className = '',
    style,
    children,
}: TabsProps) {
    const isControlled = value !== undefined
    const [internal, setInternal] = useState<string | undefined>(defaultValue)
    const current = isControlled ? value : internal
    const reduced = !!useReducedMotion()
    const indicatorId = useId()

    const handle = (next: string) => {
        if (!isControlled) setInternal(next)
        onValueChange?.(next)
    }

    return (
        <TabsContext.Provider value={{ value: current, variant, size, orientation, indicatorId, reduced }}>
            <TabsPrimitive.Root
                value={current}
                onValueChange={handle}
                orientation={orientation}
                className={[
                    'flex min-w-0',
                    orientation === 'vertical' ? 'flex-row gap-4' : 'flex-col gap-3',
                    className,
                ].filter(Boolean).join(' ')}
                style={style}
            >
                {children}
            </TabsPrimitive.Root>
        </TabsContext.Provider>
    )
}

// ── List (tab strip + overflow handling) ────────────────────────────────────────

export interface TabsListProps {
    children: React.ReactNode
    /** Accessible name for the tab list. */
    'aria-label'?: string
    /** Extra classes merged onto the tab strip. */
    className?: string
}

function TabsList({ children, 'aria-label': ariaLabel, className = '' }: TabsListProps) {
    const { variant, orientation, reduced } = useTabsContext()
    const horizontal = orientation === 'horizontal'
    const scrollRef = useRef<HTMLDivElement>(null)
    const [edges, setEdges] = useState({ start: false, end: false })

    // Segmented is a compact track (2-4 options) — never scrolls.
    const scrollable = variant !== 'segmented'

    useLayoutEffect(() => {
        const el = scrollRef.current
        if (!el || !scrollable) return
        const update = () => {
            if (horizontal) {
                setEdges({
                    start: el.scrollLeft > 1,
                    end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
                })
            } else {
                setEdges({
                    start: el.scrollTop > 1,
                    end: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
                })
            }
        }
        update()
        el.addEventListener('scroll', update, { passive: true })
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => { el.removeEventListener('scroll', update); ro.disconnect() }
    }, [horizontal, scrollable, children])

    const nudge = useCallback((dir: 1 | -1) => {
        const el = scrollRef.current
        if (!el) return
        const amount = (horizontal ? el.clientWidth : el.clientHeight) * 0.7 * dir
        el.scrollBy({ [horizontal ? 'left' : 'top']: amount, behavior: reduced ? 'auto' : 'smooth' })
    }, [horizontal, reduced])

    // Fade the strip's own content at any overflowing edge (background-agnostic
    // via mask-image), so tabs dissolve under the chevron rather than getting
    // hard-cut.
    const maskStyle: React.CSSProperties = scrollable && (edges.start || edges.end)
        ? (() => {
            const dir = horizontal ? 'to right' : 'to bottom'
            const a = edges.start ? 'transparent, black 36px' : 'black'
            const b = edges.end ? 'black calc(100% - 36px), transparent' : 'black'
            const img = `linear-gradient(${dir}, ${a}, ${b})`
            return { maskImage: img, WebkitMaskImage: img }
        })()
        : {}

    const trackClass = (() => {
        if (variant === 'segmented') {
            return horizontal
                ? 'inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 w-fit'
                : 'inline-flex flex-col items-stretch gap-1 rounded-lg border border-border bg-surface-raised p-1 w-fit'
        }
        // underline + enclosed share a hairline the strip sits on
        const hairline = horizontal ? 'border-b border-border' : 'border-r border-border'
        const align = variant === 'enclosed' && horizontal ? 'items-end' : 'items-stretch'
        return `flex ${horizontal ? 'flex-row' : 'flex-col'} ${align} gap-1 ${hairline}`
    })()

    const scrollClass = scrollable
        ? horizontal
            ? 'overflow-x-auto overflow-y-hidden hidden-scrollbar'
            : 'overflow-y-auto overflow-x-hidden hidden-scrollbar'
        : ''

    return (
        <div className={['relative flex min-w-0', horizontal ? 'flex-row items-stretch' : 'flex-col items-stretch', className].filter(Boolean).join(' ')}>
            {scrollable && edges.start && (
                <Chevron side="start" orientation={orientation} onClick={() => nudge(-1)} />
            )}

            <TabsPrimitive.List
                ref={scrollRef}
                aria-label={ariaLabel}
                className={[scrollClass, trackClass, 'min-w-0 flex-1'].filter(Boolean).join(' ')}
                style={maskStyle}
            >
                {children}
            </TabsPrimitive.List>

            {scrollable && edges.end && (
                <Chevron side="end" orientation={orientation} onClick={() => nudge(1)} />
            )}
        </div>
    )
}

function Chevron({ side, orientation, onClick }: { side: 'start' | 'end'; orientation: TabsOrientation; onClick: () => void }) {
    const horizontal = orientation === 'horizontal'
    // Rotate a single right-chevron glyph to the needed direction.
    const rotate =
        horizontal
            ? (side === 'start' ? 'rotate-180' : '')
            : (side === 'start' ? '-rotate-90' : 'rotate-90')
    const pos = horizontal
        ? (side === 'start' ? 'left-0 top-1/2 -translate-y-1/2' : 'right-0 top-1/2 -translate-y-1/2')
        : (side === 'start' ? 'top-0 left-1/2 -translate-x-1/2' : 'bottom-0 left-1/2 -translate-x-1/2')
    return (
        <button
            type="button"
            aria-label={side === 'start' ? 'Scroll tabs backward' : 'Scroll tabs forward'}
            onClick={onClick}
            className={`absolute z-20 ${pos} flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-foreground-secondary shadow-sm hover:text-foreground hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-4 w-4 ${rotate}`} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    )
}

// ── Trigger ─────────────────────────────────────────────────────────────────────

export interface TabsTriggerProps {
    /** Value that activates this tab and its matching `<Tabs.Panel>`. */
    value: string
    /** Optional leading icon. */
    icon?: React.ReactNode
    /** Optional trailing count badge (number or node). */
    badge?: React.ReactNode
    /** Render a × close button and call `onClose`. */
    closeable?: boolean
    onClose?: () => void
    disabled?: boolean
    /** Extra classes merged onto the trigger. */
    className?: string
    children: React.ReactNode
}

function TabsTrigger({ value, icon, badge, closeable, onClose, disabled, className = '', children }: TabsTriggerProps) {
    const { value: active, variant, size, orientation, indicatorId, reduced } = useTabsContext()
    const isActive = active === value
    const horizontal = orientation === 'horizontal'
    const sz = SIZE[size]

    const base = 'group/trigger relative inline-flex items-center justify-center whitespace-nowrap font-medium select-none transition-colors duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0'

    const variantCls =
        variant === 'segmented'
            ? `rounded-md ${isActive ? 'text-accent' : 'text-foreground-secondary hover:text-foreground'} focus-visible:text-accent`
            : variant === 'enclosed'
                ? `${horizontal ? 'rounded-t-md border border-b-0 -mb-px' : 'rounded-l-md border border-r-0 -mr-px'} ${isActive ? 'bg-surface border-border text-foreground' : 'border-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-raised'} focus-visible:text-accent`
                : `${isActive ? 'text-accent' : 'text-foreground-secondary hover:text-foreground'} focus-visible:text-accent`

    const trigger = (
        <TabsPrimitive.Trigger
            value={value}
            disabled={disabled}
            className={[base, sz.trigger, closeable ? 'pr-8' : '', variantCls, className].filter(Boolean).join(' ')}
        >
            {/* Segmented lifted pill — slides between tabs. */}
            {variant === 'segmented' && isActive && (
                <motion.span
                    layoutId={`${indicatorId}-seg`}
                    className="absolute inset-0 rounded-md bg-surface shadow-sm"
                    transition={reduced ? { duration: 0 } : MARKER_TRANSITION}
                    aria-hidden="true"
                />
            )}

            <span className="relative z-[1] inline-flex items-center gap-2 min-w-0">
                {icon && <span className={`flex-shrink-0 inline-flex items-center justify-center ${sz.icon}`}>{icon}</span>}
                <span className="truncate">{children}</span>
                {badge != null && (
                    // Unopinionated count chip: a subtle blue-tinted slate pill
                    // with near-white text, consistent across active/inactive.
                    // Both tokens are theme-relative, so it self-inverts in dark
                    // mode (light pill + dark text) and always stays legible.
                    <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground-secondary px-1.5 text-[11px] font-semibold leading-none text-background">
                        {badge}
                    </span>
                )}
            </span>

            {/* Underline marker — slides between tabs (horizontal: bottom edge;
                vertical: right edge of the rail). */}
            {variant === 'underline' && isActive && (
                <motion.span
                    layoutId={`${indicatorId}-line`}
                    className={horizontal ? 'absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-accent' : 'absolute top-1.5 bottom-1.5 right-0 w-0.5 rounded-full bg-accent'}
                    transition={reduced ? { duration: 0 } : MARKER_TRANSITION}
                    aria-hidden="true"
                />
            )}
        </TabsPrimitive.Trigger>
    )

    if (!closeable) return trigger

    // The close control is a SIBLING of the trigger (a <button> nested inside a
    // <button> is invalid HTML and breaks keyboard activation).
    return (
        <span className="relative inline-flex items-center flex-shrink-0">
            {trigger}
            <button
                type="button"
                aria-label="Close tab"
                onClick={(e) => { e.stopPropagation(); onClose?.() }}
                className="absolute right-1.5 top-1/2 z-[2] -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded text-foreground-muted hover:text-status-error hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </span>
    )
}

// ── Add ──────────────────────────────────────────────────────────────────────

export interface TabsAddProps {
    onClick?: () => void
    'aria-label'?: string
    className?: string
}

function TabsAdd({ onClick, 'aria-label': ariaLabel = 'Add tab', className = '' }: TabsAddProps) {
    const { size } = useTabsContext()
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className={`flex-shrink-0 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${SIZE[size].add} ${className}`.trim()}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
        </button>
    )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export interface TabsPanelProps {
    /** Value of the tab this panel belongs to. */
    value: string
    /**
     * Keep the panel mounted when inactive (preserves scroll / form state).
     * Default `false` — panels mount lazily on first activation.
     */
    keepMounted?: boolean
    /** Extra classes merged onto the panel. */
    className?: string
    style?: React.CSSProperties
    children: React.ReactNode
}

function TabsPanel({ value, keepMounted, className = '', style, children }: TabsPanelProps) {
    return (
        <TabsPrimitive.Content
            value={value}
            forceMount={keepMounted || undefined}
            className={['min-w-0 flex-1 focus:outline-none data-[state=inactive]:hidden', className].filter(Boolean).join(' ')}
            style={style}
        >
            {children}
        </TabsPrimitive.Content>
    )
}

// ── Compound export ─────────────────────────────────────────────────────────────

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Panel = TabsPanel
Tabs.Add = TabsAdd

export default Tabs
