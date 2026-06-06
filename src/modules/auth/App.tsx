import { Router } from "wouter";
import { ObservabilityErrorBoundary } from "@/shared/lib/observability";
import { AuthRoutes } from "./routes";

export default function App() {
  return (
    <ObservabilityErrorBoundary>
      <Router base="/auth">
        <AuthRoutes />
      </Router>
    </ObservabilityErrorBoundary>
  );
}
