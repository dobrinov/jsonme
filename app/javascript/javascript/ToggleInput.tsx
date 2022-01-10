import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { InputState } from "./InputState";
import { Toggle } from "./Toggle";

export function ToggleInput({
  name,
  label,
  on,
  addendum,
  state,
  onChange,
}: {
  name: string;
  label: string;
  on?: boolean;
  placeholder?: string;
  addendum?: string;
  state?: InputState;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className={classNames("input", { "input-error": state === "error" })}>
      <label htmlFor={name}>{label}</label>
      <div>
        <Toggle on={on} onChange={onChange} />
        {addendum && <p>{addendum}</p>}
      </div>
    </div>
  );
}
