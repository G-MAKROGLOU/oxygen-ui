import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import FAB from './FAB'

const meta: Meta<typeof FAB> = {
    title: 'Buttons/FAB',
    component: FAB,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        position: { control: 'inline-radio', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] },
        size: { control: 'inline-radio', options: ['md', 'lg'] },
        tone: { control: 'inline-radio', options: ['accent', 'neutral'] },
    },
    decorators: [(Story) => <div className="relative h-[420px] bg-background overflow-hidden"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof FAB>

const Plus = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
const Doc = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l4 4v14H7z M14 3v4h4" /></svg>
const Folder = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6l2 2h10v9H3z" /></svg>
const Upload = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>

export const Single: Story = {
    args: { icon: Plus, label: 'New record', position: 'bottom-right', size: 'lg', tone: 'accent', fixed: false },
}

export const SpeedDial: Story = {
    args: {
        icon: Plus,
        label: 'Create',
        position: 'bottom-right',
        fixed: false,
        actions: [
            { icon: Doc, label: 'Document' },
            { icon: Folder, label: 'Folder' },
            { icon: Upload, label: 'Upload' },
        ],
    },
}
