import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Chat, { type ChatMessage } from './Chat'

const messages: ChatMessage[] = [
    { id: 1, authorId: 'maria', authorName: 'Maria', text: 'Hello there', timestamp: new Date(2026, 5, 1, 9, 30) },
    { id: 2, authorId: 'me', text: 'Hi Maria', timestamp: new Date(2026, 5, 1, 9, 31), status: 'read' },
]

describe('Chat', () => {
    it('renders incoming and own messages', () => {
        render(<Chat currentUserId="me" messages={messages} onSend={() => {}} />)
        expect(screen.getByText('Hello there')).toBeInTheDocument()
        expect(screen.getByText('Hi Maria')).toBeInTheDocument()
        expect(screen.getByText('Maria')).toBeInTheDocument() // author label on incoming
    })

    it('renders the empty state when there are no messages', () => {
        render(<Chat currentUserId="me" messages={[]} onSend={() => {}} />)
        expect(screen.getByText(/No messages yet/i)).toBeInTheDocument()
    })

    it('shows a typing indicator', () => {
        render(<Chat currentUserId="me" messages={messages} typingNames={['Maria']} onSend={() => {}} />)
        expect(screen.getByText('Maria is typing')).toBeInTheDocument()
    })

    it('sends on Enter (and not on Shift+Enter); clears the draft', () => {
        const onSend = vi.fn()
        render(<Chat currentUserId="me" messages={messages} onSend={onSend} />)
        const ta = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement
        fireEvent.change(ta, { target: { value: '  hi  ' } })
        fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true })
        expect(onSend).not.toHaveBeenCalled()
        fireEvent.keyDown(ta, { key: 'Enter' })
        expect(onSend).toHaveBeenCalledWith('hi') // trimmed
        expect(ta.value).toBe('')
    })

    it('disables send for an empty draft and the send button', () => {
        const onSend = vi.fn()
        render(<Chat currentUserId="me" messages={messages} onSend={onSend} />)
        const sendBtn = screen.getByRole('button', { name: 'Send' })
        expect(sendBtn).toBeDisabled()
        fireEvent.click(sendBtn)
        expect(onSend).not.toHaveBeenCalled()
    })

    it('hides the composer when hideComposer is set', () => {
        render(<Chat currentUserId="me" messages={messages} hideComposer />)
        expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull()
    })

    it('shows a skeleton while loading with no messages yet', () => {
        const { container } = render(<Chat currentUserId="me" messages={[]} loading onSend={() => {}} />)
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
        expect(screen.queryByText(/No messages yet/i)).toBeNull()
    })
})
