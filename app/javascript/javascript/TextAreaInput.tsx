import classNames from "classnames";
import React, { useEffect, useRef } from "react";

export function TextAreaInput({
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
            onBlur={onBlur}
            onInput={onInput}
          ></textarea>
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
