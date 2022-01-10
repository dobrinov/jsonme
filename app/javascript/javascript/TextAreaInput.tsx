import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { InputState } from "./InputState";

export function TextAreaInput({
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
  onChange?: (event: React.FocusEvent<HTMLTextAreaElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement, Element>) => void;
  onInput?: (event: React.FocusEvent<HTMLTextAreaElement, Element>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = value ?? "";
  }, [value]);

  return (
    <div className={classNames("input", { "input-error": state === "error" })}>
      <label htmlFor={name}>{label}</label>
      <div>
        <div>
          <textarea
            id={name}
            autoComplete="off"
            name={name}
            ref={ref}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            onInput={onInput}
          ></textarea>
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
