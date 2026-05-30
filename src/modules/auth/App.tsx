import { Router } from "wouter";
import { AuthRoutes } from "./routes";

export default function App() {
  return (
    <Router base="/auth">
      <AuthRoutes />
    </Router>
  );
}
