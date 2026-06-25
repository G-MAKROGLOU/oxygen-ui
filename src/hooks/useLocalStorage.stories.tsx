import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLocalStorage } from './useLocalStorage'
import TextInput from '../components/inputs/TextInput'
import Button from '../components/inputs/Button'

const meta: Meta = {
    title: 'Hooks/useLocalStorage',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

export const Demo: Story = {
    name: 'Persisted input',
    render: () => {
        const Example = () => {
            const [name, setName, clear] = useLocalStorage('oxy.demo.name', '')
            return (
                <div style={{ width: 320 }} className="flex flex-col gap-3">
                    <TextInput label="Your name (persisted)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type, then reload the page" />
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
                        <span className="text-foreground-muted">localStorage</span>
                        <code className="text-foreground">{JSON.stringify(name)}</code>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" content="Clear" onClick={clear} />
                    </div>
                    <p className="text-xs text-foreground-muted">Reload the Storybook frame: the value survives. Open this story in two tabs to see cross-tab sync.</p>
                </div>
            )
        }
        return <Example />
    },
}

export const Playground: Story = {
    args: { storageKey: 'oxygen-demo', initialValue: 'hello' },
    argTypes: { storageKey: { control: 'text' }, initialValue: { control: 'text' } },
    render: (args: { storageKey: string; initialValue: string }) => {
        const Demo = () => {
            const [value, setValue, remove] = useLocalStorage(args.storageKey, args.initialValue)
            return (
                <div className="flex w-72 flex-col gap-2">
                    <TextInput label={`localStorage["${args.storageKey}"]`} value={value} onChange={(e) => setValue(e.target.value)} />
                    <Button content="Reset to initial" variant="outline" onClick={remove} />
                    <p className="text-xs text-foreground-muted">Edit, then refresh: it persists. Change the key/initial value in Controls.</p>
                </div>
            )
        }
        return <Demo key={args.storageKey} />
    },
}
