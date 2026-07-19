import React, { useCallback, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import IconButton from './IconButton'
import { fieldShell } from '../inputs/_field'
import { cx } from '../../utils/cx'

export interface ChatMessage {
    id: string | number
    /** Author id, compared to `currentUserId` to decide own vs. incoming. */
    authorId: string | number
    /** Display name (shown above the first bubble of an incoming group). */
    authorName?: string
    /** Avatar image URL (falls back to initials of `authorName`). */
    avatar?: string
    /** Message body. */
    text: string
    /** Timestamp, Date or ISO string. */
    timestamp?: Date | string
    /** Delivery status for own messages. */
    status?: 'sent' | 'delivered' | 'read'
}

export interface ChatProps {
    messages: ChatMessage[]
    /** The viewer's id, their messages align right with the accent bubble. */
    currentUserId: string | number
    /** Fires when the composer sends a non-empty trimmed message. */
    onSend?: (text: string) => void
    /** Names currently typing, shows an animated indicator at the bottom. */
    typingNames?: string[]
    /** Header: title, subtitle, avatar, trailing actions. Omit for no header. */
    title?: React.ReactNode
    subtitle?: React.ReactNode
    avatar?: string
    headerActions?: React.ReactNode
    /** Composer placeholder. */
    placeholder?: string
    /** Disable the composer. */
    disabled?: boolean
    /** Hide the composer entirely (read-only transcript). */
    hideComposer?: boolean
    /** Shows a transcript skeleton (use while loading history, before messages arrive). */
    loading?: boolean
    /** Shown when there are no messages. */
    emptyState?: React.ReactNode
    /** Overall height, the message list scrolls within it. Default `480`. */
    height?: number | string
    className?: string
    style?: React.CSSProperties
}

const toDate = (d: Date | string): Date => (d instanceof Date ? d : new Date(d))
const timeLabel = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const initials = (name?: string) =>
    (name ?? '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('') || undefined

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
)
const ArrowDown = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
    </svg>
)

function TypingDots() {
    return (
        <span className="inline-flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
        </span>
    )
}

const SKELETON_ROWS: { own: boolean; w: number }[] = [
    { own: false, w: 150 }, { own: false, w: 110 }, { own: true, w: 180 }, { own: false, w: 130 }, { own: true, w: 90 },
]

/** Transcript placeholder shown while history loads. */
function ChatSkeleton() {
    return (
        <div className="flex flex-col gap-2" aria-hidden="true">
            {SKELETON_ROWS.map((r, i) => (
                <div key={i} className={cx('flex items-end gap-2', r.own ? 'flex-row-reverse' : '')}>
                    {!r.own && <span className="h-6 w-6 flex-shrink-0 animate-pulse rounded-full bg-surface" />}
                    <span className="h-8 animate-pulse rounded-2xl bg-surface" style={{ width: r.w }} />
                </div>
            ))}
        </div>
    )
}

/**
 * A chat / messaging surface: a scrollable transcript of message bubbles plus a
 * composer. Own messages (matching `currentUserId`) align right in the accent
 * colour; incoming messages align left on a raised surface with an avatar and
 * name. Consecutive messages from one author group together; the list
 * auto-scrolls to the newest message (with a "jump to latest" affordance when
 * you've scrolled up), and a typing indicator can be shown.
 *
 * Controlled: you own `messages`; the composer reports text via `onSend`.
 *
 * @example
 * <Chat
 *   currentUserId="me"
 *   messages={messages}
 *   typingNames={['Maria']}
 *   onSend={(text) => send(text)}
 * />
 */
