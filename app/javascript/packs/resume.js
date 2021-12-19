import React from "react";
import ReactDOM from "react-dom";
import { Resume, parseResume } from "../javascript/Resume";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#root");
  ReactDOM.render(<Resume {...parseResume(root.dataset.resume)} />, root);
});
