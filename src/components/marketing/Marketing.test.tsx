import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Jumbotron from './Jumbotron'
import FeatureGrid from './FeatureGrid'
import PricingPlans from './PricingPlans'
import Testimonials from './Testimonials'
import SlideShow from './SlideShow'
import Video from './Video'
import Blog from './Blog'
import Socials from './Socials'
import CookieConsent from './CookieConsent'
import LeadCapture from './LeadCapture'

describe('Jumbotron', () => {
    it('renders title, description and actions', () => {
        render(<Jumbotron title="Hello world" description="A subtitle" actions={<button>CTA</button>} />)
        expect(screen.getByRole('heading', { name: 'Hello world' })).toBeInTheDocument()
        expect(screen.getByText('A subtitle')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument()
    })
    it('renders media in split layout', () => {
        render(<Jumbotron title="T" layout="split" media={<img alt="hero" src="x" />} />)
        expect(screen.getByAltText('hero')).toBeInTheDocument()
    })
})

describe('FeatureGrid', () => {
    it('renders every feature and the header', () => {
        render(<FeatureGrid title="Features" features={[{ title: 'A', description: 'a' }, { title: 'B', description: 'b' }]} />)
        expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument()
        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
    })
})

describe('PricingPlans', () => {
    it('renders plans, badge, and fires the CTA', () => {
        const onClick = vi.fn()
        render(<PricingPlans plans={[
            { name: 'Starter', price: '$0', features: ['x'], cta: { label: 'Start' } },
            { name: 'Pro', price: '$49', highlighted: true, badge: 'Popular', features: ['y'], cta: { label: 'Go Pro', onClick } },
        ]} />)
        expect(screen.getByText('Popular')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Go Pro' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

describe('Testimonials', () => {
    it('renders quotes and authors', () => {
        render(<Testimonials testimonials={[{ quote: 'Great product', author: 'Jane Doe', role: 'CTO', rating: 5 }]} />)
        expect(screen.getByText(/Great product/)).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('CTO')).toBeInTheDocument()
        expect(screen.getByLabelText('5 out of 5')).toBeInTheDocument()
    })
})

describe('SlideShow', () => {
    const slides = [
        { title: 'First slide', description: 'one' },
        { title: 'Second slide', description: 'two' },
    ]
    it('renders the first slide and a dot per slide', () => {
        render(<SlideShow slides={slides} autoPlay={false} />)
        expect(screen.getByRole('heading', { name: 'First slide' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument()
    })
    it('advances to the next slide on the arrow', () => {
        render(<SlideShow slides={slides} autoPlay={false} />)
        fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
        expect(screen.getByRole('heading', { name: 'Second slide' })).toBeInTheDocument()
    })
    it('renders nothing with no slides', () => {
        const { container } = render(<SlideShow slides={[]} />)
        expect(container).toBeEmptyDOMElement()
    })
})

describe('Video', () => {
    it('shows a play overlay for native src and reveals controls on click', () => {
        const { container } = render(<Video src="/clip.mp4" poster="/p.jpg" title="Tour" />)
        const play = screen.getByRole('button', { name: 'Play Tour' })
        expect(play).toBeInTheDocument()
        fireEvent.click(play)
        expect(container.querySelector('video')).toHaveAttribute('controls')
    })
    it('renders an iframe for an embed URL', () => {
        const { container } = render(<Video embedUrl="https://youtube.com/embed/x" title="Webinar" />)
        const iframe = container.querySelector('iframe')
        expect(iframe).toHaveAttribute('src', 'https://youtube.com/embed/x')
    })
})

describe('Blog', () => {
    it('renders posts as links when href is set', () => {
        render(<Blog title="Blog" posts={[{ title: 'Post one', excerpt: 'x', tag: 'News', href: '/p/1' }]} />)
        const link = screen.getByRole('link', { name: /Post one/ })
        expect(link).toHaveAttribute('href', '/p/1')
        expect(screen.getByText('News')).toBeInTheDocument()
    })
    it('fires onClick when there is no href', () => {
        const onClick = vi.fn()
        render(<Blog posts={[{ title: 'Clickable', onClick }]} />)
        fireEvent.click(screen.getByRole('button', { name: /Clickable/ }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

describe('Socials', () => {
    it('renders labelled links with the right targets', () => {
        render(<Socials links={[
            { platform: 'github', href: 'https://github.com/x' },
            { platform: 'email', href: 'mailto:a@b.com' },
        ]} />)
        expect(screen.getByRole('link', { name: 'Github' })).toHaveAttribute('href', 'https://github.com/x')
        const email = screen.getByRole('link', { name: 'Email' })
        expect(email).toHaveAttribute('href', 'mailto:a@b.com')
        expect(email).not.toHaveAttribute('target') // mailto never opens a new tab
    })
})

describe('CookieConsent', () => {
    it('fires onAccept and hides after a choice (controlled)', () => {
        const onAccept = vi.fn()
        const { rerender } = render(<CookieConsent open storageKey={null} onAccept={onAccept} />)
        fireEvent.click(screen.getByRole('button', { name: 'Accept all' }))
        expect(onAccept).toHaveBeenCalledTimes(1)
        rerender(<CookieConsent open={false} storageKey={null} onAccept={onAccept} />)
        expect(screen.queryByRole('dialog', { name: 'Cookie consent' })).toBeNull()
    })
    it('persists the choice and stays dismissed (self-managing)', () => {
        const key = 'oxygen-cc-test'
        window.localStorage.removeItem(key)
        const { unmount } = render(<CookieConsent storageKey={key} declineLabel="Reject" />)
        fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
        expect(window.localStorage.getItem(key)).toContain('declined')
        unmount()
        render(<CookieConsent storageKey={key} />)
        expect(screen.queryByRole('dialog', { name: 'Cookie consent' })).toBeNull()
        window.localStorage.removeItem(key)
    })
})

describe('LeadCapture', () => {
    it('submits the email and shows the success message', () => {
        const onSubmit = vi.fn()
        render(<LeadCapture title="Subscribe" buttonLabel="Join" successMessage="All set!" onSubmit={onSubmit} />)
        const input = screen.getByLabelText('Email address')
        fireEvent.change(input, { target: { value: 'a@b.com' } })
        fireEvent.submit(input.closest('form')!)
        expect(onSubmit).toHaveBeenCalledWith('a@b.com')
        expect(screen.getByText('All set!')).toBeInTheDocument()
    })
})
