import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { Form, KeysOfType } from "./form";
import { InputState } from "./InputState";
import { MonthAndYear } from "./time";

export function DatepickerInput({
  name,
  label,
  value,
  addendum,
  state,
  onChange,
  onInput,
}: {
  name: string;
  label: string;
  value: MonthAndYear | null;
  addendum?: string;
  state?: InputState;
  onChange?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onInput?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = value?.toString() ?? "";
  }, [value]);

  return (
    <div className={classNames("input", { "input-error": state === "error" })}>
      <label htmlFor={name}>{label}</label>
      <div>
        <div>
          <input
            id={name}
            name={name}
            type="month"
            ref={ref}
            onChange={onChange}
            onInput={onInput}
          />
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}

export function FormDatepickerInput<T>({
  form,
  name,
  label,
  addendum,
}: {
  form: Form<T>;
  name: KeysOfType<T, MonthAndYear | null>;
  label: string;
  addendum?: string;
}) {
  const value = form.values[name] as unknown as MonthAndYear | null;

  return (
    <DatepickerInput
      name={name as string}
      value={value}
      state={form.errors[name].length === 0 ? "normal" : "error"}
      addendum={form.errors[name][0] || addendum}
      onChange={(event) =>
        form.update({
          field: name,
          value: MonthAndYear.parse(event.target.value),
        })
      }
      label={label}
    />
  );
}
