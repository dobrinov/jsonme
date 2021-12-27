import React from "react";
import ReactDOM from "react-dom";
import { Onboarding } from "../javascript/Onboarding";

document.addEventListener("DOMContentLoaded", () => {
  const rootContainer = document.querySelector("#root");
  ReactDOM.render(<Onboarding {...rootContainer.dataset} />, rootContainer);
});
