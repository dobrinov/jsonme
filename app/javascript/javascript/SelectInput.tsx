import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { Form } from "./form";
import { InputState } from "./InputState";

export function SelectInput<T>({
  name,
  label,
  value,
  collection,
  addendum,
  state,
  prompt,
  onChange,
}: {
  name: keyof T & string;
  label: string;
  collection: { id: string; label: string }[];
  value?: string;
  addendum?: string;
  state?: InputState;
  prompt?: string | true;
  onChange?: (event: React.FocusEvent<HTMLSelectElement, Element>) => void;
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
          <select id={name} name={name} onChange={onChange} value={value ?? ""}>
            {prompt && (
              <option value="">
                {typeof prompt === "boolean" ? "Please, select..." : prompt}
              </option>
            )}
            {collection.map((element) => (
              <option key={element.id} value={element.id}>
                {element.label}
              </option>
            ))}
          </select>
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}

export function FormSelectInput<T>({
  form,
  name,
  label,
  collection,
  addendum,
  prompt,
}: {
  form: Form<T>;
  name: keyof T & string;
  label: string;
  collection: { id: string; label: string }[];
  addendum?: string;
  prompt?: string | true;
}) {
  return (
    <SelectInput<T>
      name={name}
      value={form.values[name] as any}
      addendum={form.errors[name][0] || addendum}
      state={form.errors[name].length === 0 ? "normal" : "error"}
      collection={collection}
      prompt={prompt}
      label={label}
      onChange={(event) => {
        form.update({
          field: name,
          value: event.target.value as unknown as T[keyof T],
        });
      }}
    />
  );
}
