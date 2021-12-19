import React from "react";
import ReactDOM from "react-dom";
import { Resume } from "../javascript/resume";

document.addEventListener("DOMContentLoaded", () => {
  const rootContainer = document.querySelector("#root");
  ReactDOM.render(<Resume {...rootContainer.dataset} />, rootContainer);
});
