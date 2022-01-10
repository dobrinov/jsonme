import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { InputState } from "./InputState";

export function TextInput({
  name,
  label,
  value,
  placeholder,
  addendum,
  state,
  onChange,
  onBlur,
  onInput,
}: {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  addendum?: string;
  state?: InputState;
  onChange?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
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
            autoComplete="off"
            name={name}
            type="text"
            ref={ref}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            onInput={onInput}
          />
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
