import React, { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse, delay, ws } from 'msw'
import Chat, { type ChatMessage } from './Chat'
import Button from '../inputs/Button'

const meta: Meta<typeof Chat> = {
    title: 'Data Display/Chat',
    component: Chat,
    parameters: { layout: 'centered' },
    argTypes: {
        title: { control: 'text' },
        subtitle: { control: 'text' },
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
        hideComposer: { control: 'boolean' },
        loading: { control: 'boolean' },
        height: { control: { type: 'number' } },
    },
}
export default meta
type Story = StoryObj<typeof Chat>

const t = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000)
const AVA = 'https://i.pravatar.cc/64?img=47'

const seed: ChatMessage[] = [
    { id: 1, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: 'Hey! Did the vessel report come through?', timestamp: t(9) },
    { id: 2, authorId: 'me', text: 'Yes, just reviewed it — looks good.', timestamp: t(8), status: 'read' },
    { id: 3, authorId: 'me', text: 'One note on the fuel figures though.', timestamp: t(8), status: 'read' },
    { id: 4, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: 'Oh? What did you find?', timestamp: t(6) },
    { id: 5, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: 'Send it over when you can 🙏', timestamp: t(6) },
]

const Frame = ({ children }: { children: React.ReactNode }) => <div style={{ width: 420 }}>{children}</div>

// Controlled wrapper used by several stories: append on send, fake a reply.
function Conversation(props: Partial<React.ComponentProps<typeof Chat>> & { initial?: ChatMessage[] }) {
    const { initial = seed, ...rest } = props
    const [messages, setMessages] = useState<ChatMessage[]>(initial)
    const [typing, setTyping] = useState<string[]>([])
    const id = useRef(1000)
    const send = (text: string) => {
        setMessages((m) => [...m, { id: id.current++, authorId: 'me', text, timestamp: new Date(), status: 'sent' }])
        setTyping(['Maria'])
        window.setTimeout(() => {
            setTyping([])
            setMessages((m) => [...m, { id: id.current++, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: 'Got it, thanks! 👍', timestamp: new Date() }])
        }, 1400)
    }
    return <Chat currentUserId="me" messages={messages} typingNames={typing} onSend={send} {...rest} />
}

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
    args: { title: 'Maria Ferreira', subtitle: 'Online', placeholder: 'Write a message…', disabled: false, hideComposer: false, loading: false, height: 480 },
    render: (args) => <Frame><Conversation {...args} /></Frame>,
}

// ── Individual props / anatomy ──────────────────────────────────────────────────

export const Default: Story = {
    render: () => <Frame><Conversation /></Frame>,
}

export const WithHeaderAvatarAndActions: Story = {
    name: 'Header — avatar + actions',
    render: () => (
        <Frame>
            <Conversation
                title="Maria Ferreira"
                subtitle="Online · last seen just now"
                avatar={AVA}
                headerActions={<Button size="sm" variant="ghost" content="View profile" />}
            />
        </Frame>
    ),
}

export const Grouping: Story = {
    name: 'Message grouping + statuses',
    render: () => (
        <Frame>
            <Chat
                currentUserId="me"
                title="Maria Ferreira"
                avatar={AVA}
                onSend={() => {}}
                messages={[
                    { id: 1, authorId: 'maria', authorName: 'Maria', avatar: AVA, text: 'Three in a row…', timestamp: t(5) },
                    { id: 2, authorId: 'maria', authorName: 'Maria', avatar: AVA, text: '…group under one avatar…', timestamp: t(5) },
                    { id: 3, authorId: 'maria', authorName: 'Maria', avatar: AVA, text: '…with the time on the last bubble.', timestamp: t(5) },
                    { id: 4, authorId: 'me', text: 'Sent.', timestamp: t(4), status: 'sent' },
                    { id: 5, authorId: 'me', text: 'Delivered.', timestamp: t(4), status: 'delivered' },
                    { id: 6, authorId: 'me', text: 'Read.', timestamp: t(3), status: 'read' },
                ]}
            />
        </Frame>
    ),
}

export const Typing: Story = {
    render: () => <Frame><Chat currentUserId="me" title="Maria Ferreira" avatar={AVA} messages={seed} typingNames={['Maria']} onSend={() => {}} /></Frame>,
}

export const Loading: Story = {
    name: 'Loading (skeleton)',
    render: () => <Frame><Chat currentUserId="me" title="Maria Ferreira" avatar={AVA} messages={[]} loading onSend={() => {}} /></Frame>,
}

export const Empty: Story = {
    render: () => <Frame><Chat currentUserId="me" title="New conversation" messages={[]} onSend={() => {}} /></Frame>,
}

