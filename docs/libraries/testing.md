# Testing

This project uses **Vitest** for unit and component tests, and **Playwright** for end-to-end tests.

---

## Unit & Component Tests (Vitest)

### Setup

Vitest is configured in `vitest.config.ts`:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",       // Simulate the browser DOM
    globals: true,              // No need to import describe/it/expect
    setupFiles: ["./src/shared/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Key settings:

- **`environment: "jsdom"`** — Provides `document`, `window`, `HTMLElement`, etc. so React components can render in Node.
- **`globals: true`** — Makes `describe`, `it`, `test`, `expect`, `beforeEach`, `afterEach`, `vi` available globally without imports.
- **`setupFiles`** — Runs `src/shared/test/setup.ts` before each test file.

### Setup File

```ts
// src/shared/test/setup.ts
import "@testing-library/jest-dom";
```

Importing `@testing-library/jest-dom` extends Vitest's `expect` with DOM-specific matchers like `.toBeInTheDocument()`, `.toHaveValue()`, `.toBeVisible()`, and `.toHaveClass()`.

---

### @testing-library/react Patterns

#### Basic Render and Query

```tsx
// src/modules/home/pages/HomePage.test.tsx
import { render, screen } from "@testing-library/react";
import { HomePage } from "./HomePage";

test("renders the page heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
});
```

#### User Interactions with `userEvent`

Use `@testing-library/user-event` for realistic user interactions (typing, clicking, tabbing). It simulates the full browser event chain, unlike `fireEvent` which dispatches individual synthetic events.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

test("shows an error when submitting an empty email", async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: /log in/i }));

  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

#### Wrapping with Providers

If a component uses Wouter's `<Link>` or `useLocation`, wrap it in a `<Router>` during tests:

```tsx
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { NavBar } from "./NavBar";

test("renders nav links", () => {
  render(
    <Router>
      <NavBar />
    </Router>
  );
  expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
});
```

For Zustand stores, the store state is global in-memory — tests that modify state should reset it in `beforeEach`/`afterEach`:

```ts
import { useHomeStore } from "../store/useHomeStore";

beforeEach(() => {
  useHomeStore.setState({ greeting: "Hello, world!" });
});
```

#### Async Queries

For content that appears after a state update or async operation, use `findBy*` queries (they return a Promise):

```tsx
test("shows user name after loading", async () => {
  render(<UserProfile userId="123" />);
  expect(await screen.findByText("Alice")).toBeInTheDocument();
});
```

---

### Colocated Test Convention

Unit tests live **next to the file they test**, named `<filename>.test.tsx`:

```
src/modules/auth/pages/
├── LoginPage.tsx
├── LoginPage.test.tsx       ← tests for LoginPage
└── RegisterPage.tsx

src/shared/utils/
├── formatDate.ts
└── formatDate.test.ts       ← tests for formatDate
```

This keeps tests easy to find and makes it obvious when a file has no tests.

---

### Running Tests

```bash
# Run all tests once (CI mode)
npm run test

# Run in watch mode (interactive terminal)
npm run test -- --watch

# Open the Vitest browser UI (visual test runner)
npm run test:ui

# Generate a coverage report (outputs to coverage/)
npm run test:coverage
```

---

### Swapping Vitest for Jest

1. Uninstall Vitest:

   ```bash
   npm uninstall vitest @vitest/ui @vitest/coverage-v8
   ```

2. Install Jest and its dependencies:

   ```bash
   npm install -D jest @types/jest jest-environment-jsdom ts-jest @testing-library/jest-dom
   ```

3. Create `jest.config.ts`:

   ```ts
   export default {
     preset: "ts-jest",
     testEnvironment: "jsdom",
     setupFilesAfterFramework: ["./src/shared/test/setup.ts"],
     moduleNameMapper: {
       "^@/(.*)$": "<rootDir>/src/$1",
     },
   };
   ```

4. Remove `vitest.config.ts`.

5. Update `package.json` scripts to use `jest` instead of `vitest`.

---

## End-to-End Tests (Playwright)

### Setup

Playwright is configured in `playwright.config.ts`:

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

The `webServer` block automatically starts the Vite dev server before running tests and shuts it down afterward. In CI, it always starts a fresh server (`reuseExistingServer: false`). Locally, it reuses an already-running server if one is available.

### Writing E2E Tests

Tests live in `e2e/` and follow Playwright's `test`/`expect` API:

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("login page renders correctly", async ({ page }) => {
  await page.goto("/auth.html");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});

test("shows validation error for empty email", async ({ page }) => {
  await page.goto("/auth.html");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByText(/email is required/i)).toBeVisible();
});

test("navigates to register page", async ({ page }) => {
  await page.goto("/auth.html");
  await page.getByRole("link", { name: /register/i }).click();
  await expect(page).toHaveURL(/\/auth\/register/);
  await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
});
```

### Running E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with the Playwright UI (headed, interactive)
npx playwright test --ui

# Run a specific file
npx playwright test e2e/auth.spec.ts

# Run in headed mode for debugging
npx playwright test --headed
```

The first time you run Playwright, install the browser binaries:

```bash
npx playwright install
```

### Swapping Playwright for Cypress

1. Uninstall Playwright:

   ```bash
   npm uninstall @playwright/test
   ```

2. Install Cypress:

   ```bash
   npm install -D cypress
   ```

3. Initialize Cypress (creates `cypress/` directory and config):

   ```bash
   npx cypress open
   ```

4. Move tests from `e2e/` to `cypress/e2e/` and rewrite them using Cypress syntax:

   ```ts
   // cypress/e2e/auth.cy.ts (Cypress equivalent)
   describe("auth", () => {
     it("login page renders correctly", () => {
       cy.visit("/auth.html");
       cy.get("h1").should("contain.text", "Sign In");
     });
   });
   ```

5. Update `package.json` scripts:

   ```json
   "test:e2e": "cypress run"
   ```
