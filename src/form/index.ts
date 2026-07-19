/**
 * oxygen-ui Form API, a zero-dependency, native form layer.
 *
 * - `useForm()` creates a store; `<Form form={...}>` owns submission.
 * - Bind any input by spreading `form.field(name)` (or the kind-specific
 *   variants), the input only receives its value + error, never validates
 *   itself.
 * - Validation is native (required / pattern / min / max / length + custom
 *   sync/async `validate`), runs onChange + onSubmit, and lives at form level.
 * - `<Form action>` supports SSR / server actions; `onFinish` covers SPA.
 * - `useFieldArray()` powers dynamic add/remove repeating fields.
 */
export { useForm } from './useForm'
export type { UseFormReturn } from './useForm'
export { Form } from './Form'
export type { FormProps } from './Form'
export { FormField } from './FormField'
export type { FormFieldProps } from './FormField'
export { useFormField } from './useFormField'
export type { UseFormFieldOptions } from './useFormField'
export { useFieldArray } from './useFieldArray'
export type { FieldArrayItem, UseFieldArrayReturn } from './useFieldArray'
export { useFormStore, FormContext } from './context'
export { FormStore } from './store'
export type { FormStoreOptions, ValidateTrigger, ErrorMap, FieldSnapshot } from './store'
export type { FieldBindings, FieldKind } from './bindings'
export { runFieldRules, isRequired, patterns } from './validate'
export type { FieldRule, FieldRules, RulesMap, FormValues } from './validate'