export const CustomEmptyState: Story = {
    name: 'Custom empty state',
    render: () => (
        <Frame>
            <Chat
                currentUserId="me"
                title="Support"
                messages={[]}
                emptyState={<div className="flex flex-col items-center gap-2"><span className="text-2xl">💬</span><span>Start a conversation with our team.</span></div>}
                onSend={() => {}}
            />
        </Frame>
    ),
}

export const DisabledComposer: Story = {
    name: 'Disabled composer',
    render: () => <Frame><Chat currentUserId="me" title="Maria Ferreira" avatar={AVA} messages={seed} disabled placeholder="You can’t reply to this thread" onSend={() => {}} /></Frame>,
}

export const ReadOnlyTranscript: Story = {
    name: 'Read-only transcript',
    render: () => <Frame><Chat currentUserId="me" title="Support thread #4821" subtitle="Resolved" messages={seed} hideComposer /></Frame>,
}

export const Tall: Story = {
    name: 'Custom height',
    render: () => <Frame><Conversation height={620} title="Maria Ferreira" subtitle="Online" avatar={AVA} /></Frame>,
}

// ── Async history via MSW (HTTP) ────────────────────────────────────────────────

export const AsyncHistory: Story = {
    name: 'Async history — MSW (HTTP)',
    parameters: {
        msw: {
            handlers: [
                http.get('/api/chat/history', async () => {
                    await delay(900)
                    return HttpResponse.json(seed.map((m) => ({ ...m, timestamp: (m.timestamp as Date).toISOString() })))
                }),
            ],
        },
        docs: { description: { story: 'History is fetched from `GET /api/chat/history` (mocked by MSW, 900 ms). The skeleton shows while `loading`, then the transcript fills in.' } },
    },
    render: () => {
        const Demo = () => {
            const [messages, setMessages] = useState<ChatMessage[]>([])
            const [loading, setLoading] = useState(true)
            useEffect(() => {
                let cancelled = false
                fetch('/api/chat/history')
                    .then((r) => r.json())
                    .then((data) => { if (!cancelled) setMessages(data) })
                    .finally(() => { if (!cancelled) setLoading(false) })
                return () => { cancelled = true }
            }, [])
            return <Chat currentUserId="me" title="Maria Ferreira" subtitle="Online" avatar={AVA} messages={messages} loading={loading} onSend={() => {}} />
        }
        return <Frame><Demo /></Frame>
    },
}

// ── Real-time via a WebSocket (MSW ws) ──────────────────────────────────────────

const chatSocket = ws.link('wss://chat.oxygen.example/room/*')

export const LiveSocket: Story = {
    name: 'Real-time — WebSocket (MSW ws)',
    parameters: {
        msw: {
            handlers: [
                chatSocket.addEventListener('connection', ({ client }) => {
                    // Server streams a few incoming messages on connect…
                    const lines = ['Hey! 👋', 'Did the noon report sync?', 'Ping me when you get a sec.']
                    let i = 0
                    const push = () => {
                        if (i >= lines.length) return
                        client.send(JSON.stringify({ id: `srv-${i}`, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: lines[i++], timestamp: new Date().toISOString() }))
                        window.setTimeout(push, 1600)
                    }
                    window.setTimeout(push, 700)
                    // …and acks anything the client sends.
                    client.addEventListener('message', () => {
                        window.setTimeout(() => client.send(JSON.stringify({ id: `ack-${Date.now()}`, authorId: 'maria', authorName: 'Maria Ferreira', avatar: AVA, text: 'Got it 👍', timestamp: new Date().toISOString() })), 800)
                    })
                }),
            ],
        },
        docs: { description: { story: 'Chat is fed by a real `WebSocket`, mocked by MSW (`ws.link`). Incoming frames append to state; the composer sends frames and shows your message optimistically. Connection status drives the subtitle + loading skeleton.' } },
    },
    render: () => {
        const Demo = () => {
            const [messages, setMessages] = useState<ChatMessage[]>([])
            const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting')
            const sock = useRef<WebSocket | null>(null)
            useEffect(() => {
                const socket = new WebSocket('wss://chat.oxygen.example/room/42')
                sock.current = socket
                socket.onopen = () => setStatus('online')
                socket.onclose = () => setStatus('offline')
                socket.onmessage = (e) => {
                    try { setMessages((m) => [...m, JSON.parse(e.data) as ChatMessage]) } catch { /* ignore */ }
                }
                return () => socket.close()
            }, [])
            const send = (text: string) => {
                setMessages((m) => [...m, { id: `me-${Date.now()}`, authorId: 'me', text, timestamp: new Date(), status: 'sent' }])
                sock.current?.send(JSON.stringify({ text }))
            }
            return <Chat currentUserId="me" title="Maria Ferreira" subtitle={status} avatar={AVA} messages={messages} loading={status === 'connecting'} onSend={send} />
        }
        return <Frame><Demo /></Frame>
    },
}
