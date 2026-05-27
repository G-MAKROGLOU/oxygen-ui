import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NotificationProvider, useNotification } from './Notification'
import type { NotificationPosition } from './Notification'
import Button from '../inputs/Button'

const meta: Meta = {
    title: 'Core/Notification',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta

// ── Trigger panel ─────────────────────────────────────────────────────────────

function TriggerPanel({ position }: { position?: NotificationPosition }) {
    const { info, success, warning, danger } = useNotification()
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" variant="secondary" content="Info"    onClick={() => info({    title: 'Info',    description: 'A useful piece of information.' })} />
            <Button size="sm" variant="secondary" content="Success" onClick={() => success({ title: 'Success', description: 'Operation completed successfully.' })} />
            <Button size="sm" variant="secondary" content="Warning" onClick={() => warning({ title: 'Warning', description: 'Please review before proceeding.' })} />
            <Button size="sm" variant="danger"    content="Error"   onClick={() => danger({  title: 'Error',   description: 'Something went wrong. Try again.' })} />
            {position && (
                <p className="w-full text-center text-xs text-foreground-muted mt-1">
                    Position: <code className="font-mono">{position}</code>
                </p>
            )}
        </div>
    )
}

// ── Per-position stories ──────────────────────────────────────────────────────

const POSITIONS: NotificationPosition[] = [
    'top-right', 'top-left', 'top-center',
    'bottom-right', 'bottom-left', 'bottom-center',
]

export const TopRight: StoryObj = {
    render: () => (
        <NotificationProvider position="top-right">
            <TriggerPanel position="top-right" />
        </NotificationProvider>
    ),
}

export const TopLeft: StoryObj = {
    render: () => (
        <NotificationProvider position="top-left">
            <TriggerPanel position="top-left" />
        </NotificationProvider>
    ),
}

export const TopCenter: StoryObj = {
    render: () => (
        <NotificationProvider position="top-center">
            <TriggerPanel position="top-center" />
        </NotificationProvider>
    ),
}

export const BottomRight: StoryObj = {
    render: () => (
        <NotificationProvider position="bottom-right">
            <TriggerPanel position="bottom-right" />
        </NotificationProvider>
    ),
}

export const BottomLeft: StoryObj = {
    render: () => (
        <NotificationProvider position="bottom-left">
            <TriggerPanel position="bottom-left" />
        </NotificationProvider>
    ),
}

export const BottomCenter: StoryObj = {
    render: () => (
        <NotificationProvider position="bottom-center">
            <TriggerPanel position="bottom-center" />
        </NotificationProvider>
    ),
}

export const AllPositions: StoryObj = {
    parameters: { layout: 'padded' },
    render: () => (
        <div className="grid grid-cols-3 gap-4">
            {POSITIONS.map((pos) => (
                <NotificationProvider key={pos} position={pos}>
                    <div className="border border-border rounded-lg p-4 flex flex-col items-center gap-2">
                        <p className="text-xs font-medium text-foreground-secondary font-mono">{pos}</p>
                        <TriggerPanel />
                    </div>
                </NotificationProvider>
            ))}
        </div>
    ),
}
