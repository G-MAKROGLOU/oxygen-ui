import React from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import COLORS from '../../utils/colors'

export interface TreeNode {
    key: string
    value: string
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
    structure: TreeNode[]
    onItemClick: (payload: TreeItemClickPayload) => void
    defaultExpandAll?: boolean
    defaultExpandedKeys?: string[]
}

/** ─────────────────── helpers ─────────────────── */
const isParent = (item: TreeNode) => Boolean(item.children && item.children.length > 0)

const _collectParentKeys = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((n) =>
        isParent(n) ? [n.key, ..._collectParentKeys(n.children!)] : []
    )

/** ─────────────────── single node ─────────────────── */
interface NodeProps {
    item: TreeNode
    onItemClick: TreeProps['onItemClick']
    defaultExpandAll: boolean
    defaultExpandedKeys: string[]
    depth?: number
}

function TreeNodeItem({
    item,
    onItemClick,
    defaultExpandAll,
    defaultExpandedKeys,
    depth = 0,
}: NodeProps) {
    if (!isParent(item)) {
        return (
            <div
                style={{ marginLeft: depth * 10 + 16 }}
                className="flex items-center gap-2 cursor-pointer py-0.5"
                onClick={() =>
                    onItemClick({
                        isParent: false,
                        key: item.key,
                        label: item.value,
                        data: item.nodeData,
                        parentLabel: item.parentLabel,
                    })
                }
            >
                {/* Minus icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth={2} className="h-4 w-4 flex-shrink-0 dark:stroke-white">
                    <path strokeLinecap="round" d="M5 12h14" />
                </svg>
                <span className="text-xs text-prussian-blue dark:text-white select-none transition-all duration-300 hover:bg-ice-dark dark:hover:bg-independence rounded-lg p-1">
                    {item.value}
                </span>
            </div>
        )
    }

    /* Build default open state for THIS node's accordion */
    const initialOpen =
        defaultExpandAll || defaultExpandedKeys.includes(item.key) ? [item.key] : []

    return (
        <Accordion.Root
            type="multiple"
            defaultValue={initialOpen}
            style={{ marginLeft: depth * 10 }}
        >
            <Accordion.Item value={item.key} className="border-none">
                <Accordion.Trigger
                    className="flex items-center gap-2 cursor-pointer py-0.5 group focus:outline-none w-full text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ChevronDown – rotates via group-data-[state] */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={COLORS.PALETTE['prussian-blue']}
                        strokeWidth={2}
                        className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-data-[state=closed]:-rotate-90 dark:stroke-white"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span
                        className="text-sm font-bold text-prussian-blue dark:text-white select-none transition-all duration-300 hover:bg-ice-dark dark:hover:bg-independence rounded-lg p-1"
                        onClick={() =>
                            onItemClick({
                                isParent: true,
                                key: item.key,
                                label: item.value,
                                data: item.nodeData,
                                parentLabel: item.parentLabel,
                            })
                        }
                    >
                        {item.value}
                    </span>
                </Accordion.Trigger>

                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="ml-[7px] border-l border-prussian-blue dark:border-ice-dark">
                        {item.children!.map((child) => (
                            <TreeNodeItem
                                key={child.key}
                                item={child}
                                onItemClick={onItemClick}
                                defaultExpandAll={defaultExpandAll}
                                defaultExpandedKeys={defaultExpandedKeys}
                                depth={depth + 1}
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
 * Hierarchical tree view powered by Radix Accordion (nested).
 *
 * Each parent node is an independent Accordion.Root with `type="multiple"` so
 * sibling branches are independent. Leaf nodes are plain clickable rows.
 *
 * @example
 * <Tree
 *   structure={fleetTree}
 *   onItemClick={({ key, isParent }) => selectNode(key)}
 *   defaultExpandAll
 * />
 */
export default function Tree({
    structure,
    onItemClick,
    defaultExpandAll = false,
    defaultExpandedKeys = [],
}: TreeProps) {
    return (
        <div className="p-2">
            {structure.map((item) => (
                <TreeNodeItem
                    key={item.key}
                    item={item}
                    onItemClick={onItemClick}
                    defaultExpandAll={defaultExpandAll}
                    defaultExpandedKeys={defaultExpandedKeys}
                />
            ))}
        </div>
    )
}
