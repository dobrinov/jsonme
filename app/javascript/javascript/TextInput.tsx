import classNames from "classnames";
import React, { useEffect, useRef } from "react";

export function TextInput({
  name,
  label,
  value,
  placeholder,
  addendum,
  state,
  onBlur,
  onInput,
}: {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  addendum?: string;
  state?: "normal" | "error";
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
            onBlur={onBlur}
            onInput={onInput}
          />
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
