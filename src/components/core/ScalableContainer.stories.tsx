import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TooltipProvider } from './Tooltip'
import ScalableContainer from './ScalableContainer'

const meta: Meta<typeof ScalableContainer> = {
    title: 'Layout/ScalableContainer',
    component: ScalableContainer,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
}
export default meta
type Story = StoryObj<typeof ScalableContainer>

export const Default: Story = {
    name: 'Subtle expand — both axes',
    render: () => (
        <div className="h-[400px] w-full bg-surface-raised rounded-lg p-4">
            <ScalableContainer width="50%" height={200}>
                <div className="h-full w-full bg-surface p-4 text-sm text-foreground">
                    Click the chevron in the corner to expand to 100% × 100% of the parent.
                    Shadow lifts, content stays visible, no flash of colour.
                </div>
            </ScalableContainer>
        </div>
    ),
}

export const TogglePositions: Story = {
    name: 'Toggle button position',
    render: () => (
        <div className="grid grid-cols-2 gap-4">
            {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((pos) => (
                <div key={pos} className="h-48 bg-surface-raised rounded-lg p-3">
                    <ScalableContainer width="100%" height="100%" togglePosition={pos}>
                        <div className="h-full w-full bg-surface p-4 text-sm text-foreground flex items-center justify-center font-mono">
                            {pos}
                        </div>
                    </ScalableContainer>
                </div>
            ))}
        </div>
    ),
}

export const StackPushBehaviour: Story = {
    name: 'Stack — expand pushes siblings',
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                story:
                    'A vertical stack of panels in normal document flow. Each rests at 96px and expands to 420px. Expanding one animates its own height, which pushes every panel below it smoothly down (CSS reflows each animation frame), and the container scrolls itself into view once expanded. Open several to watch them stack and shove the rest of the page down.',
            },
        },
    },
    render: () => (
        <div className="max-w-2xl mx-auto p-6 flex flex-col gap-3">
            <p className="text-sm text-foreground-secondary">
                Click a panel's expand chevron. It grows to 420px tall and pushes the panels
                below it down; collapsing pulls them back up. Each transition is smooth and the
                expanded panel auto-scrolls into view.
            </p>
            {Array.from({ length: 6 }, (_, i) => (
                <ScalableContainer
                    key={i}
                    width="100%"
                    height={96}
                    expandedWidth="100%"
                    expandedHeight={420}
                >
                    <div className="h-full w-full bg-surface border border-border p-4 text-sm text-foreground">
                        <div className="text-xs text-foreground-muted">Panel #{i + 1}</div>
                        <div className="mt-1 font-medium">Expandable section</div>
                        <p className="mt-2 text-foreground-secondary">
                            Resting height is 96px. Expanded it becomes 420px and the panels below
                            slide down to make room. This is the behaviour to watch for jank.
                        </p>
                    </div>
                </ScalableContainer>
            ))}
            <div className="h-px bg-border my-2" />
            <p className="text-xs text-foreground-muted">End of stack — expanding panels above pushes this marker down.</p>
        </div>
    ),
}

export const FillParent: Story = {
    name: 'Expand to fill parent',
    parameters: {
        docs: {
            description: {
                story:
                    'With the default `expandedWidth`/`expandedHeight` of 100%, a container grows to fill its parent box (the OS-window behaviour). Use this when the container sits in a fixed-size region rather than document flow.',
            },
        },
    },
    render: () => (
        <div className="h-[420px] w-full bg-surface-raised rounded-lg p-4">
            <ScalableContainer width="45%" height={180}>
                <div className="h-full w-full bg-surface border border-border p-4 text-sm text-foreground">
                    Expands to 100% × 100% of the bordered parent region.
                </div>
            </ScalableContainer>
        </div>
    ),
}

export const Playground: Story = {
    args: { height: 220, togglePosition: 'top-right' },
    argTypes: {
        height: { control: { type: 'number', step: 20 } },
        togglePosition: { control: 'select', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
    },
    render: (args) => (
        <TooltipProvider>
            <ScalableContainer height={args.height} togglePosition={args.togglePosition}>
                <div className="h-full rounded-lg border border-border bg-surface p-6 text-foreground">Click the toggle to expand / collapse.</div>
            </ScalableContainer>
        </TooltipProvider>
    ),
}

// Mimics a real chart: re-measures on window resize (like ECharts / Chart.js)
// and reports its current size, so you can see content adapting — not breaking —
// as the container resizes it.
const FakeChart = ({ label }: { label: string }) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [size, setSize] = React.useState('')
    React.useEffect(() => {
        const measure = () => {
            const r = ref.current?.getBoundingClientRect()
            if (r) setSize(`${Math.round(r.width)}×${Math.round(r.height)}`)
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])
    return (
        <div ref={ref} className="relative flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-border bg-surface-raised text-foreground-secondary">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="absolute inset-x-2 bottom-1 h-1/3 text-accent opacity-60" aria-hidden="true">
                <polyline points="0,28 12,20 24,24 36,12 48,16 60,6 72,14 84,4 100,10" fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="text-sm">{label}</span>
            <span className="text-xs tabular-nums text-foreground-muted">{size}</span>
        </div>
    )
}

// A flex-wrap chart grid, sized by className (the real consumer pattern): each
// chart rests at ~half width via `w-[calc(50%-6px)]`, height set by the `height`
// prop. Expanding one grows it to targetWidth/targetHeight and the others reflow
// below at their own dimensions — pushed down, never squeezed. No `width` prop,
// so the className controls resting size (inline width is only written when
// expanded).
export const GridExpand: Story = {
    name: 'Expand in a chart grid (className-sized)',
    render: () => (
        <div className="flex w-[680px] flex-wrap gap-3">
            {['Fuel consumption', 'CII rating', 'Emissions trend', 'Speed vs power'].map((label) => (
                <ScalableContainer
                    key={label}
                    className="w-[calc(50%-6px)] bg-surface-raised"
                    height={180}
                    targetWidth="100%"
                    targetHeight={420}
                >
                    <FakeChart label={label} />
                </ScalableContainer>
            ))}
        </div>
    ),
}
