import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Video from './Video'

const meta: Meta<typeof Video> = {
    title: 'Marketing/Video',
    component: Video,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        aspect: { control: 'inline-radio', options: ['16/9', '4/3', '1/1', '21/9'] },
        controls: { control: 'boolean' },
        framed: { control: 'boolean' },
    },
    decorators: [(Story) => <div className="mx-auto max-w-3xl p-6"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Video>

const SAMPLE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const NativeWithPoster: Story = {
    name: 'Native file + poster',
    args: {
        src: SAMPLE,
        poster: 'https://picsum.photos/seed/vid1/1280/720',
        title: 'Product tour',
        aspect: '16/9',
    },
}

export const Embed: Story = {
    name: 'YouTube embed',
    args: {
        embedUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
        title: 'Webinar replay',
        aspect: '16/9',
    },
}

export const Square: Story = {
    args: {
        src: SAMPLE,
        poster: 'https://picsum.photos/seed/vid2/800/800',
        title: 'Social clip',
        aspect: '1/1',
    },
    decorators: [(Story) => <div className="mx-auto max-w-sm p-6"><Story /></div>],
}

export const Unframed: Story = {
    args: {
        src: SAMPLE,
        poster: 'https://picsum.photos/seed/vid3/1280/720',
        title: 'Background clip',
        framed: false,
    },
}
