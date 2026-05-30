import { Route } from "wouter";
import { HomePage } from "../pages/HomePage";

export function HomeRoutes() {
  return <Route path="/" component={HomePage} />;
}
