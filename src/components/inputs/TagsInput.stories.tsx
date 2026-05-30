import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TagsInput from './TagsInput'

const meta: Meta<typeof TagsInput> = {
    title: 'Inputs/TagsInput',
    component: TagsInput,
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        label: { control: 'text' },
        placeholder: { control: 'text' },
        helperText: { control: 'text' },
        errorMessage: { control: 'text' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
    },
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Free-text entry that produces removable tag chips. Type and press Enter or comma to add; Backspace on an empty field removes the last tag; pasting a delimited string splits into multiple tags. Distinct from Dropdown, which picks from a fixed list.',
            },
        },
    },
    decorators: [(S) => <div className="w-96"><S /></div>],
}
export default meta
type Story = StoryObj<typeof TagsInput>

function Controlled(args: React.ComponentProps<typeof TagsInput>) {
    const [tags, setTags] = useState<string[]>(args.defaultValue ?? [])
    return <TagsInput {...args} value={tags} onChange={setTags} />
}

export const Default: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Keywords', defaultValue: ['shipping', 'logistics'] },
}

export const EmailValidation: Story = {
    name: 'With validation',
    render: (a) => <Controlled {...a} />,
    args: {
        label: 'Recipients',
        placeholder: 'Add an email…',
        validate: (t) => /.+@.+\..+/.test(t) || 'Enter a valid email address',
    },
    parameters: {
        docs: {
            description: {
                story: 'Pass `validate` to reject candidates. Return `true` to accept, `false`, or a string error to surface under the field.',
            },
        },
    },
}

export const MaxTags: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Up to 3 tags', maxTags: 3, defaultValue: ['one'] },
}

export const WithError: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Tags', errorMessage: 'At least one tag is required', required: true },
}
