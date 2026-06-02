# OXC Tools (oxlint + oxfmt)

This project uses two tools from the [OXC project](https://oxc.rs/) for code quality: **oxlint** (linting) and **oxfmt** (formatting). Both are Rust-based and significantly faster than their JavaScript counterparts.

---

## oxlint

### What It Is

oxlint is a linter for JavaScript and TypeScript. It replaces **ESLint** for the majority of rule coverage while running orders of magnitude faster (no plugin system overhead, parallel file processing in Rust).

oxlint does not aim to replicate every ESLint plugin, but it covers the most common rules from `eslint:recommended`, `typescript-eslint`, `react-hooks`, and others out of the box.

### Configuration

The config file is `.oxlintrc.json` at the project root:

```json
// .oxlintrc.json
{
  "$schema": "https://cdn.jsdelivr.net/gh/nicolo-ribaudo/oxlint-schema@latest/schema.json",
  "env": {
    "browser": true,
    "es2022": true
  },
  "plugins": ["react", "react-hooks", "typescript"],
  "rules": {
    "no-console": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

Key sections:

- **`env`** — declares global environments. `browser: true` makes `window`, `document`, etc. valid globals.
- **`plugins`** — activates rule sets. `react`, `react-hooks`, and `typescript` are built into oxlint.
- **`rules`** — overrides default rule severities. Values are `"off"`, `"warn"`, or `"error"`.

Consult the [oxlint rules reference](https://oxc.rs/docs/guide/usage/linter/rules.html) for the full list.

### Running the Linter

```bash
# Lint the entire project
pnpm lint

# Lint a specific file or directory
pnpm exec oxlint src/modules/home/
```

oxlint exits with code `1` if any errors are found. Warnings do not cause a non-zero exit code by default.

### Disabling a Rule for One Line

```tsx
// oxlint-disable-next-line no-console
console.log("debug only");
```

For a whole file:

```tsx
// oxlint-disable
```

---

## oxfmt

### What It Is

oxfmt is a code formatter for JavaScript and TypeScript. It replaces **Prettier** in this project. Like Prettier, it is opinionated and produces deterministic output — you do not negotiate formatting details; you adopt the formatter's output.

### Configuration

The config file is `.oxfmtrc.json` at the project root:

```json
// .oxfmtrc.json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

These options follow the same semantics as Prettier's config options.

### Running the Formatter

```bash
# Format all files in-place
pnpm format

# Check formatting without writing (exits non-zero if changes would be made)
pnpm format:check
```

`format:check` is useful in CI to enforce that all committed code is formatted.

---

## Husky + lint-staged

### How It Works

Husky registers a git `pre-commit` hook at `.husky/pre-commit`. When you run `git commit`, Husky runs the hook before the commit is recorded.

The hook delegates to **lint-staged**, which runs commands only on the files that are staged (added to the commit). This makes the hook fast — it does not recheck the whole project on every commit.

### Configuration

lint-staged is configured in `package.json`:

```json
// package.json (excerpt)
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "oxlint --fix",
      "oxfmt --write"
    ],
    "*.{json,css,md}": [
      "oxfmt --write"
    ]
  }
}
```

When you stage TypeScript files and commit:
1. `oxlint --fix` runs on those files and auto-fixes any fixable lint errors.
2. `oxfmt --write` reformats those files in-place.
3. The fixed/formatted files are re-staged automatically.
4. If oxlint finds errors it cannot auto-fix, the commit is aborted and the errors are printed.

### The Pre-Commit Hook File

```sh
# .husky/pre-commit
pnpm exec lint-staged
```

### Skipping the Hook (Emergency Only)

If you need to commit without running the hook (e.g., a work-in-progress commit on a feature branch):

```bash
git commit --no-verify -m "wip"
```

Do not use `--no-verify` on merge commits to main/production branches.

---

## Swapping to ESLint + Prettier

If you need a richer plugin ecosystem (e.g., `eslint-plugin-import`, custom rules), you can replace oxlint and oxfmt with ESLint and Prettier.

### 1. Remove OXC tools

```bash
pnpm remove oxlint oxfmt
```

Delete `.oxlintrc.json` and `.oxfmtrc.json`.

### 2. Install ESLint + Prettier

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 3. Create ESLint config (`eslint.config.js` — flat config)

```js
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { react: reactPlugin, "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
```

### 4. Create Prettier config (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

### 5. Update lint-staged in `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

### 6. Update `package.json` scripts

```json
{
  "scripts": {
    "lint": "eslint src",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```
