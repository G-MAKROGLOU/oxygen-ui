import React, { createContext, useContext } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

// ── Context (carries the chevron preference down to each item) ──────────────────

type AccordionVariant = 'separated' | 'contained'
const AccordionCtx = createContext<{ variant: AccordionVariant }>({ variant: 'separated' })

// ── Root ────────────────────────────────────────────────────────────────────────

export interface AccordionProps {
    /** `AccordionItem` children. */
    children: React.ReactNode
    /**
     * `'single'` (default) allows one open panel at a time; `'multiple'` lets
     * any number be open together.
     */
    type?: 'single' | 'multiple'
    /** Uncontrolled initial open value(s). */
    defaultValue?: string | string[]
    /** Controlled open value(s). */
    value?: string | string[]
    /** Fires when the open set changes. */
    onValueChange?: (value: string | string[]) => void
    /** In `single` mode, allow the open item to be collapsed. Default `true`. */
    collapsible?: boolean
    /**
     * Visual style:
     * - `'separated'` (default) — each item is its own bordered card with gaps.
     * - `'contained'` — one bordered surface with divider lines between items.
     */
    variant?: AccordionVariant
    /** Extra classes merged onto the root. */
    className?: string
    style?: React.CSSProperties
}

/**
 * Vertically stacked, collapsible panels built on `@radix-ui/react-accordion`.
 * Radix handles open/close state, keyboard navigation (↑/↓/Home/End), and ARIA;
 * the content height animates via the shared `accordion-down` / `accordion-up`
 * keyframes (reduced-motion safe — the height var simply snaps).
 *
 * @example
 * ```tsx
 * <Accordion type="single" defaultValue="a" collapsible>
 *   <Accordion.Item value="a" title="What is included?">
 *     Everything in the Pro plan, plus priority support.
 *   </Accordion.Item>
 *   <Accordion.Item value="b" title="Can I cancel anytime?">
 *     Yes — cancel from billing settings, no questions asked.
 *   </Accordion.Item>
 * </Accordion>
 * ```
 */
function Accordion({
    children,
    type = 'single',
    defaultValue,
    value,
    onValueChange,
    collapsible = true,
    variant = 'separated',
    className = '',
    style,
}: AccordionProps) {
    // Radix types `single` and `multiple` roots differently; this component
    // exposes one ergonomic surface and forwards the right props per mode.
    const common = {
        className: [
            variant === 'contained'
                ? 'rounded-lg border border-border bg-surface overflow-hidden divide-y divide-border'
                : 'flex flex-col gap-2',
            className,
        ].filter(Boolean).join(' '),
        style,
    }

    const inner = <AccordionCtx.Provider value={{ variant }}>{children}</AccordionCtx.Provider>

    if (type === 'multiple') {
        return (
            <AccordionPrimitive.Root
                type="multiple"
                defaultValue={defaultValue as string[] | undefined}
                value={value as string[] | undefined}
                onValueChange={onValueChange as ((v: string[]) => void) | undefined}
                {...common}
            >
                {inner}
            </AccordionPrimitive.Root>
        )
    }

    return (
        <AccordionPrimitive.Root
            type="single"
            collapsible={collapsible}
            defaultValue={defaultValue as string | undefined}
            value={value as string | undefined}
            onValueChange={onValueChange as ((v: string) => void) | undefined}
            {...common}
        >
            {inner}
        </AccordionPrimitive.Root>
    )
}

// ── Item ──────────────────────────────────────────────────────────────────────────

export interface AccordionItemProps {
    /** Unique value identifying this panel (used for open state). */
    value: string
    /** Header content — the always-visible trigger label. */
    title: React.ReactNode
    /** Optional leading icon shown before the title. */
    icon?: React.ReactNode
    /** Panel body, revealed when open. */
    children: React.ReactNode
    /** Disable this item (header non-interactive, dimmed). */
    disabled?: boolean
    className?: string
}

const Chevron = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        className="h-4 w-4 flex-shrink-0 text-foreground-muted transition-transform duration-200 group-data-[state=open]/acc:rotate-180 group-data-[state=open]/acc:text-accent">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
)

function AccordionItem({ value, title, icon, children, disabled, className = '' }: AccordionItemProps) {
    const { variant } = useContext(AccordionCtx)
    return (
        <AccordionPrimitive.Item
            value={value}
            disabled={disabled}
            className={[
                variant === 'separated' ? 'rounded-lg border border-border bg-surface overflow-hidden' : '',
                'data-[disabled]:opacity-60',
                className,
            ].filter(Boolean).join(' ')}
        >
            <AccordionPrimitive.Header className="m-0">
                <AccordionPrimitive.Trigger
                    className="group/acc flex w-full items-center gap-3 px-4 py-3 text-left select-none
                        text-sm font-medium text-foreground transition-colors
                        hover:bg-surface-raised data-[state=open]:text-accent
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset
                        disabled:cursor-not-allowed"
                >
                    {icon && <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-foreground-muted group-data-[state=open]/acc:text-accent">{icon}</span>}
                    <span className="flex-1 min-w-0">{title}</span>
                    {Chevron}
                </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
                className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
            >
                <div className="px-4 pb-4 pt-0 text-sm text-foreground-secondary leading-relaxed">
                    {children}
                </div>
            </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
    )
}

// ── Compound export ─────────────────────────────────────────────────────────────

Accordion.Item = AccordionItem

export default Accordion
