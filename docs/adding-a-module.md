# Adding a Module

Each module is a self-contained feature slice tied to a single MPA page. Follow these steps to add one. The example below creates a **dashboard** module served at `/dashboard.html`.

---

## Step 1 — Create the HTML Entry Point

Create `pages/dashboard.html`. Vite auto-discovers every file matching `pages/*.html` — no changes to `vite.config.ts` are needed.

```html
<!-- pages/dashboard.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/modules/dashboard/main.tsx"></script>
  </body>
</html>
```

The `<script>` tag points to the module's entry point. The path must start with `/src/modules/<name>/main.tsx`.

---

## Step 2 — Create the Module Directory Structure

Create the following directory tree under `src/modules/dashboard/`:

```
src/modules/dashboard/
├── main.tsx
├── App.tsx
├── routes/
│   └── index.tsx
├── pages/
│   └── DashboardPage.tsx
├── components/       (empty for now, add as needed)
├── hooks/            (empty for now, add as needed)
└── store/            (empty for now, add as needed)
```

---

## Step 3 — Create `main.tsx`

`main.tsx` is the React entry point. It finds the `#root` element and mounts the app.

```tsx
// src/modules/dashboard/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/styles/globals.css";
import { App } from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root not found in the document.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Key points:
- Import `globals.css` here so Tailwind styles are available on this page.
- The `StrictMode` wrapper is recommended for development — it surfaces potential issues early.
- The null-check on `root` gives a clear error message if the HTML is misconfigured.

---

## Step 4 — Create `App.tsx`

`App.tsx` is the root React component. It wraps the page in any providers (theme, query client, etc.) and mounts the Wouter Router.

```tsx
// src/modules/dashboard/App.tsx
import { Router } from "wouter";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <Router base="/dashboard">
      <AppRoutes />
    </Router>
  );
}
```

The `base` prop should match the URL path prefix for this page. Because the page is at `/dashboard.html`, the base is `/dashboard`.

If your page needs global providers (e.g., a React Query `QueryClientProvider`), wrap the `Router` here:

```tsx
// src/modules/dashboard/App.tsx (with QueryClient)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router base="/dashboard">
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}
```

---

## Step 5 — Create `routes/index.tsx`

`routes/index.tsx` defines the Wouter route tree for this module. All paths here are relative to the `base` set in `App.tsx`.

```tsx
// src/modules/dashboard/routes/index.tsx
import { Route, Switch } from "wouter";
import { DashboardPage } from "../pages/DashboardPage";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
    </Switch>
  );
}
```

Add more routes as the module grows:

```tsx
import { SettingsPage } from "../pages/SettingsPage";
import { ProfilePage } from "../pages/ProfilePage";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={ProfilePage} />
    </Switch>
  );
}
```

With `base="/dashboard"`, the `/settings` route above matches `/dashboard/settings` in the browser.

---

## Step 6 — Create the First Page Component

```tsx
// src/modules/dashboard/pages/DashboardPage.tsx
export function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome to your dashboard.</p>
    </main>
  );
}
```

---

## Step 7 — Verify the Dev Server Picks It Up

Start (or restart) the dev server:

```bash
pnpm dev
```

Vite will automatically discover `pages/dashboard.html` and log something like:

```
  VITE v6.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Local:   http://localhost:5173/auth.html
  ➜  Local:   http://localhost:5173/dashboard.html
```

Open `http://localhost:5173/dashboard.html` — you should see the Dashboard page.

> No restart is needed if the dev server was already running — Vite's filesystem watcher picks up new `pages/*.html` files automatically in most cases. If it does not appear in the logged URL list, restart the server.

---

## Complete File Listing

Here is every file created for the `dashboard` module:

| File | Purpose |
|---|---|
| `pages/dashboard.html` | HTML entry point, auto-discovered by Vite |
| `src/modules/dashboard/main.tsx` | ReactDOM entry, mounts App |
| `src/modules/dashboard/App.tsx` | Root component, Wouter Router with base |
| `src/modules/dashboard/routes/index.tsx` | Route definitions |
| `src/modules/dashboard/pages/DashboardPage.tsx` | First page component |

---

## Checklist

- [ ] `pages/<name>.html` created with the correct `<script>` src
- [ ] `src/modules/<name>/main.tsx` imports `globals.css` and calls `createRoot`
- [ ] `src/modules/<name>/App.tsx` wraps routes in `<Router base="/<name>">`
- [ ] `src/modules/<name>/routes/index.tsx` exports `AppRoutes`
- [ ] At least one page component exists under `pages/`
- [ ] Dev server shows the new page URL
- [ ] No imports from other modules (only from own module or `src/shared/`)
