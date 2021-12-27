import React from "react";
import { Resume } from "./Resume";

export function Preview() {
  return (
    <div className="preview">
      <Resume name="John Doe" summary="Hi there! I am John." />
    </div>
  );
}
