import React from 'react'
import Badge from '../core/Badge'

export interface BlogPost {
    key?: string | number
    title: React.ReactNode
    excerpt?: React.ReactNode
    /** Cover image URL (rendered 16/9). */
    image?: string
    /** Tag pill shown over / above the card. */
    tag?: React.ReactNode
    author?: React.ReactNode
    /** Pre-formatted date string (you control the format / locale). */
    date?: React.ReactNode
    /** Read time, e.g. `'4 min read'`. */
    readTime?: React.ReactNode
    /** Link target — renders the card as an anchor. */
    href?: string
    onClick?: () => void
}

export interface BlogProps {
    posts: BlogPost[]
    eyebrow?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    /** Widest-breakpoint column count. Default `3`. */
    columns?: 2 | 3
    centeredHeader?: boolean
    className?: string
    style?: React.CSSProperties
}

const COLS: Record<2 | 3, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * A grid of article cards — cover image, tag, title, excerpt, and a byline of
 * author / date / read-time. Cards link out via `href` or fire `onClick`.
 *
 * @example
 * <Blog title="From the blog" posts={[
 *   { title: 'Cutting CII red days', excerpt: '…', image: cover, tag: 'Compliance', author: 'A. Costa', date: 'May 2026', href: '/blog/cii' },
 * ]} />
 */
export default function Blog({
    posts,
    eyebrow,
    title,
    description,
    columns = 3,
    centeredHeader = true,
    className = '',
    style,
}: BlogProps) {
    const hasHeader = eyebrow != null || title != null || description != null

    return (
        <section className={['w-full', className].filter(Boolean).join(' ')} style={style}>
            {hasHeader && (
                <header className={['mb-10 flex flex-col gap-3', centeredHeader ? 'items-center text-center' : 'items-start text-left'].join(' ')}>
                    {eyebrow != null && <div className="text-xs font-semibold uppercase tracking-wide text-accent">{eyebrow}</div>}
                    {title != null && <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>}
                    {description != null && <p className="max-w-2xl text-base leading-relaxed text-foreground-secondary">{description}</p>}
                </header>
            )}

            <div className={['grid grid-cols-1 gap-6', COLS[columns]].join(' ')}>
                {posts.map((post, i) => {
                    const meta = [post.author, post.date, post.readTime].filter((m) => m != null)
                    const inner = (
                        <>
                            {post.image && (
                                <div className="relative aspect-video overflow-hidden bg-backdrop">
                                    <img src={post.image} alt="" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105" loading="lazy" />
                                    {post.tag != null && (
                                        <span className="absolute left-3 top-3">
                                            <Badge tone="accent" variant="solid" size="sm">{post.tag}</Badge>
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-1 flex-col gap-2 p-5">
                                {post.tag != null && !post.image && (
                                    <div><Badge tone="accent" variant="soft" size="sm">{post.tag}</Badge></div>
                                )}
                                <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">{post.title}</h3>
                                {post.excerpt != null && <p className="line-clamp-3 text-sm leading-relaxed text-foreground-secondary">{post.excerpt}</p>}
                                {meta.length > 0 && (
                                    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-xs text-foreground-muted">
                                        {meta.map((m, j) => (
                                            <React.Fragment key={j}>
                                                {j > 0 && <span aria-hidden="true">·</span>}
                                                <span>{m}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )

                    const cardCx = 'group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

                    if (post.href) {
                        return <a key={post.key ?? i} href={post.href} className={cardCx}>{inner}</a>
                    }
                    if (post.onClick) {
                        return <button key={post.key ?? i} type="button" onClick={post.onClick} className={cardCx}>{inner}</button>
                    }
                    return <article key={post.key ?? i} className={cardCx.replace('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', '')}>{inner}</article>
                })}
            </div>
        </section>
    )
}
