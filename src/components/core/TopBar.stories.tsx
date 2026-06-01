import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TopBar from './TopBar'
import ThemeSwitch from './Switch'
import Button from '../inputs/Button'

const meta: Meta<typeof TopBar> = {
    title: 'Menu/TopBar',
    component: TopBar,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof TopBar>

/** Wordmark stub */
const Brand = () => (
    <span className="font-bold text-base tracking-tight text-foreground select-none">
        Oxygen<span className="text-accent">UI</span>
    </span>
)

/** Nav link stubs */
const NavLinks = () => (
    <nav className="flex items-center gap-1">
        {['Overview', 'Fleet', 'Reports', 'Settings'].map((item) => (
            <button
                key={item}
                type="button"
                className="px-3 py-1.5 text-sm rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-raised transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
                {item}
            </button>
        ))}
    </nav>
)

export const Default: Story = {
    args: {
        brand:   <Brand />,
        center:  <NavLinks />,
        actions: (
            <Button variant="primary" size="sm" content="New vessel" />
        ),
    },
}

function TopBarWithThemeSwitch() {
    const [dark, setDark] = useState(false)
    return (
        <TopBar
            brand={<Brand />}
            center={<NavLinks />}
            actions={
                <ThemeSwitch
                    checked={dark}
                    onChange={({ target }) => setDark(target.checked)}
                />
            }
        />
    )
}

export const WithThemeSwitch: Story = {
    render: () => <TopBarWithThemeSwitch />,
}

export const BrandOnly: Story = {
    args: {
        brand: <Brand />,
    },
}

export const ActionsOnly: Story = {
    args: {
        actions: (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" content="Sign in" />
                <Button variant="primary" size="sm" content="Get started" />
            </div>
        ),
    },
}

export const TallBar: Story = {
    args: {
        height: 72,
        brand:  <Brand />,
        center: <NavLinks />,
        actions: <Button variant="secondary" size="sm" content="Contact" />,
    },
}
