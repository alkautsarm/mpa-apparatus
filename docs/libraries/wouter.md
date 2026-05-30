# Wouter

Wouter is a minimalist client-side routing library for React. It provides the same core API as React Router (`<Route>`, `<Link>`, `useLocation`, `useParams`) in a much smaller bundle (~2 KB).

This project uses **Wouter 3**.

---

## How It Fits the MPA Model

This project is a Multi-Page Application — each `pages/*.html` file is a distinct browser page. Navigation *between* pages is a standard browser navigation (full page reload). Wouter is not involved in that.

Wouter handles navigation *within* a single page — client-side sub-routing that changes the URL without reloading the page. This is useful for multi-step flows (login → register → forgot password), tabbed views, and detail pages.

```
Browser navigation (full reload)
  /              → pages/index.html   → home module
  /auth.html     → pages/auth.html   → auth module

Wouter navigation (no reload, within auth module)
  /auth          → LoginPage
  /auth/register → RegisterPage
  /auth/forgot   → ForgotPasswordPage
```

---

## Base Path Convention

Each module's `App.tsx` wraps its routes in a `<Router>` with a `base` prop that matches the URL prefix of that page.

| Module | HTML file | Browser URL | Router base |
|---|---|---|---|
| `home` | `pages/index.html` | `/` | *(none)* |
| `auth` | `pages/auth.html` | `/auth.html` | `/auth` |
| `dashboard` | `pages/dashboard.html` | `/dashboard.html` | `/dashboard` |

The `base` does not include `.html`. When Wouter matches routes, it strips the base from the beginning of the URL, so route paths are always relative to the base.

```tsx
// src/modules/auth/App.tsx
import { Router } from "wouter";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <Router base="/auth">
      <AppRoutes />
    </Router>
  );
}
```

```tsx
// src/modules/home/App.tsx — no base needed for the root page
import { Router } from "wouter";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
```

---

## Adding a Sub-Route

### 1. Create the page component

```tsx
// src/modules/auth/pages/ForgotPasswordPage.tsx
export function ForgotPasswordPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p>Enter your email to receive a reset link.</p>
    </main>
  );
}
```

### 2. Add the route to `routes/index.tsx`

```tsx
// src/modules/auth/routes/index.tsx
import { Route, Switch } from "wouter";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot" component={ForgotPasswordPage} />
    </Switch>
  );
}
```

With `base="/auth"`, the `/forgot` route matches the browser URL `/auth/forgot`.

### 3. Link to it

```tsx
import { Link } from "wouter";

// Inside any component within the auth module:
<Link href="/forgot">Forgot password?</Link>
```

Wouter's `<Link>` automatically prepends the base, so `href="/forgot"` resolves to `/auth/forgot` in the browser URL bar.

---

## Route Parameters

Use `:param` syntax to capture dynamic segments:

```tsx
// Route definition
<Route path="/user/:id" component={UserDetailPage} />
```

```tsx
// src/modules/dashboard/pages/UserDetailPage.tsx
import { useParams } from "wouter";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <p>User ID: {id}</p>;
}
```

---

## Programmatic Navigation with `useLocation`

Use the `useLocation` hook to navigate programmatically — for example, after a form submission.

```tsx
import { useLocation } from "wouter";

export function LoginForm() {
  const [, navigate] = useLocation();

  const handleSubmit = async (data: LoginFormValues) => {
    await loginUser(data);
    // Navigate to the dashboard page (full browser navigation)
    window.location.href = "/dashboard.html";
    // Or navigate within the same page (Wouter client-side):
    navigate("/success");
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

`useLocation` returns a tuple `[currentPath, navigate]`. The `navigate` function changes the URL and triggers a Wouter re-render without a page reload — it is equivalent to clicking a `<Link>`.

For navigation to a **different MPA page**, use `window.location.href` or `window.location.assign()` — Wouter cannot cross page boundaries.

---

## Reading the Current Path

```tsx
import { useLocation } from "wouter";

export function NavBar() {
  const [path] = useLocation();

  return (
    <nav>
      <a href="/" style={{ fontWeight: path === "/" ? "bold" : "normal" }}>
        Home
      </a>
    </nav>
  );
}
```

---

## Swapping Wouter for React Router

If you need features Wouter does not provide (data loaders, deferred routes, `createBrowserRouter`), you can replace it with React Router v6/v7.

### 1. Install React Router

```bash
npm uninstall wouter
npm install react-router-dom
```

### 2. Update `App.tsx`

```tsx
// Before (Wouter)
import { Router } from "wouter";
export function App() {
  return <Router base="/auth"><AppRoutes /></Router>;
}

// After (React Router)
import { BrowserRouter } from "react-router-dom";
export function App() {
  return <BrowserRouter basename="/auth"><AppRoutes /></BrowserRouter>;
}
```

### 3. Update `routes/index.tsx`

```tsx
// Before (Wouter)
import { Route, Switch } from "wouter";
<Switch>
  <Route path="/" component={LoginPage} />
</Switch>

// After (React Router)
import { Routes, Route } from "react-router-dom";
<Routes>
  <Route path="/" element={<LoginPage />} />
</Routes>
```

### 4. Update `<Link>` and `useLocation`

| Wouter | React Router |
|---|---|
| `import { Link } from "wouter"` | `import { Link } from "react-router-dom"` |
| `import { useLocation } from "wouter"` | `import { useNavigate } from "react-router-dom"` |
| `const [, navigate] = useLocation()` | `const navigate = useNavigate()` |
| `navigate("/path")` | `navigate("/path")` |
| `const { id } = useParams<{ id: string }>()` | `const { id } = useParams()` |
