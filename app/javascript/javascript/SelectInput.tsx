import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { InputState } from "./InputState";

export function SelectInput({
  name,
  label,
  value,
  collection,
  addendum,
  state,
  prompt,
  onChange,
}: {
  name: string;
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
          <select id={name} name={name} onChange={onChange}>
            {prompt && (
              <option value="">
                {typeof prompt === "boolean" ? "Please, select..." : prompt}
              </option>
            )}
            {collection.map((element) => (
              <option value={element.id}>{element.label}</option>
            ))}
          </select>
        </div>
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
