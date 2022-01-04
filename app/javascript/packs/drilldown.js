import React from "react";
import ReactDOM from "react-dom";
import { Drilldown } from "../javascript/Drilldown";

document.addEventListener("DOMContentLoaded", () => {
  const rootContainer = document.querySelector("#root");
  ReactDOM.render(<Drilldown />, rootContainer);
});
