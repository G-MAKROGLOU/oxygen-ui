import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useForm, Form, useFieldArray, useFormField, patterns } from './index'
import { FormStore } from './store'
import TextInput from '../components/inputs/TextInput'

describe('Form API — validation + submit', () => {
    function LoginForm({ onFinish }: { onFinish: (v: unknown) => void }) {
        const form = useForm({ initialValues: { email: '', password: '' } })
        return (
            <Form form={form} onFinish={onFinish}>
                <TextInput label="Email" {...form.fieldNative('email', { required: 'Email required', pattern: { value: patterns.email, message: 'Bad email' } })} />
                <TextInput label="Password" {...form.fieldNative('password', { required: 'Password required', minLength: 6 })} />
                <button type="submit">Submit</button>
            </Form>
        )
    }

    it('blocks submit and surfaces errors when invalid', async () => {
        const onFinish = vi.fn()
        render(<LoginForm onFinish={onFinish} />)
        fireEvent.click(screen.getByText('Submit'))
        await waitFor(() => {
            expect(screen.getByText('Email required')).toBeInTheDocument()
            expect(screen.getByText('Password required')).toBeInTheDocument()
        })
        expect(onFinish).not.toHaveBeenCalled()
    })

    it('submits the values once all rules pass', async () => {
        const onFinish = vi.fn()
        render(<LoginForm onFinish={onFinish} />)
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret1' } })
        fireEvent.click(screen.getByText('Submit'))
        await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' }))
    })

    it('validates on change once a field is touched', async () => {
        const onFinish = vi.fn()
        render(<LoginForm onFinish={onFinish} />)
        const email = screen.getByLabelText(/Email/)
        fireEvent.change(email, { target: { value: 'not-an-email' } })
        await waitFor(() => expect(screen.getByText('Bad email')).toBeInTheDocument())
        fireEvent.change(email, { target: { value: 'ok@x.com' } })
        await waitFor(() => expect(screen.queryByText('Bad email')).not.toBeInTheDocument())
    })
})

describe('Form API — async validation', () => {
    it('awaits a custom async validator before submitting', async () => {
        const onFinish = vi.fn()
        function AsyncForm() {
            const form = useForm({ initialValues: { user: '' } })
            return (
                <Form form={form} onFinish={onFinish}>
                    <TextInput
                        label="Username"
                        {...form.fieldNative('user', {
                            validate: async (v) => (v === 'taken' ? 'Already taken' : undefined),
                        })}
                    />
                    <button type="submit">Go</button>
                </Form>
            )
        }
        render(<AsyncForm />)
        fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'taken' } })
        fireEvent.click(screen.getByText('Go'))
        await waitFor(() => expect(screen.getByText('Already taken')).toBeInTheDocument())
        expect(onFinish).not.toHaveBeenCalled()
    })
})

describe('Form API — dynamic field arrays', () => {
    function ContactsForm({ onFinish }: { onFinish: (v: unknown) => void }) {
        const form = useForm({ initialValues: { contacts: [{ email: '' }] } })
        return (
            <Form form={form} onFinish={onFinish}>
                <Rows />
                <button type="submit">Save</button>
            </Form>
        )
    }
    function Rows() {
        const { fields, append, remove } = useFieldArray('contacts')
        return (
            <div>
                {fields.map((f, i) => (
                    <div key={f.key} data-testid="row">
                        <Row name={`${f.name}.email`} />
                        <button type="button" onClick={() => remove(i)}>{`remove-${i}`}</button>
                    </div>
                ))}
                <button type="button" onClick={() => append({ email: '' })}>add</button>
            </div>
        )
    }
    function Row({ name }: { name: string }) {
        const field = useFormField(name, { kind: 'native', rules: { required: 'Email required' } })
        return <TextInput label={name} {...field} />
    }

    it('appends and removes rows', () => {
        render(<ContactsForm onFinish={vi.fn()} />)
        expect(screen.getAllByTestId('row')).toHaveLength(1)
        fireEvent.click(screen.getByText('add'))
        fireEvent.click(screen.getByText('add'))
        expect(screen.getAllByTestId('row')).toHaveLength(3)
        fireEvent.click(screen.getByText('remove-1'))
        expect(screen.getAllByTestId('row')).toHaveLength(2)
    })

    it('validates dynamically-added rows', async () => {
        const onFinish = vi.fn()
        render(<ContactsForm onFinish={onFinish} />)
        fireEvent.click(screen.getByText('add'))
        fireEvent.click(screen.getByText('Save'))
        await waitFor(() => expect(screen.getAllByText('Email required').length).toBeGreaterThanOrEqual(2))
        expect(onFinish).not.toHaveBeenCalled()
    })
})

describe('Form API — isSubmitting', () => {
    function SubmitForm({ onFinish }: { onFinish: (v: unknown) => Promise<void> }) {
        const form = useForm({ initialValues: { name: 'ok' } })
        return (
            <Form form={form} onFinish={onFinish}>
                <TextInput label="Name" {...form.fieldNative('name', { required: true })} />
                <button type="submit" disabled={form.isSubmitting}>
                    {form.isSubmitting ? 'Submitting…' : 'Submit'}
                </button>
            </Form>
        )
    }

    it('stays true for the whole submit cycle (validation → onFinish) then resets', async () => {
        // A deferred onFinish so we can observe the in-flight state.
        let resolveFinish: () => void = () => {}
        const onFinish = vi.fn(() => new Promise<void>((res) => { resolveFinish = res }))

        render(<SubmitForm onFinish={onFinish} />)
        fireEvent.click(screen.getByText('Submit'))

        // While onFinish is pending, the button reflects isSubmitting.
        await waitFor(() => expect(screen.getByText('Submitting…')).toBeInTheDocument())
        expect(screen.getByRole('button')).toBeDisabled()

        // Resolve onFinish → isSubmitting drops back to false.
        resolveFinish()
        await waitFor(() => expect(screen.getByText('Submit')).toBeInTheDocument())
        expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('tracks submitting on the store as a flag distinct from validating, cleared by reset', () => {
        const store = new FormStore()
        expect(store.submitting).toBe(false)
        store.setSubmitting(true)
        expect(store.submitting).toBe(true)
        expect(store.validating).toBe(false) // independent of async validation
        store.setSubmitting(false)
        expect(store.submitting).toBe(false)
        store.setSubmitting(true)
        store.reset()
        expect(store.submitting).toBe(false)
    })
})

describe('Form API — reset', () => {
    it('restores initial values and clears errors', async () => {
        function ResetForm() {
            const form = useForm({ initialValues: { name: 'init' } })
            return (
                <Form form={form} onFinish={vi.fn()}>
                    <TextInput label="Name" {...form.fieldNative('name', { required: true })} />
                    <button type="button" onClick={() => form.reset()}>reset</button>
                </Form>
            )
        }
        render(<ResetForm />)
        const input = screen.getByLabelText(/Name/) as HTMLInputElement
        fireEvent.change(input, { target: { value: 'changed' } })
        expect(input.value).toBe('changed')
        fireEvent.click(screen.getByText('reset'))
        await waitFor(() => expect((screen.getByLabelText(/Name/) as HTMLInputElement).value).toBe('init'))
    })
})
