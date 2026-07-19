import React, { useRef } from 'react'
import { FormContext } from './context'
import type { UseFormReturn } from './useForm'
import type { ErrorMap } from './store'
import type { FormValues } from './validate'

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'action'> {
    /** The instance from `useForm()`. */
    form: UseFormReturn
    /**
     * SPA submit handler, called with the validated values once all rules
     * pass. Receiving this puts the form in client mode (`preventDefault`).
     */
    onFinish?: (values: FormValues) => void | Promise<void>
    /** Called when a submit attempt fails validation. */
    onFinishFailed?: (errors: ErrorMap, values: FormValues) => void
    /**
     * SSR / progressive-enhancement submit. A function receives the native
     * `FormData` (React 19 server action style); a string is used as the
     * native `<form action>` URL. Either way the form validates first and only
     * proceeds when valid. Async rules are awaited before a native submit.
     */
    action?: string | ((data: FormData) => void | Promise<void>)
    children: React.ReactNode
}

/**
 * Form wrapper. Owns submission: on submit it marks the form submitted, runs
 * every field's rules, and only then dispatches, to `onFinish(values)` in SPA
 * mode or to `action` (function or native URL) for SSR. Renders a real
 * `<form noValidate>` so our inputs' `name`s serialise into `FormData` while we
 * still show our own validation messages.
 *
 * @example SPA
 * <Form form={form} onFinish={(v) => api.save(v)}>…</Form>
 * @example Server action (SSR)
 * <Form form={form} action={saveAction}>…</Form>
 */
export function Form({
    form,
    onFinish,
    onFinishFailed,
    action,
    children,
    ...rest
}: FormProps) {
    const ref = useRef<HTMLFormElement>(null)
    // Lets the async path re-submit natively without re-running validation.
    const bypass = useRef(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (bypass.current) { bypass.current = false; return } // native submit passes through
        e.preventDefault()

        const store = form.store
        store.setSubmitted(true)
        const errors = await store.validateAll()
        const hasError = Object.values(errors).some(Boolean)

        if (hasError) {
            onFinishFailed?.(errors, store.getValues())
            focusFirstError(ref.current, errors)
            return
        }

        if (onFinish) {
            // Mark submitting for the full handler lifecycle so consumers' loading
            // states (e.g. <Button loading={form.isSubmitting} />) stay on while
            // onFinish runs, not just during validation.
            store.setSubmitting(true)
            try {
                await onFinish(store.getValues())
            } finally {
                store.setSubmitting(false)
            }
            return
        }

        if (typeof action === 'function') {
            action(new FormData(ref.current!))
            return
        }
        if (typeof action === 'string') {
            // Valid → let the browser POST/GET natively to the action URL.
            bypass.current = true
            ref.current!.requestSubmit()
        }
    }

    return (
        <FormContext.Provider value={form.store}>
            <form
                ref={ref}
                noValidate
                action={typeof action === 'string' ? action : undefined}
                onSubmit={handleSubmit}
                {...rest}
            >
                {children}
            </form>
        </FormContext.Provider>
    )
}

/** Move focus to the first control with an error, for keyboard + AT users. */
function focusFirstError(formEl: HTMLFormElement | null, errors: ErrorMap) {
    if (!formEl) return
    const firstName = Object.keys(errors).find((k) => errors[k])
    if (!firstName) return
    const el = formEl.querySelector<HTMLElement>(`[name="${CSS.escape(firstName)}"], #${CSS.escape(firstName)}`)
    el?.focus()
}
