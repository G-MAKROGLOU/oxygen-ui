import React from 'react'
import { useFormField, type UseFormFieldOptions } from './useFormField'
import type { FieldBindings } from './bindings'

export interface FormFieldProps extends UseFormFieldOptions {
    name: string
    /** Render-prop receiving the bindings to spread onto a control. */
    children: (field: FieldBindings) => React.ReactNode
}

/**
 * Render-prop wrapper around {@link useFormField}. Isolates a field's
 * re-renders from the rest of the form.
 *
 * @example
 * <FormField name="role" rules={{ required: 'Pick a role' }}>
 *   {(field) => <RadioGroup label="Role" options={ROLES} {...field} />}
 * </FormField>
 */
export function FormField({ name, kind, rules, children }: FormFieldProps) {
    const field = useFormField(name, { kind, rules })
    return <>{children(field)}</>
}
