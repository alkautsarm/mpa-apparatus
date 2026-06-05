# Observability

This boilerplate ships with Sentry-powered error tracking and Core Web Vitals monitoring. It is zero-config for local development — if `VITE_SENTRY_DSN` is not set, the integration is a no-op.

---

## What's included

| Feature | How |
|---|---|
| Error tracking | Unhandled JS errors and promise rejections are captured automatically |
| React error boundaries | Each module root is wrapped in `ObservabilityErrorBoundary`; render crashes show a fallback instead of a blank page |
| Core Web Vitals | LCP, CLS, INP, FCP, TTFB are captured as pageload transaction attributes via `browserTracingIntegration` |
| Source maps | Uploaded to Sentry at build time when `SENTRY_AUTH_TOKEN` is set, making stack traces readable |

---

## Setup

### 1. Create a Sentry project

1. Sign in at [sentry.io](https://sentry.io) and create a new **React** project.
2. Copy the DSN from **Project Settings → Client Keys (DSN)**.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Minimum required for runtime monitoring:

```env
VITE_SENTRY_DSN=https://xxxx@oXXX.ingest.sentry.io/YYYY
VITE_SENTRY_ENVIRONMENT=development
```

For source map uploads during builds (typically set in CI, not locally):

```env
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

Generate `SENTRY_AUTH_TOKEN` at **User Settings → Auth Tokens** with `project:releases` and `org:read` scopes.

---

## Testing locally

1. Set `VITE_SENTRY_DSN` in `.env`.
2. Run `pnpm dev` and load any page.
3. Open **Sentry → Performance** — a pageload transaction should appear within a few seconds.
4. To test error capture, temporarily throw in a component:
   ```ts
   throw new Error("test error");
   ```
   Check **Sentry → Issues** for the captured event.

---

## Adding observability to a new module

When you add a new module (see [adding-a-module.md](adding-a-module.md)), add two call sites:

**`src/modules/<name>/main.tsx`** — call before `createRoot`:
```ts
import { initObservability } from "@/shared/lib/observability";
initObservability();
```

**`src/modules/<name>/App.tsx`** — wrap the root:
```tsx
import { ObservabilityErrorBoundary } from "@/shared/lib/observability";

export default function App() {
  return (
    <ObservabilityErrorBoundary>
      {/* your router and routes */}
    </ObservabilityErrorBoundary>
  );
}
```

---

## Production considerations

### `tracesSampleRate`

The default is `1.0` (capture 100% of transactions). For high-traffic production deployments, lower this to reduce Sentry event volume:

```ts
// src/shared/lib/observability/init.ts
tracesSampleRate: 0.1, // capture 10% of transactions
```

### Sentry DSN is not a secret

Client-side DSNs are designed to be public. They identify your project but cannot be used to read your data. Restrict abuse via **Project Settings → Inbound Filters** and **Allowed Domains**.

### Bundle size

`@sentry/react` with only `browserTracingIntegration` adds approximately 50–70 KB gzipped to your bundle (tree-shaken). Measure with `pnpm build` and inspect `dist/` if this is a concern.