export default function Chat({
    messages,
    currentUserId,
    onSend,
    typingNames = [],
    title,
    subtitle,
    avatar,
    headerActions,
    placeholder = 'Write a message…',
    disabled = false,
    hideComposer = false,
    loading = false,
    emptyState,
    height = 480,
    className = '',
    style,
}: ChatProps) {
    const listRef = useRef<HTMLDivElement>(null)
    const atBottomRef = useRef(true)
    const [showJump, setShowJump] = useState(false)
    const [draft, setDraft] = useState('')

    const hasHeader = title != null || subtitle != null || avatar != null || headerActions != null
    const isTyping = typingNames.length > 0

    const scrollToBottom = useCallback((smooth = true) => {
        const el = listRef.current
        if (!el) return
        if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
        else el.scrollTop = el.scrollHeight
    }, [])

    const onScroll = () => {
        const el = listRef.current
        if (!el) return
        const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        atBottomRef.current = near
        setShowJump(!near)
    }

    // Stick to the bottom as new messages / typing arrive, but only if the user
    // was already there (don't yank them up while reading history).
    useEffect(() => {
        if (atBottomRef.current) scrollToBottom(messages.length > 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length, isTyping])

    useEffect(() => { scrollToBottom(false) }, [scrollToBottom]) // start at the latest

    const send = () => {
        const text = draft.trim()
        if (!text || disabled) return
        onSend?.(text)
        setDraft('')
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    return (
        <div
            className={cx('flex flex-col overflow-hidden rounded-xl border border-border bg-surface', className)}
            style={{ height, ...style }}
        >
            {hasHeader && (
                <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-3">
                    {avatar != null && <Avatar src={avatar} alt={typeof title === 'string' ? title : 'Conversation'} size="sm" />}
                    <div className="min-w-0 flex-1">
                        {title != null && <div className="truncate text-sm font-semibold text-foreground">{title}</div>}
                        {subtitle != null && <div className="truncate text-xs text-foreground-muted">{subtitle}</div>}
                    </div>
                    {headerActions != null && <div className="flex flex-shrink-0 items-center gap-1">{headerActions}</div>}
                </div>
            )}

            {/* Transcript */}
            <div className="relative flex-1 overflow-hidden">
                <div ref={listRef} onScroll={onScroll} className="flex h-full flex-col gap-1 overflow-y-auto bg-background px-4 py-3">
                    {loading && messages.length === 0 ? (
                        <ChatSkeleton />
                    ) : messages.length === 0 && !isTyping ? (
                        <div className="flex flex-1 items-center justify-center text-center text-sm text-foreground-muted">
                            {emptyState ?? 'No messages yet. Say hello 👋'}
                        </div>
                    ) : (
                        messages.map((m, i) => {
                            const own = m.authorId === currentUserId
                            const prev = messages[i - 1]
                            const next = messages[i + 1]
                            const firstOfGroup = !prev || prev.authorId !== m.authorId
                            const lastOfGroup = !next || next.authorId !== m.authorId
                            const ts = m.timestamp ? toDate(m.timestamp) : null
                            return (
                                <div key={m.id} className={cx('flex items-end gap-2', own ? 'flex-row-reverse' : '', firstOfGroup ? 'mt-2 first:mt-0' : '')}>
                                    {/* Avatar gutter (incoming only; one per group, bottom-aligned) */}
                                    {!own && (
                                        <div className="w-7 flex-shrink-0">
                                            {lastOfGroup && <Avatar src={m.avatar} alt={m.authorName ?? 'User'} fallback={initials(m.authorName)} size="xs" />}
                                        </div>
                                    )}
                                    <div className={['flex max-w-[78%] flex-col', own ? 'items-end' : 'items-start'].join(' ')}>
                                        {firstOfGroup && !own && m.authorName && (
                                            <span className="mb-0.5 px-1 text-[11px] font-medium text-foreground-muted">{m.authorName}</span>
                                        )}
                                        <div
                                            className={cx(
                                                'whitespace-pre-wrap break-words px-3 py-1.5 text-sm leading-snug',
                                                own
                                                    ? 'rounded-2xl bg-accent text-accent-fg'
                                                    : 'rounded-2xl border border-border bg-surface text-foreground',
                                                lastOfGroup ? (own ? 'rounded-br-md' : 'rounded-bl-md') : '',
                                            )}
                                        >
                                            {m.text}
                                        </div>
                                        {lastOfGroup && (ts || (own && m.status)) && (
                                            <span className="mt-0.5 px-1 text-[10px] text-foreground-muted">
                                                {ts && timeLabel(ts)}
                                                {own && m.status && <span className="ml-1 capitalize">· {m.status}</span>}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {isTyping && (
                        <div className="mt-2 flex items-end gap-2">
                            <div className="w-7 flex-shrink-0" />
                            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-3 py-2">
                                <TypingDots />
                                <span className="text-[11px] text-foreground-muted">
                                    {typingNames.length === 1 ? `${typingNames[0]} is typing` : `${typingNames.length} people are typing`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {showJump && (
                    <button
                        type="button"
                        onClick={() => scrollToBottom(true)}
                        aria-label="Jump to latest"
                        className="absolute bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground-secondary shadow-md transition-colors hover:bg-surface-raised hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                        <ArrowDown />
                    </button>
                )}
            </div>

            {/* Composer */}
            {!hideComposer && (
                <div className="flex flex-shrink-0 items-end gap-2 border-t border-border p-3">
                    <textarea
                        rows={2}
                        value={draft}
                        disabled={disabled}
                        placeholder={placeholder}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        aria-label="Message"
                        // Fixed height (no auto-grow); long messages scroll with the
                        // global styled scrollbar.
                        className={`${fieldShell({ size: 'md', hasError: false, disabled, sized: false })} h-[4.5rem] flex-1 resize-none px-3 py-2 leading-snug`}
                    />
                    <IconButton
                        type="primary"
                        icon={<SendIcon />}
                        title="Send"
                        disabled={disabled || draft.trim().length === 0}
                        onClick={send}
                    />
                </div>
            )}
        </div>
    )
}
