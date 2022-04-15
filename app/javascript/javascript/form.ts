import {useEffect, useState} from 'react'
import {MonthAndYear} from './time'
import {isNotNullOrUndefined} from './utils'

type ValidationProps<Form> = {
  form: Form
  field: keyof Form
}

type Validation<Form> = ({form}: ValidationProps<Form>) => string | null

type FormSpec<F> = {
  [K in keyof F]: {
    value: F[K]
    validations: Validation<F>[]
    validateUnless?: boolean
  }
}

type FormErrors<F> = {[K in keyof F]: string[]}

export type Form<T> = {
  values: T
  errors: FormErrors<T>
  validate: (fieldsToValidate?: (keyof T)[]) => boolean
  update: ({field, value}: {field: keyof T; value: any}) => void
}

const URL_REGEX =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

export function useForm<FormValues>(spec: FormSpec<FormValues>): Form<FormValues> {
  const initialValues: FormValues = (Object.keys(spec) as (keyof FormValues)[]).reduce(
    (result, field: keyof FormValues) => {
      return {...result, [field]: spec[field].value}
    },
    {} as FormValues
  )

  const initialErrors: FormErrors<FormValues> = (Object.keys(spec) as (keyof FormValues)[]).reduce(
    (result, field: keyof FormValues) => {
      return {...result, [field]: []}
    },
    {} as FormErrors<FormValues>
  )

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState(initialErrors)
  const [changedFields, setChangedFields] = useState<(keyof FormValues)[]>([])

  useEffect(() => {
    if (changedFields.length > 0) validate(changedFields)
  }, [changedFields])

  function errorsFor(field: keyof FormValues) {
    if (spec[field].validateUnless) return []

    return spec[field].validations.map(validation => validation({form: values, field})).filter(isNotNullOrUndefined)
  }

  function update<Field extends keyof FormValues>({field, value}: {field: Field; value: FormValues[Field]}) {
    if (values[field] === value) return

    setValues(current => ({...current, [field]: value}))
    setChangedFields(current => [...current, field])
  }

  function validate(fieldsToValidate?: (keyof FormValues)[]) {
    const newErrors = (Object.keys(spec) as (keyof FormValues)[]).reduce((result, field: keyof FormValues) => {
      return {
        ...result,
        [field]: fieldsToValidate?.indexOf(field) !== -1 ? errorsFor(field) : errors[field]
      }
    }, {} as FormErrors<FormValues>)

    setChangedFields([])
    setErrors(newErrors)

    return isValid(newErrors)
  }

  return {values, errors, validate, update}
}

function isValid<T>(errors: FormErrors<T>) {
  let result: boolean = true

  ;(Object.values(errors) as string[][]).forEach(errors => {
    if (errors.length > 0) result = false
  })

  return result
}

export function validatePresence<Form>({form, field}: ValidationProps<Form>) {
  const value = form[field]
  const message = 'must be present'

  if (typeof value === 'string') {
    return value === '' ? message : null
  } else {
    return value === null ? message : null
  }
}

export function validateUrlFormat<Form>({form, field}: ValidationProps<Form>) {
  const value = form[field]
  const message = 'is invalid URL'

  if (value === undefined || value === null || typeof value !== 'string') {
    return null
  } else {
    return URL_REGEX.test(value) ? null : message
  }
}

export function monthAndYearAfterOrEqualTo<Form>({
  value: valueFn,
  otherValue: otherValueFn,
  message
}: {
  value: (form: Form) => MonthAndYear | null | undefined
  otherValue: (form: Form) => MonthAndYear | null | undefined
  message: string
}) {
  return ({form}: ValidationProps<Form>) => {
    const value = valueFn(form)
    const otherValue = otherValueFn(form)

    if (!value || !otherValue) return null

    return value.isAfterOrEqual(otherValue) ? null : message
  }
}

export function monthAndYearBeforeOrEqualTo<Form>({
  value: valueFn,
  otherValue: otherValueFn,
  message
}: {
  value: (form: Form) => MonthAndYear | null | undefined
  otherValue: (form: Form) => MonthAndYear | null | undefined
  message: string
}) {
  return ({form}: ValidationProps<Form>) => {
    const value = valueFn(form)
    const otherValue = otherValueFn(form)

    if (!value || !otherValue) return null
    return value.isBeforeOrEqual(otherValue) ? null : message
  }
}

export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never
}[keyof O]
