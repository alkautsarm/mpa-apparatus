# Architecture

This document explains the directory structure, the module system, the shared layer, and how MPA page navigation and client-side routing fit together.

---

## Directory Tree

```
mpa-aparatus/
│
├── pages/                          # HTML entry points — one file = one browser page
│   ├── index.html                  # Home page (served at /)
│   └── auth.html                   # Auth page (served at /auth.html)
│
├── src/
│   ├── modules/                    # Feature modules, strictly isolated from each other
│   │   │
│   │   ├── home/                   # "home" module
│   │   │   ├── main.tsx            # ReactDOM.createRoot entry point
│   │   │   ├── App.tsx             # Root component — mounts the Wouter Router
│   │   │   ├── routes/
│   │   │   │   └── index.tsx       # Route definitions (Wouter <Route> tree)
│   │   │   ├── pages/              # Page-level components (one per route)
│   │   │   │   └── HomePage.tsx
│   │   │   ├── components/         # Components private to this module
│   │   │   ├── hooks/              # Hooks private to this module
│   │   │   └── store/              # Zustand stores private to this module
│   │   │
│   │   └── auth/                   # "auth" module
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       │   └── index.tsx
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx
│   │       │   └── RegisterPage.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       └── store/
│   │
│   └── shared/                     # Code shared across all modules
│       ├── components/
│       │   └── ui/                 # shadcn components (auto-generated)
│       │       ├── button.tsx
│       │       ├── input.tsx
│       │       └── ...
│       ├── hooks/                  # Hooks usable by any module
│       ├── store/                  # Global Zustand stores
│       ├── utils/                  # Pure utility functions
│       ├── types/                  # Shared TypeScript types / interfaces
│       └── styles/
│           └── globals.css         # Tailwind base + CSS variable theme tokens
│
├── e2e/                            # Playwright E2E tests
│   ├── home.spec.ts
│   └── auth.spec.ts
│
├── public/                         # Static assets copied verbatim to dist/
│
├── docs/                           # Project documentation (this folder)
│
├── .husky/                         # Husky git hooks
│   └── pre-commit
│
├── vite.config.ts                  # Vite config — auto-discovers pages/*.html
├── tailwind.config.ts              # (if present) Tailwind config
├── tsconfig.json
├── tsconfig.app.json
├── vitest.config.ts
├── playwright.config.ts
├── .oxlintrc.json                  # oxlint configuration
├── .oxfmtrc.json                   # oxfmt configuration
└── package.json
```

---

## The Module System

### What Is a Module?

A module is a self-contained feature slice that maps 1-to-1 with an MPA page. It owns its own:

- **Entry point** (`main.tsx`) — calls `ReactDOM.createRoot` and mounts `App.tsx`
- **Root component** (`App.tsx`) — wraps the page in providers and mounts the Wouter Router
- **Routes** (`routes/index.tsx`) — defines the Wouter `<Route>` tree for sub-navigation within the page
- **Page components** (`pages/`) — top-level components rendered for each route
- **Private components** (`components/`) — UI pieces that are only meaningful within this module
- **Private hooks** (`hooks/`) — hooks that depend on module-specific state or behavior
- **Private stores** (`store/`) — Zustand stores scoped to this module

### Internal Layout

Every module follows the same internal structure. A freshly created module looks like:

```
src/modules/<name>/
├── main.tsx          # Entry: mounts App
├── App.tsx           # Providers + Router
├── routes/
│   └── index.tsx     # Route definitions
├── pages/            # One component per route
├── components/       # Module-private UI
├── hooks/            # Module-private hooks
└── store/            # Module-private Zustand stores
```

You are free to add subdirectories inside any of these folders (e.g., `components/forms/`), but the top-level folder names should remain stable so the pattern stays predictable.

### The No-Cross-Import Rule

**Modules must never import from each other.**

If `home` needs a component that `auth` also needs, the component belongs in `src/shared/`, not in either module. This constraint keeps modules independently deployable, testable, and deletable. Removing a module is always a safe, mechanical operation.

