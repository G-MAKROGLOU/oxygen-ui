import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Wizard from './Wizard'
import Button from '../inputs/Button'

const meta: Meta<typeof Wizard> = {
    title: 'Feedback/Wizard',
    component: Wizard,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Guided-tour overlay that walks the user through a sequence of UI elements. Highlights each target with a portaled outline ring (no DOM mutation), shows a focus-trapped tooltip with description, supports Esc-to-dismiss, Prev / Next / Done navigation, and SSR-safe localStorage persistence.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Wizard>

// Each story uses `storageKey: null` so the wizard always starts open —
// in production you'd pass a stable key so users only see the tour once.

export const ThreeSteps: Story = {
    name: 'Three-step tour',
    render: () => {
        function Demo() {
            const dashRef = useRef<HTMLDivElement>(null)
            const sidebarRef = useRef<HTMLDivElement>(null)
            const headerRef = useRef<HTMLHeadingElement>(null)
            const [reset, setReset] = useState(0)

            return (
                <div className="min-h-screen bg-background p-6">
                    <Wizard
                        key={reset}
                        storageKey={null}
                        steps={[
                            { stepRef: headerRef,  title: 'Welcome',     description: 'This is the application header — it shows you where you are.', placement: 'bottom' },
                            { stepRef: sidebarRef, title: 'Navigation',  description: 'Jump between sections from the sidebar.',                       placement: 'right'  },
                            { stepRef: dashRef,    title: 'Workspace',   description: 'Your dashboard lives here. Right-click cards for quick actions.', placement: 'left'  },
                        ]}
                    >
                        <div className="flex flex-col gap-4 max-w-5xl mx-auto">
                            <h1 ref={headerRef} className="text-2xl font-semibold text-foreground">Fleet Dashboard</h1>

                            <div className="flex gap-4">
                                <div ref={sidebarRef} className="w-44 rounded-lg bg-surface border border-border p-4">
                                    <p className="text-sm font-medium text-foreground mb-3">Sections</p>
                                    <ul className="space-y-1 text-sm text-foreground-secondary">
                                        <li>Vessels</li>
                                        <li>Routes</li>
                                        <li>Reports</li>
                                        <li>Settings</li>
                                    </ul>
                                </div>

                                <div ref={dashRef} className="flex-1 rounded-lg bg-surface border border-border p-6 min-h-[200px]">
                                    <p className="text-sm font-medium text-foreground mb-2">Workspace</p>
                                    <p className="text-sm text-foreground-secondary">
                                        Dashboard content goes here.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button content="Restart tour" variant="secondary" onClick={() => setReset((r) => r + 1)} />
                            </div>
                        </div>
                    </Wizard>
                </div>
            )
        }
        return <Demo />
    },
}

export const NonDismissible: Story = {
    name: 'Non-dismissible (no Skip / no Esc)',
    parameters: {
        docs: {
            description: {
                story:
                    'With `dismissible={false}` the Skip button is hidden and Esc is ignored. The user must walk through every step. Use sparingly — onboarding only.',
            },
        },
    },
    render: () => {
        function Demo() {
            const targetRef = useRef<HTMLDivElement>(null)
            const [reset, setReset] = useState(0)

            return (
                <div className="min-h-screen bg-background p-12">
                    <Wizard
                        key={reset}
                        storageKey={null}
                        dismissible={false}
                        steps={[
                            { stepRef: targetRef, title: 'Required step', description: 'You must complete this tour. Esc is ignored.' },
                        ]}
                    >
                        <div className="max-w-md">
                            <div ref={targetRef} className="rounded-lg bg-surface border border-border p-6">
                                <p className="text-sm text-foreground">Mandatory feature target</p>
                            </div>
                            <Button content="Restart tour" variant="secondary" onClick={() => setReset((r) => r + 1)} className="mt-4" />
                        </div>
                    </Wizard>
                </div>
            )
        }
        return <Demo />
    },
}
