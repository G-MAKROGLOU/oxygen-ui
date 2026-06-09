import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonCard } from './Skeleton'

const meta: Meta<typeof SkeletonBox> = {
    title: 'Progress/Skeleton',
    component: SkeletonBox,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
}
export default meta

export const Playground: StoryObj<typeof SkeletonBox> = {
    args: { width: 240, height: 48 },
}

export const Box: StoryObj = {
    render: () => (
        <div className="flex flex-col gap-3 max-w-sm">
            <SkeletonBox height={180} />
            <SkeletonBox height={48} />
            <SkeletonBox width="60%" height={24} />
        </div>
    ),
}

export const Text: StoryObj = {
    render: () => (
        <div className="flex flex-col gap-6 max-w-md">
            <div>
                <p className="text-xs text-foreground-muted mb-2">3 lines (default)</p>
                <SkeletonText />
            </div>
            <div>
                <p className="text-xs text-foreground-muted mb-2">5 lines, last 40%</p>
                <SkeletonText lines={5} lastLineWidth={40} />
            </div>
            <div>
                <p className="text-xs text-foreground-muted mb-2">1 line</p>
                <SkeletonText lines={1} />
            </div>
        </div>
    ),
}

export const Circle: StoryObj = {
    render: () => (
        <div className="flex items-end gap-4">
            <SkeletonCircle size={24} />
            <SkeletonCircle size={36} />
            <SkeletonCircle size={48} />
            <SkeletonCircle size={64} />
        </div>
    ),
}

export const Card: StoryObj = {
    render: () => (
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
            <SkeletonCard />
            <SkeletonCard lines={2} />
            <SkeletonCard hasAvatar={false} lines={4} />
        </div>
    ),
}

export const ComposedProfile: StoryObj = {
    render: () => (
        <div className="flex items-start gap-4 p-4 border border-border rounded-lg max-w-sm">
            <SkeletonCircle size={48} />
            <div className="flex-1 flex flex-col gap-2.5">
                <SkeletonBox height={14} width="55%" />
                <SkeletonBox height={11} width="35%" />
                <SkeletonText lines={2} lastLineWidth={70} lineHeight={11} gap={6} />
                <div className="flex gap-2 mt-1">
                    <SkeletonBox height={26} width={60} />
                    <SkeletonBox height={26} width={44} />
                </div>
            </div>
        </div>
    ),
}

export const TableRows: StoryObj = {
    render: () => (
        <div className="max-w-2xl border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 px-4 py-3 bg-surface-raised border-b border-border">
                {[30, 20, 25, 25].map((w, i) => (
                    <SkeletonBox key={i} height={12} width={`${w}%`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                    <SkeletonBox height={11} width="30%" />
                    <SkeletonBox height={11} width="20%" />
                    <SkeletonBox height={11} width="25%" />
                    <SkeletonBox height={11} width="25%" />
                </div>
            ))}
        </div>
    ),
}
