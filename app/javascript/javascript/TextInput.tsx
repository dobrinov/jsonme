import React, { useEffect, useRef } from "react";

export function TextInput({
  name,
  label,
  value,
  placeholder,
  onBlur,
}: {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  onBlur: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = value;
  }, [value]);

  return (
    <div className="input">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        autoComplete="off"
        name={name}
        type="text"
        ref={ref}
        placeholder={placeholder}
        onBlur={onBlur}
      />
    </div>
  );
}
