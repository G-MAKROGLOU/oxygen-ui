import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import ThemeSwitch from './Switch'

const meta: Meta<typeof ThemeSwitch> = {
    title: 'Core/ThemeSwitch',
    component: ThemeSwitch,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ThemeSwitch>

export const Default: Story = {
    render: () => {
        const [checked, setChecked] = useState(false)
        return (
            <ThemeSwitch
                checked={checked}
                onChange={({ target }) => setChecked(target.checked)}
            />
        )
    },
}

export const DarkModeOn: Story = {
    args: {
        checked: true,
        onChange: () => undefined,
    },
}

export const LightModeOn: Story = {
    args: {
        checked: false,
        onChange: () => undefined,
    },
}
