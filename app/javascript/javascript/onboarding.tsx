import React from "react";
import { Preview } from "./Preview";
import { Wizard } from "./Wizard";

export function Onboarding() {
  return (
    <>
      <div className="left">
        <Wizard />
      </div>
      <div className="right">
        <Preview />
      </div>
      <div className="background" />
    </>
  );
}
