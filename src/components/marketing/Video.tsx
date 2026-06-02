import React, { useState } from 'react'

export interface VideoProps {
    /** A video file URL (rendered as a native `<video>`). */
    src?: string
    /** An embed URL (YouTube / Vimeo / etc.), rendered in an `<iframe>`. Takes precedence over `src`. */
    embedUrl?: string
    /** Poster image (native video, and the click-to-play thumbnail). */
    poster?: string
    /** Aspect ratio of the frame. Default `'16/9'`. */
    aspect?: '16/9' | '4/3' | '1/1' | '21/9'
    /** Accessible title for the frame. */
    title?: string
    /** Native controls. Default `true`. */
    controls?: boolean
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    /** Rounded corners + border. Default `true`. */
    framed?: boolean
    className?: string
    style?: React.CSSProperties
}

const PlayGlyph = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7 translate-x-0.5">
        <path d="M8 5v14l11-7z" />
    </svg>
)

/**
 * A responsive video frame that keeps its aspect ratio at any width. Renders a
 * native `<video>` for file `src` (with an optional click-to-play poster
 * overlay) or an `<iframe>` for an `embedUrl` (YouTube, Vimeo, …).
 *
 * @example
 * <Video src="/clips/tour.mp4" poster="/clips/tour.jpg" title="Product tour" />
 * <Video embedUrl="https://www.youtube.com/embed/abc123" title="Webinar" />
 */
export default function Video({
    src,
    embedUrl,
    poster,
    aspect = '16/9',
    title,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    framed = true,
    className = '',
    style,
}: VideoProps) {
    const [playing, setPlaying] = useState(autoPlay)
    const frame = ['relative w-full overflow-hidden bg-backdrop', framed ? 'rounded-2xl border border-border shadow-sm' : '', className].filter(Boolean).join(' ')
    const ratio = aspect.replace('/', ' / ')

    return (
        <div className={frame} style={{ aspectRatio: ratio, ...style }}>
            {embedUrl ? (
                <iframe
                    src={embedUrl}
                    title={title ?? 'Embedded video'}
                    className="absolute inset-0 h-full w-full"
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : src ? (
                <>
                    <video
                        src={src}
                        poster={poster}
                        title={title}
                        controls={controls && playing}
                        autoPlay={playing}
                        loop={loop}
                        muted={muted || autoPlay}
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    {!playing && (
                        <button
                            type="button"
                            aria-label={title ? `Play ${title}` : 'Play video'}
                            onClick={() => setPlaying(true)}
                            className="group absolute inset-0 flex items-center justify-center focus:outline-none"
                            style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        >
                            <span className="absolute inset-0" style={{ backgroundColor: 'color-mix(in oklab, var(--color-foreground) 30%, transparent)' }} aria-hidden="true" />
                            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-accent shadow-lg transition-transform duration-200 ease-out group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-white">
                                <PlayGlyph />
                            </span>
                        </button>
                    )}
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-foreground-muted">No video source</div>
            )}
        </div>
    )
}
