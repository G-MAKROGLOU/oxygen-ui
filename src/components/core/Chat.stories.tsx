import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Chat, { type ChatMessage } from './Chat'

const meta: Meta<typeof Chat> = {
    title: 'Data Display/Chat',
    component: Chat,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Chat>

const t = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000)

const seed: ChatMessage[] = [
    { id: 1, authorId: 'maria', authorName: 'Maria Ferreira', text: 'Hey! Did the vessel report come through?', timestamp: t(9) },
    { id: 2, authorId: 'me', text: 'Yes, just reviewed it — looks good.', timestamp: t(8), status: 'read' },
    { id: 3, authorId: 'me', text: 'One note on the fuel figures though.', timestamp: t(8), status: 'read' },
    { id: 4, authorId: 'maria', authorName: 'Maria Ferreira', text: 'Oh? What did you find?', timestamp: t(6) },
    { id: 5, authorId: 'maria', authorName: 'Maria Ferreira', text: 'Send it over when you can 🙏', timestamp: t(6) },
]

export const Default: Story = {
    name: 'Live conversation',
    render: () => {
        const Demo = () => {
            const [messages, setMessages] = useState<ChatMessage[]>(seed)
            const [typing, setTyping] = useState<string[]>([])
            const idRef = useRef(100)
            const send = (text: string) => {
                setMessages((m) => [...m, { id: idRef.current++, authorId: 'me', text, timestamp: new Date(), status: 'sent' }])
                setTyping(['Maria'])
                window.setTimeout(() => {
                    setTyping([])
                    setMessages((m) => [...m, { id: idRef.current++, authorId: 'maria', authorName: 'Maria Ferreira', text: 'Got it, thanks! 👍', timestamp: new Date() }])
                }, 1500)
            }
            return (
                <div style={{ width: 420 }}>
                    <Chat currentUserId="me" title="Maria Ferreira" subtitle="Online" messages={messages} typingNames={typing} onSend={send} />
                </div>
            )
        }
        return <Demo />
    },
}

export const Empty: Story = {
    render: () => <div style={{ width: 420 }}><Chat currentUserId="me" title="New conversation" messages={[]} onSend={() => {}} /></div>,
}

export const ReadOnlyTranscript: Story = {
    name: 'Read-only transcript',
    render: () => <div style={{ width: 420 }}><Chat currentUserId="me" title="Support thread #4821" subtitle="Resolved" messages={seed} hideComposer /></div>,
}

export const Typing: Story = {
    render: () => <div style={{ width: 420 }}><Chat currentUserId="me" title="Maria Ferreira" messages={seed} typingNames={['Maria']} onSend={() => {}} /></div>,
}
