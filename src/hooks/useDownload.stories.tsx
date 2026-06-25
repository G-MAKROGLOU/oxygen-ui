import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDownload } from './useDownload'
import Button from '../components/inputs/Button'

const meta: Meta = {
    title: 'Hooks/useDownload',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ── SaveBlob ──────────────────────────────────────────────────────────────────

export const SaveBlob: Story = {
    name: 'saveBlob: download any Blob',
    parameters: {
        docs: {
            description: {
                story:
                    'Wraps a Blob in a transient `<a download>` anchor, clicks it, then revokes the object-URL after one tick. ' +
                    'Both `saveBlob` and `saveFromBase64` are stable across renders: safe to pass as event-handler props.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { saveBlob } = useDownload()

            const downloadCsv = () => {
                const rows = [
                    ['Vessel', 'IMO', 'DWT', 'CII'],
                    ['MV Aurora', 9876543, 81200, 'B'],
                    ['MV Borealis', 9123456, 115000, 'C'],
                    ['MV Calypso', 9234567, 64000, 'A'],
                ]
                const csv = rows.map((r) => r.join(',')).join('\r\n')
                saveBlob(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }), 'fleet.csv')
            }

            const downloadJson = () => {
                const payload = JSON.stringify({ generated: new Date().toISOString(), vessels: 3 }, null, 2)
                saveBlob(new Blob([payload], { type: 'application/json' }), 'report.json')
            }

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 320 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">saveBlob(blob, fileName)</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Any Blob, any MIME type. The object-URL is created and revoked internally.
                        </p>
                    </div>
                    <div className="flex w-full gap-3">
                        <Button variant="secondary" content="Download CSV" onClick={downloadCsv} className="flex-1" />
                        <Button variant="secondary" content="Download JSON" onClick={downloadJson} className="flex-1" />
                    </div>
                </div>
            )
        }
        return <Demo />
    },
}

// ── SaveFromBase64: data URI ─────────────────────────────────────────────────

export const SaveFromBase64DataUri: Story = {
    name: 'saveFromBase64: data-URI (MIME inferred)',
    parameters: {
        docs: {
            description: {
                story:
                    'When the input starts with `data:<mime>;base64,`, the MIME is extracted automatically. ' +
                    'Useful when a server returns a pre-formed data URI.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { saveFromBase64 } = useDownload()
            // A valid 1×1 red PNG as a data URI: no network required.
            const dataUri =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1Pe' +
                'AAAADklEQVQI12P4z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=='

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 320 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">saveFromBase64(dataUri, 'image.png')</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            No explicit <code>mimeType</code> argument: it's inferred from the{' '}
                            <code>data:image/png;base64,</code> prefix.
                        </p>
                    </div>
                    <Button
                        content="Download 1×1 PNG"
                        onClick={() => saveFromBase64(dataUri, 'dot.png')}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── SaveFromBase64: raw payload ──────────────────────────────────────────────

export const SaveFromBase64RawPayload: Story = {
    name: 'saveFromBase64: raw payload with explicit MIME',
    parameters: {
        docs: {
            description: {
                story:
                    'When the server returns a raw base64 string (no `data:` prefix), pass the MIME type explicitly as the third argument. ' +
                    "Falls back to `'application/octet-stream'` when both prefix and argument are absent.",
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { saveFromBase64 } = useDownload()
            const raw = btoa('Vessel,IMO\nMV Aurora,9876543\nMV Borealis,9123456')

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 320 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">saveFromBase64(raw, 'data.csv', 'text/csv')</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Raw base64 payload (no <code>data:</code> prefix). The MIME type must be supplied explicitly.
                        </p>
                    </div>
                    <Button
                        content="Download vessels.csv"
                        onClick={() => saveFromBase64(raw, 'vessels.csv', 'text/csv;charset=utf-8')}
                    />
                </div>
            )
        }
        return <Demo />
    },
}
