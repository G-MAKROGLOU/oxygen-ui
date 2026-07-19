import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm, Form, useFieldArray, useFormField, patterns } from './index'
import TextInput from '../components/inputs/TextInput'
import Password from '../components/inputs/Password'
import Dropdown from '../components/inputs/Dropdown'
import RadioGroup from '../components/inputs/RadioGroup'
import Switch from '../components/inputs/Switch'
import Checkbox from '../components/inputs/Checkbox'
import Slider from '../components/inputs/Slider'
import Button from '../components/inputs/Button'

const meta: Meta = {
    title: 'Forms/Form',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Zero-dependency Form API. `useForm()` owns state + validation; spread `form.field*(name, rules)` onto any input. Validation is native (required / pattern / min / max / length / async `validate`), runs on change once touched and again on submit, and lives entirely at the form level, inputs only receive their error. `useFieldArray` powers dynamic add/remove rows.',
            },
        },
    },
}
export default meta
type Story = StoryObj

function Result({ data }: { data: unknown }) {
    if (!data) return null
    return (
        <pre className="mt-4 max-w-md overflow-auto rounded-lg border border-border bg-surface-raised p-3 text-xs text-foreground">
            {JSON.stringify(data, null, 2)}
        </pre>
    )
}

// ── 1. Login: validation on change + submit ──────────────────────────────────
export const Login: Story = {
    render: () => {
        function Demo() {
            const form = useForm({ initialValues: { email: '', password: '' } })
            const [submitted, setSubmitted] = useState<unknown>(null)
            return (
                <div className="w-80">
                    <Form form={form} onFinish={setSubmitted} className="flex flex-col gap-4">
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            helperText="We never share your email."
                            {...form.fieldNative('email', {
                                required: 'Email is required',
                                pattern: { value: patterns.email, message: 'Enter a valid email' },
                            })}
                        />
                        <Password
                            label="Password"
                            {...form.fieldNative('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'At least 8 characters' },
                            })}
                        />
                        <Button content="Sign in" buttonType="submit" variant="primary" />
                    </Form>
                    <Result data={submitted} />
                </div>
            )
        }
        return <Demo />
    },
}

// ── 2. Mixed controls: one binder per control kind ───────────────────────────
export const MixedControls: Story = {
    name: 'Mixed controls',
    render: () => {
        function Demo() {
            const form = useForm({
                initialValues: { name: '', team: '', role: '', volume: 30, notify: false, agree: false },
            })
            const [submitted, setSubmitted] = useState<unknown>(null)
            return (
                <div className="w-80">
                    <Form form={form} onFinish={setSubmitted} className="flex flex-col gap-4">
                        <TextInput label="Display name" {...form.fieldNative('name', { required: 'Required' })} />
                        <Dropdown
                            label="Team"
                            layout="vertical"
                            placeholder="Pick a team"
                            // Pickers default to a fixed trigger width; pass
                            // `style={{ width: '100%' }}` to fill the form column
                            // so every field lines up (text inputs are full-width
                            // by default).
                            style={{ width: '100%' }}
                            items={[
                                { key: 'eng', label: 'Engineering' },
                                { key: 'design', label: 'Design' },
                                { key: 'ops', label: 'Operations' },
                            ]}
                            {...form.fieldTarget('team', { required: 'Choose a team' })}
                        />
                        <RadioGroup
                            label="Role"
                            options={[
                                { value: 'admin', label: 'Admin' },
                                { value: 'member', label: 'Member' },
                                { value: 'viewer', label: 'Viewer' },
                            ]}
                            {...form.field('role', { required: 'Choose a role' })}
                        />
                        <Slider label="Volume" showValue {...form.field('volume')} />
                        <Switch label="Email notifications" {...form.fieldChecked('notify')} />
                        <Checkbox
                            label="I accept the terms"
                            {...form.fieldChecked('agree', { required: 'You must accept the terms' })}
                        />
                        <Button content="Create" buttonType="submit" variant="primary" />
                    </Form>
                    <Result data={submitted} />
                </div>
            )
        }
        return <Demo />
    },
}

// ── 3. Async validation ──────────────────────────────────────────────────────
export const AsyncValidation: Story = {
    name: 'Async validation',
    render: () => {
        function Demo() {
            const form = useForm({ initialValues: { username: '' } })
            const [submitted, setSubmitted] = useState<unknown>(null)
            const checkUnique = (v: string) =>
                new Promise<string | undefined>((resolve) =>
                    setTimeout(() => resolve(['admin', 'root', 'test'].includes(v) ? 'That username is taken' : undefined), 600),
                )
            return (
                <div className="w-80">
                    <Form form={form} onFinish={setSubmitted} className="flex flex-col gap-4">
                        <TextInput
                            label="Username"
                            helperText="Try “admin” to see the async rejection."
                            {...form.fieldNative('username', {
                                required: 'Pick a username',
                                minLength: { value: 3, message: 'Too short' },
                                validate: checkUnique,
                            })}
                        />
                        <Button content="Claim username" buttonType="submit" variant="primary" />
                    </Form>
                    <Result data={submitted} />
                </div>
            )
        }
        return <Demo />
    },
}

