import React from 'react'
import { renderToString } from 'react-dom/server'
import { render } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useForm } from './useForm'
import { Form } from './Form'
import { FormField } from './FormField'

function SsrForm() {
    const form = useForm({ initialValues: { email: 'pre@filled.io' } })
    return (
        <Form form={form} action="/subscribe">
            <FormField name="email" kind="native" rules={{ required: true }}>
                {(field) => (
                    <input
                        aria-label="Email"
                        name={field.name}
                        value={field.value as string}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            </FormField>
        </Form>
    )
}

afterEach(() => vi.restoreAllMocks())

describe('form server rendering', () => {
    it('renders a form field with renderToString without throwing', () => {
        const html = renderToString(<SsrForm />)
        expect(html).toContain('pre@filled.io')
        expect(html).toContain('<form')
    })

    it('hydrates the server markup without hydration errors', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const container = document.createElement('div')
        document.body.appendChild(container)
        container.innerHTML = renderToString(<SsrForm />)
        render(<SsrForm />, { container, hydrate: true })
        expect(errorSpy).not.toHaveBeenCalled()
        container.remove()
    })
})
