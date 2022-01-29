import classNames from "classnames";
import React, { useEffect, useRef } from "react";
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
  value?: string;
  addendum?: string;
  state?: InputState;
  onChange?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onInput?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = value ?? "";
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

export function FormDatepickerInput({
  form,
  name,
  label,
  addendum,
}: {
  form: any;
  name: string;
  label: string;
  addendum?: string;
}) {
  return (
    <DatepickerInput
      name={name}
      value={form.values[name]?.toString()}
      state={form.errors[name].length === 0 ? "normal" : "error"}
      addendum={form.errors[name][0] || addendum}
      onChange={(event) =>
        form.update({
          field: name,
          value: event.target.value
            ? MonthAndYear.parse(event.target.value)
            : null,
        })
      }
      label={label}
    />
  );
}
