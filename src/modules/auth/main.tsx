import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/styles/globals.css";
import { initObservability } from "@/shared/lib/observability";
import App from "./App";

initObservability();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
