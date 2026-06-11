import React from 'react'
import * as Accordion from '@radix-ui/react-accordion'

export interface TreeNode {
    key: string
    label: string
    nodeData?: any
    parentLabel?: string
    children?: TreeNode[]
}

export interface TreeItemClickPayload {
    isParent: boolean
    key: string
    label: string
    data?: any
    parentLabel?: string
}

export interface TreeProps {
    nodes: TreeNode[]
    onNodeClick: (payload: TreeItemClickPayload) => void
    defaultExpandAll?: boolean
    defaultExpandedKeys?: string[]
    /** Extra classes merged onto the tree root. */
    className?: string
    /** Inline style on the tree root. */
    style?: React.CSSProperties
}

/** ─────────────────── helpers ─────────────────── */
const isParent = (item: TreeNode) =>
    Boolean(item.children && item.children.length > 0)

/** ─────────────────── single node ─────────────────── */
interface NodeProps {
    item: TreeNode
    onNodeClick: TreeProps['onNodeClick']
    defaultExpandAll: boolean
    defaultExpandedKeys: string[]
}

function TreeNodeItem({
    item,
    onNodeClick,
    defaultExpandAll,
    defaultExpandedKeys,
}: NodeProps) {
    if (!isParent(item)) {
        return (
            <button
                type="button"
                className="flex w-full items-center gap-2.5 cursor-pointer select-none group text-left rounded-md px-2 py-1.5 hover:bg-surface-raised transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() =>
                    onNodeClick({
                        isParent: false,
                        key: item.key,
                        label: item.label,
                        data: item.nodeData,
                        parentLabel: item.parentLabel,
                    })
                }
            >
                {/* Leaf dot */}
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-foreground-muted group-hover:bg-accent transition-colors duration-150" />
                <span className="text-sm text-foreground-secondary group-hover:text-foreground transition-colors duration-150">
                    {item.label}
                </span>
            </button>
        )
    }

    const initialOpen =
        defaultExpandAll || defaultExpandedKeys.includes(item.key)
            ? [item.key]
            : []

    return (
        <Accordion.Root type="multiple" defaultValue={initialOpen}>
            <Accordion.Item value={item.key} className="border-none">
                {/* The Trigger handles BOTH expand/collapse (via Radix) and
                    onNodeClick — clicking anywhere on the parent row fires
                    both, consistently. Previously only the label fired
                    onNodeClick while the chevron only toggled — asymmetric
                    behaviour that confused consumers. */}
                <Accordion.Trigger
                    onClick={() =>
                        onNodeClick({
                            isParent: true,
                            key: item.key,
                            label: item.label,
                            data: item.nodeData,
                            parentLabel: item.parentLabel,
                        })
                    }
                    className="flex items-center gap-2 cursor-pointer py-1.5 px-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full text-left rounded-md hover:bg-surface-raised transition-colors duration-150"
                >
                    {/* Chevron — rotates on open/close */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="h-3.5 w-3.5 flex-shrink-0 text-foreground-muted transition-transform duration-200 group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                    <span className="text-sm font-semibold text-foreground select-none">
                        {item.label}
                    </span>
                </Accordion.Trigger>

                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="ml-3.5 border-l border-border py-0.5">
                        {item.children!.map((child) => (
                            <TreeNodeItem
                                key={child.key}
                                item={child}
                                onNodeClick={onNodeClick}
                                defaultExpandAll={defaultExpandAll}
                                defaultExpandedKeys={defaultExpandedKeys}
                            />
                        ))}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    )
}

/** ─────────────────── public component ─────────────────── */

/**
 * Hierarchical tree view powered by Radix Accordion.
 *
 * Each parent node is an independent Accordion.Root with type="multiple" so
 * sibling branches expand independently. Leaf nodes are plain buttons.
 * Expand/collapse is animated via CSS keyframes.
 *
 * @example
 * <Tree
 *   nodes={fleetTree}
 *   onNodeClick={({ key, isParent }) => selectNode(key)}
 *   defaultExpandAll
 * />
 */
export default function Tree({
    nodes,
    onNodeClick,
    defaultExpandAll = false,
    defaultExpandedKeys = [],
    className = '',
    style,
}: TreeProps) {
    return (
        <div className={`p-1 w-full ${className}`.trim()} style={style}>
            {nodes.map((item) => (
                <TreeNodeItem
                    key={item.key}
                    item={item}
                    onNodeClick={onNodeClick}
                    defaultExpandAll={defaultExpandAll}
                    defaultExpandedKeys={defaultExpandedKeys}
                />
            ))}
        </div>
    )
}
