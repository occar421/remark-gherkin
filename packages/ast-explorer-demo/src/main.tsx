import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/layout.css";
import { App } from "./App.js";

if (typeof document !== "undefined") {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