// ── 4. Dynamic field array ───────────────────────────────────────────────────
export const DynamicFields: Story = {
    name: 'Dynamic fields (add / remove)',
    render: () => {
        function ContactRow({ base, onRemove, canRemove }: { base: string; onRemove: () => void; canRemove: boolean }) {
            const name = useFormField(`${base}.name`, { kind: 'native', rules: { required: 'Name required' } })
            const email = useFormField(`${base}.email`, {
                kind: 'native',
                rules: { required: 'Email required', pattern: { value: patterns.email, message: 'Bad email' } },
            })
            return (
                <div className="flex items-start gap-2">
                    <div className="flex-1"><TextInput label="Name" {...name} /></div>
                    <div className="flex-1"><TextInput label="Email" {...email} /></div>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={!canRemove}
                        aria-label="Remove contact"
                        className="mt-7 flex-shrink-0 rounded-md border border-border px-2 py-1.5 text-sm text-foreground-muted hover:text-status-error hover:border-status-error disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )
        }
        function Contacts() {
            const { fields, append, remove } = useFieldArray('contacts')
            return (
                <div className="flex flex-col gap-3">
                    {fields.map((f, i) => (
                        <ContactRow key={f.key} base={f.name} onRemove={() => remove(i)} canRemove={fields.length > 1} />
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ name: '', email: '' })}
                        className="self-start rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-accent hover:bg-surface-raised transition-colors"
                    >
                        + Add contact
                    </button>
                </div>
            )
        }
        function Demo() {
            const form = useForm({ initialValues: { contacts: [{ name: '', email: '' }] } })
            const [submitted, setSubmitted] = useState<unknown>(null)
            return (
                <div className="w-[34rem]">
                    <Form form={form} onFinish={setSubmitted} className="flex flex-col gap-4">
                        <Contacts />
                        <Button content="Save contacts" buttonType="submit" variant="primary" />
                    </Form>
                    <Result data={submitted} />
                </div>
            )
        }
        return <Demo />
    },
}

// ── Playground (controls drive field config + validation) ─────────────────────
export const Playground: Story = {
    args: { label: 'Email', placeholder: 'you@example.com', required: true, validateEmail: true },
    argTypes: {
        label: { control: 'text' },
        placeholder: { control: 'text' },
        required: { control: 'boolean' },
        validateEmail: { control: 'boolean' },
    },
    render: (args: { label: string; placeholder: string; required: boolean; validateEmail: boolean }) => {
        function Demo() {
            const form = useForm({ initialValues: { value: '' } })
            const [submitted, setSubmitted] = useState<unknown>(null)
            return (
                <div className="w-80">
                    <Form form={form} onFinish={setSubmitted} className="flex flex-col gap-4">
                        <TextInput
                            label={args.label}
                            placeholder={args.placeholder}
                            {...form.fieldNative('value', {
                                required: args.required ? `${args.label} is required` : undefined,
                                pattern: args.validateEmail ? { value: patterns.email, message: 'Enter a valid email' } : undefined,
                            })}
                        />
                        <Button content="Submit" buttonType="submit" variant="primary" />
                    </Form>
                    <Result data={submitted} />
                </div>
            )
        }
        return <Demo />
    },
}

// Demonstrates that form.isSubmitting drives a Button loading state for the
// FULL submit cycle (validation → onFinish). The onFinish here waits ~1.2s.
export const SubmittingState: Story = {
    name: 'isSubmitting → Button loading',
    render: () => {
        function Demo() {
            const form = useForm({ initialValues: { email: '' } })
            const [done, setDone] = useState(0)
            return (
                <div className="flex w-80 flex-col gap-3">
                    <Form
                        form={form}
                        onFinish={async () => {
                            await new Promise((r) => setTimeout(r, 1200))
                            setDone((n) => n + 1)
                        }}
                        className="flex flex-col gap-3"
                    >
                        <TextInput label="Email" {...form.fieldNative('email', { required: 'Required', pattern: { value: patterns.email, message: 'Invalid email' } })} />
                        <Button content={form.isSubmitting ? 'Saving…' : 'Save'} buttonType="submit" loading={form.isSubmitting} />
                    </Form>
                    <p className="text-xs text-foreground-muted" data-testid="done">Completed submits: {done}</p>
                </div>
            )
        }
        return <Demo />
    },
}