See [Allowed vs. Disallowed Imports](#allowed-vs-disallowed-imports) below for examples.

---

## The Shared Layer

`src/shared/` is the only place where code can be legitimately reused across modules. Every subfolder has a specific role:

| Folder | What goes here |
|---|---|
| `components/ui/` | shadcn components. Added with `pnpm dlx shadcn@latest add <name>`. Never edited manually unless customizing. |
| `components/` (root) | Custom shared React components that are not shadcn (e.g., `PageLayout`, `ErrorBoundary`). |
| `hooks/` | Custom React hooks that could be useful in multiple modules (e.g., `useDebounce`, `useMediaQuery`). |
| `store/` | Global Zustand stores that need to be read or written by more than one module (e.g., `useAuthStore` tracking the logged-in user so the home module can read it). |
| `utils/` | Pure functions — no React, no side effects (e.g., `formatDate`, `cn` className helper). |
| `types/` | TypeScript `type` and `interface` definitions that are referenced across multiple modules. |
| `styles/` | Global CSS: Tailwind base directives, CSS custom properties (theme tokens), font imports. |

**Guidance:** Before adding something to `src/shared/`, ask whether it is genuinely needed by more than one module today. Premature sharing leads to a bloated shared layer. If it is only needed by one module now, start it in the module and move it later if another module needs it.

---

## MPA + Wouter Routing Model

### Browser-Level Navigation (MPA)

Each file in `pages/` is a distinct HTML document served by Vite. Moving between pages is a **full browser navigation** — the browser loads a new HTML document, which bootstraps a fresh React tree.

```
Browser visits /           → pages/index.html  → src/modules/home/main.tsx
Browser visits /auth.html  → pages/auth.html   → src/modules/auth/main.tsx
```

There is no shared React context across pages. If state needs to persist across page transitions, use `localStorage`, `sessionStorage`, cookies, or a backend API — not in-memory React state.

### Client-Side Sub-Routing (Wouter)

Within a single MPA page, Wouter provides client-side routing so the URL can change without a full reload. This is useful for multi-step flows, tabs, and nested views.

Each module's `App.tsx` mounts a `<Router>` with an appropriate `base` prop:

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
// src/modules/home/App.tsx
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

The `base` prop tells Wouter what the page's root path is. For `auth.html`, which is served at `/auth.html`, the base is `/auth` (without `.html`). For the home page at `/`, no base is needed.

Route definitions inside the module then use paths relative to that base:

```tsx
// src/modules/auth/routes/index.tsx
import { Route, Switch } from "wouter";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
    </Switch>
  );
}
```

With `base="/auth"`, the `/register` route above matches the browser URL `/auth/register`.

### Navigation Flow Summary

```
User clicks a link to /auth.html
  → Full browser navigation
  → pages/auth.html loads
  → src/modules/auth/main.tsx mounts
  → Wouter Router at base="/auth" starts
  → URL is /auth.html → matches Route path="/"
  → LoginPage renders

User clicks "Register" inside the auth page
  → Wouter intercepts (no page reload)
  → URL changes to /auth/register
  → RegisterPage renders
```

---

## Allowed vs. Disallowed Imports

### Allowed

```ts
// Inside src/modules/home/pages/HomePage.tsx

// Importing from own module — OK
import { HeroSection } from "../components/HeroSection";
import { useHomeStore } from "../store/useHomeStore";

// Importing from shared — OK
import { Button } from "@/shared/components/ui/button";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { formatDate } from "@/shared/utils/formatDate";
import type { User } from "@/shared/types";
```

### Disallowed

```ts
// Inside src/modules/home/pages/HomePage.tsx

// Importing from another module — NOT ALLOWED
import { LoginForm } from "@/modules/auth/components/LoginForm";  // BAD
import { useAuthModule } from "@/modules/auth/hooks/useAuthModule"; // BAD
```

If `home` needs something from `auth`, move it to `src/shared/` first, then import from there.

### Path Aliases

The `@/` alias resolves to `src/`. Configure it in `tsconfig.app.json` and `vite.config.ts`:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```ts
// vite.config.ts
import path from "path";

export default {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
```
