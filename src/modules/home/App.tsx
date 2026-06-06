import { Router } from "wouter";
import { ObservabilityErrorBoundary } from "@/shared/lib/observability";
import { HomeRoutes } from "./routes";

export default function App() {
  return (
    <ObservabilityErrorBoundary>
      <Router>
        <HomeRoutes />
      </Router>
    </ObservabilityErrorBoundary>
  );
}
