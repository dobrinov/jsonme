import classNames from "classnames";
import React, { useEffect, useRef } from "react";

export function DatepickerInput({
  name,
  type,
  label,
  value,
  addendum,
  state,
  onBlur,
  onInput,
}: {
  name: string;
  type: "date" | "week" | "month";
  label: string;
  value?: string;
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
            name={name}
            type={type}
            ref={ref}
            onBlur={onBlur}
            onInput={onInput}
          />
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
