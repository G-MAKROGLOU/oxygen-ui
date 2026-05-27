import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Checkbox from './Checkbox'

const meta: Meta<typeof Checkbox> = {
    title: 'Inputs/Checkbox',
    component: Checkbox,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Checkbox>

const Demo = (args: React.ComponentProps<typeof Checkbox>) => {
    const [checked, setChecked] = useState(false)
    return (
        <Checkbox
            {...args}
            checked={checked}
            onChange={(e) => setChecked(e.target.value)}
            label="Accept terms and conditions"
        />
    )
}

export const Default: Story = { render: (args) => <Demo {...args} /> }
export const Checked: Story = { args: { checked: true, label: 'Pre-checked' } }
export const Disabled: Story = { args: { checked: false, label: 'Disabled', disabled: true } }
