import { createContext, useContext } from 'react'
import type { FormStore } from './store'

/** The store provided by `<Form>` to descendant fields / field-arrays. */
export const FormContext = createContext<FormStore | null>(null)

/** Read the enclosing `<Form>`'s store. Throws if used outside a `<Form>`. */
export function useFormStore(): FormStore {
    const store = useContext(FormContext)
    if (!store) {
        throw new Error('useFormStore must be used within a <Form>. Did you forget to wrap your fields?')
    }
    return store
}
