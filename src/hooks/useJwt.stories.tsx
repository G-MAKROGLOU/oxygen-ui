import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useJwt } from './useJwt'
import TextArea from '../components/inputs/TextArea'
import Badge from '../components/core/Badge'

const meta: Meta = {
    title: 'Hooks/useJwt',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// A sample token (alg HS256), exp ~1 hour out, for the demo. Not a real secret.
const sampleToken = (() => {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: '42', name: 'Ada Lovelace', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })}.demo-signature`
})()

export const Demo: Story = {
    name: 'Decode & inspect',
    render: () => {
        const Example = () => {
            const [token, setToken] = useState(sampleToken)
            const { payload, header, expiresAt, isExpired, isValid } = useJwt<{ sub?: string; name?: string; role?: string }>(token)
            return (
                <div style={{ width: 460 }} className="flex flex-col gap-3">
                    <TextArea label="JWT" value={token} onChange={(e) => setToken(e.target.value)} rows={3} />
                    <div className="flex gap-2">
                        <Badge tone={isValid ? 'success' : 'error'} variant="soft">{isValid ? 'valid' : 'invalid'}</Badge>
                        <Badge tone={isExpired ? 'error' : 'neutral'} variant="soft">{isExpired ? 'expired' : 'not expired'}</Badge>
                        {expiresAt && <Badge tone="neutral" variant="soft">exp {expiresAt.toLocaleTimeString()}</Badge>}
                    </div>
                    <pre className="overflow-auto rounded-lg border border-border bg-surface-raised p-3 text-[11px] leading-relaxed text-foreground-secondary">
                        {JSON.stringify({ header, payload }, null, 2)}
                    </pre>
                </div>
            )
        }
        return <Example />
    },
}

const SAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwfQ.s5_aXm6n9c0qVQ4l9b5Xy7lFh0n8m3o2p1q9r8s7t6u'

export const Playground: Story = {
    args: { token: SAMPLE_JWT },
    argTypes: { token: { control: 'text' } },
    render: (args: { token: string }) => {
        const Demo = () => {
            const jwt = useJwt(args.token)
            return (
                <div className="flex w-80 flex-col gap-2">
                    <TextArea label="JWT" value={args.token} rows={3} onChange={() => {}} />
                    <Badge tone={jwt.isValid ? 'success' : 'error'} variant="soft">{jwt.isValid ? 'valid' : jwt.isExpired ? 'expired' : 'invalid'}</Badge>
                    <pre className="overflow-auto rounded-lg border border-border bg-surface p-3 text-xs text-foreground-secondary">{JSON.stringify(jwt, null, 2)}</pre>
                </div>
            )
        }
        return <Demo />
    },
}
