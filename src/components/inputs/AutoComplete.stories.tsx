import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import AutoComplete from './AutoComplete'

const ITEMS = [
    { key: 'piraeus',   value: 'GRPIR', label: 'Piraeus'   },
    { key: 'rotterdam', value: 'NLRTM', label: 'Rotterdam' },
    { key: 'singapore', value: 'SGSIN', label: 'Singapore' },
    { key: 'houston',   value: 'USHOU', label: 'Houston'   },
    { key: 'shanghai',  value: 'CNSHA', label: 'Shanghai'  },
]

const meta: Meta<typeof AutoComplete> = {
    title: 'Forms/AutoComplete',
    component: AutoComplete,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { label: 'Port of call', items: ITEMS, placeholder: 'Type to search…' },
}
export default meta
type Story = StoryObj<typeof AutoComplete>

export const Default:  Story = {}
export const Empty:    Story = { args: { emptyText: 'No matching ports' } }
export const Disabled: Story = { args: { disabled: true } }
