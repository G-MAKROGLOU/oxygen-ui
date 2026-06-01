import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import MegaMenu from './MegaMenu'

const meta: Meta<typeof MegaMenu> = {
    title: 'Menu/MegaMenu',
    component: MegaMenu,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Horizontal navigation bar with wide "mega" dropdown panels, on `@radix-ui/react-navigation-menu` (hover-intent open, arrow-key nav, focus management, shared animated viewport). Compose with `MegaMenu.Item` (a panel item or a plain link), `MegaMenu.Panel` → `MegaMenu.Section` → `MegaMenu.Link`, and an optional `MegaMenu.Featured` promo column.',
            },
        },
    },
    argTypes: {
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        delayDuration: { control: { type: 'number' } },
        responsive: { control: 'boolean' },
        mobileLabel: { control: 'text' },
    },
    decorators: [
        (Story) => (
            <div className="min-h-[460px] bg-background px-6 pt-4">
                <Story />
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof MegaMenu>

const Ic = {
    chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3" /></svg>,
    bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>,
    shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" /></svg>,
    cube: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5" /></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5zM18 3v16" /></svg>,
    life: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path strokeLinecap="round" d="M5 5l4 4M19 5l-4 4M5 19l4-4M19 19l-4-4" /></svg>,
}

export const Default: Story = {
    render: (args) => (
        <MegaMenu {...args} aria-label="Main">
            <MegaMenu.Item label="Products">
                <MegaMenu.Panel columns={2}>
                    <MegaMenu.Section title="Platform">
                        <MegaMenu.Link href="#" icon={Ic.chart} description="Dashboards, reports, and live metrics">Analytics</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.bolt} description="Real-time event pipeline">Streams</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.cube} description="Model your fleet and assets">Registry</MegaMenu.Link>
                    </MegaMenu.Section>
                    <MegaMenu.Section title="Operations">
                        <MegaMenu.Link href="#" icon={Ic.shield} description="Policies, audit, and access" active>Security</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.life} description="Incidents and on-call">Support desk</MegaMenu.Link>
                    </MegaMenu.Section>
                </MegaMenu.Panel>
            </MegaMenu.Item>

            <MegaMenu.Item label="Solutions">
                <MegaMenu.Panel>
                    <MegaMenu.Section title="By industry">
                        <MegaMenu.Link href="#" icon={Ic.cube} description="Vessel tracking & compliance">Maritime</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.bolt} description="Grid + asset monitoring">Energy</MegaMenu.Link>
                    </MegaMenu.Section>
                    <MegaMenu.Featured>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">New</span>
                        <h4 className="mt-1 text-sm font-semibold text-foreground">Fleet Intelligence</h4>
                        <p className="mt-1 text-xs text-foreground-secondary leading-snug flex-1">Predictive maintenance across your whole fleet, in one console.</p>
                        <a href="#" className="mt-3 text-sm font-medium text-accent hover:text-accent-hover">Explore →</a>
                    </MegaMenu.Featured>
                </MegaMenu.Panel>
            </MegaMenu.Item>

            <MegaMenu.Item label="Docs" href="#" icon={Ic.book} />
            <MegaMenu.Item label="Pricing" href="#" />
        </MegaMenu>
    ),
}

export const SingleColumn: Story = {
    name: 'Single section + featured',
    render: () => (
        <MegaMenu aria-label="Main">
            <MegaMenu.Item label="Resources">
                <MegaMenu.Panel>
                    <MegaMenu.Section title="Learn">
                        <MegaMenu.Link href="#" icon={Ic.book} description="Guides and references">Documentation</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.life} description="Talk to the team">Support</MegaMenu.Link>
                    </MegaMenu.Section>
                    <MegaMenu.Featured>
                        <h4 className="text-sm font-semibold text-foreground">Changelog</h4>
                        <p className="mt-1 text-xs text-foreground-secondary leading-snug flex-1">Shipped this week: MegaMenu, redesigned Tabs, and the Form API.</p>
                        <a href="#" className="mt-3 text-sm font-medium text-accent hover:text-accent-hover">Read more →</a>
                    </MegaMenu.Featured>
                </MegaMenu.Panel>
            </MegaMenu.Item>
            <MegaMenu.Item label="Company" href="#" />
        </MegaMenu>
    ),
}

export const Responsive: Story = {
    name: 'Responsive (mobile fallback)',
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
        docs: {
            description: {
                story:
                    'Below the `md` breakpoint the hover bar collapses into a tap-friendly hamburger disclosure — a vertical accordion built from the same items. Use the Storybook viewport toolbar (or narrow the window) to see it. Set `responsive={false}` to keep the desktop bar at every width.',
            },
        },
    },
    render: () => (
        <MegaMenu aria-label="Main" mobileLabel="Menu">
            <MegaMenu.Item label="Products">
                <MegaMenu.Panel columns={2}>
                    <MegaMenu.Section title="Platform">
                        <MegaMenu.Link href="#" icon={Ic.chart} description="Dashboards, reports, and live metrics">Analytics</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.bolt} description="Real-time event pipeline">Streams</MegaMenu.Link>
                    </MegaMenu.Section>
                    <MegaMenu.Section title="Operations">
                        <MegaMenu.Link href="#" icon={Ic.shield} description="Policies, audit, and access">Security</MegaMenu.Link>
                        <MegaMenu.Link href="#" icon={Ic.life} description="Incidents and on-call">Support desk</MegaMenu.Link>
                    </MegaMenu.Section>
                </MegaMenu.Panel>
            </MegaMenu.Item>
            <MegaMenu.Item label="Docs" href="#" icon={Ic.book} />
            <MegaMenu.Item label="Pricing" href="#" />
        </MegaMenu>
    ),
}
