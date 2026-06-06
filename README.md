# mpa-apparatus

A Vite Multi-Page Application (MPA) boilerplate with React 19, TypeScript 5, and a module-based architecture. Each HTML entry point is a separate browser page; within each page, Wouter handles client-side sub-routing. Modules are strictly isolated — shared code lives in `src/shared/`.

---

## Tech Stack

| Category | Tool |
|---|---|
| Build | Vite 6 |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn (new-york style) |
| Routing | Wouter 3 (per-page client-side routing) |
| State | Zustand 5 |
| Forms | react-hook-form + zod + @hookform/resolvers |
| i18n | react-i18next + i18next (en + id out of the box) |
| Icons | lucide-react |
| Linting | oxlint |
| Formatting | oxfmt |
| Git Hooks | Husky + lint-staged |
| Unit Tests | Vitest + @testing-library/react |
| E2E Tests | Playwright |

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> mpa-apparatus
cd mpa-apparatus

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
# Vite will print URLs for each discovered MPA page, e.g.:
#   http://localhost:5173/          (home)
#   http://localhost:5173/auth.html (auth)

# 4. Run unit tests
pnpm test

# 5. Run unit tests with UI
pnpm test:ui

# 6. Run unit tests with coverage
pnpm test:coverage

# 7. Run E2E tests (starts Vite dev server automatically)
pnpm test:e2e

# 8. Lint
pnpm lint

# 9. Format
pnpm format

# 10. Production build
pnpm build
# Output goes to dist/
```

---

## Project Structure (Top Level)

```
mpa-apparatus/
├── pages/               # HTML entry points (one per MPA page)
│   ├── index.html       # Home page
│   └── auth.html        # Auth page
├── src/
│   ├── modules/         # Feature modules (strictly isolated)
│   │   ├── home/
│   │   └── auth/
│   └── shared/          # Cross-module shared code
│       ├── components/
│       │   └── ui/      # shadcn components
│       ├── hooks/
│       ├── store/
│       ├── utils/
│       ├── types/
│       └── styles/
├── e2e/                 # Playwright E2E tests
├── docs/                # Project documentation
└── ...config files
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Directory tree, module system, shared layer, MPA + routing model |
| [docs/adding-a-module.md](docs/adding-a-module.md) | How to add a new MPA page + module |
| [docs/removing-a-module.md](docs/removing-a-module.md) | How to safely remove a module |
| [docs/libraries/shadcn.md](docs/libraries/shadcn.md) | shadcn setup, adding components, theming |
| [docs/libraries/zustand.md](docs/libraries/zustand.md) | Zustand stores, module-scoped vs global |
| [docs/libraries/wouter.md](docs/libraries/wouter.md) | Wouter routing within MPA pages |
| [docs/libraries/testing.md](docs/libraries/testing.md) | Vitest unit tests and Playwright E2E |
| [docs/libraries/oxc-tools.md](docs/libraries/oxc-tools.md) | oxlint, oxfmt, Husky + lint-staged |
| [docs/i18n.md](docs/i18n.md) | i18n setup, namespace conventions, adding locales, Zod integration |

---

## Seed Modules

The boilerplate ships with two modules:

- **home** — the root page (`/`), demonstrates basic routing and shared component usage
- **auth** — the auth page (`/auth.html`), demonstrates form validation with react-hook-form + zod

---

## Key Conventions

- **No cross-module imports.** `src/modules/home/` must never import from `src/modules/auth/` and vice versa. Anything shared goes into `src/shared/`.
- **Colocated tests.** Unit tests live next to their source files as `*.test.tsx`.
- **One store file, one hook export.** Zustand stores follow the `use<StoreName>.ts` naming convention.
- **Auto-discovered pages.** Any `pages/*.html` file is automatically picked up by Vite — no manual config needed.
