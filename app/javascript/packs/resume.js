import React from "react";
import ReactDOM from "react-dom";
import { Resume, parseResume } from "../javascript/resume/Resume";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#resume");
  ReactDOM.render(<Resume {...parseResume(root.dataset.resume)} editable={root.dataset.editable === 'true'} />, root);
});
