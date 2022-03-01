import React from "react";

export function Name({ value }: { value: string }) {
  return <h1 className="resume__name">{value}</h1>;
}
