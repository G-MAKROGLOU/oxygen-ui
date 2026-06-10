import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PasswordStrength from './PasswordStrength'
import Password from './Password'

const meta: Meta<typeof PasswordStrength> = {
    title: 'Inputs/PasswordStrength',
    component: PasswordStrength,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="mx-auto max-w-sm"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof PasswordStrength>

export const Default: Story = {
    render: () => {
        const Demo = () => {
            const [pw, setPw] = useState('Tr4de!')
            return (
                <div className="flex flex-col gap-2">
                    <Password label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <PasswordStrength value={pw} />
                </div>
            )
        }
        return <Demo />
    },
}

export const WithRequirements: Story = {
    render: () => {
        const Demo = () => {
            const [pw, setPw] = useState('abc')
            return (
                <div className="flex flex-col gap-2">
                    <Password label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <PasswordStrength value={pw} showRequirements />
                </div>
            )
        }
        return <Demo />
    },
}

export const WithMatcher: Story = {
    name: 'Strength + confirm matcher',
    render: () => {
        const Demo = () => {
            const [pw, setPw] = useState('Aurora-77!')
            const [confirm, setConfirm] = useState('Aurora-7')
            return (
                <div className="flex flex-col gap-3">
                    <Password label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <Password label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    <PasswordStrength value={pw} confirmValue={confirm} showRequirements />
                </div>
            )
        }
        return <Demo />
    },
}

export const AllLevels: Story = {
    render: () => (
        <div className="flex flex-col gap-5">
            {['a', 'abc12', 'Abc12345', 'Abcd1234!xyz'].map((v) => (
                <div key={v} className="flex flex-col gap-1">
                    <code className="text-xs text-foreground-muted">{v}</code>
                    <PasswordStrength value={v} />
                </div>
            ))}
        </div>
    ),
}

export const Playground: Story = {
    args: { value: 'Tr4de-secure!', confirmValue: '', showRequirements: true, hideMeter: false },
    argTypes: {
        value: { control: 'text' },
        confirmValue: { control: 'text' },
        showRequirements: { control: 'boolean' },
        hideMeter: { control: 'boolean' },
    },
    render: (args) => (
        <PasswordStrength value={args.value} confirmValue={args.confirmValue || undefined} showRequirements={args.showRequirements} hideMeter={args.hideMeter} />
    ),
}
