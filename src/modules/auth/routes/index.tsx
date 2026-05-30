import { Redirect, Route } from "wouter";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

export function AuthRoutes() {
  return (
    <>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/">
        <Redirect to="/login" />
      </Route>
    </>
  );
}
