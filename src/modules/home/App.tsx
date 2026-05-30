import { Router } from "wouter";
import { HomeRoutes } from "./routes";

export default function App() {
  return (
    <Router>
      <HomeRoutes />
    </Router>
  );
}
