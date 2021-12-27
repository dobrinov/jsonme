import React from "react";
import { Preview } from "./Preview";
import { Wizard } from "./Wizard";

export function Onboarding() {
  return (
    <>
      <div className="gray" />
      <Wizard />
      <Preview />
    </>
  );
}
