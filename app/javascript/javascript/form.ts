import { useState } from "react";
import { MonthAndYear } from "./time";
import { isNotNullOrUndefined, objectsEql } from "./utils";

type ValidationProps<Form> = {
  form: Form;
  field: keyof Form;
};

type Validation<Form> = ({ form }: ValidationProps<Form>) => string | null;

type FormSpec<Form> = {
  [Field in keyof Form]: {
    value?: Form[Field];
    validations: Validation<Form>[];
  };
};

type FormErrors<Form> = { [Field in keyof Form]: string[] };

const URL_REGEX =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export function useForm<FormValues>(spec: FormSpec<FormValues>) {
  function update<Field extends keyof FormValues>({
    field,
    value,
  }: {
    field: Field;
    value: FormValues[Field];
  }) {
    if (values[field] === value) return;

    setValues((current) => ({ ...current, [field]: value }));
    setValidate(true);
  }

  const initialValues: FormValues = (
    Object.keys(spec) as (keyof FormValues)[]
  ).reduce((result, field: keyof FormValues) => {
    return { ...result, [field]: spec[field].value };
  }, {} as FormValues);

  const [values, setValues] = useState(initialValues);
  const [validate, setValidate] = useState(false);

  const errors: FormErrors<FormValues> = (
    Object.keys(spec) as (keyof FormValues)[]
  ).reduce((result, field: keyof FormValues) => {
    const fieldErrors = validate
      ? spec[field].validations
          .map((validation) => validation({ form: values, field }))
          .filter(isNotNullOrUndefined)
      : [];

    return {
      ...result,
      [field]: fieldErrors,
    };
  }, {} as FormErrors<FormValues>);

  const isValid: boolean = (
    Object.keys(errors) as (keyof FormErrors<FormValues>)[]
  ).reduce((result: boolean, field: keyof FormValues) => {
    return result && errors[field].length === 0;
  }, true);

  return { values, errors, isValid, update };
}

export function validatePresence<Form>({ form, field }: ValidationProps<Form>) {
  const value = form[field];
  const message = "must be present";

  if (typeof value === "string") {
    return value === "" ? message : null;
  } else {
    return value === null ? message : null;
  }
}

export function validateUrlFormat<Form>({
  form,
  field,
}: ValidationProps<Form>) {
  const value = form[field];
  const message = "is invalid URL";

  if (value === undefined || value === null || typeof value !== "string") {
    return null;
  } else {
    return URL_REGEX.test(value) ? null : message;
  }
}

export function monthAndYearAfterOrEqualTo<Form>({
  value: valueFn,
  otherValue: otherValueFn,
  message,
}: {
  value: (form: Form) => MonthAndYear | null | undefined;
  otherValue: (form: Form) => MonthAndYear | null | undefined;
  message: string;
}) {
  return ({ form }: ValidationProps<Form>) => {
    const value = valueFn(form);
    const otherValue = otherValueFn(form);

    if (!value || !otherValue) return null;

    return value.isAfterOrEqual(otherValue) ? null : message;
  };
}

export function monthAndYearBeforeOrEqualTo<Form>({
  value: valueFn,
  otherValue: otherValueFn,
  message,
}: {
  value: (form: Form) => MonthAndYear | null | undefined;
  otherValue: (form: Form) => MonthAndYear | null | undefined;
  message: string;
}) {
  return ({ form }: ValidationProps<Form>) => {
    const value = valueFn(form);
    const otherValue = otherValueFn(form);

    if (!value || !otherValue) return null;
    return value.isBeforeOrEqual(otherValue) ? null : message;
  };
}
