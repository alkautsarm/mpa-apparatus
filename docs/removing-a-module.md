# Removing a Module

Removing a module is a mechanical, low-risk operation because the no-cross-import rule guarantees that no other module depends on the one being removed. Follow these steps carefully to leave the project in a clean state.

The example below removes the **dashboard** module.

---

## Step 1 — Delete the HTML Entry Point

Delete `pages/dashboard.html`.

```bash
rm pages/dashboard.html
```

Vite will stop serving `/dashboard.html` immediately. If the dev server is running it will reload; the page will return 404 from this point on.

---

## Step 2 — Delete the Module Directory

Delete the entire `src/modules/dashboard/` directory.

```bash
rm -rf src/modules/dashboard/
```

This removes all module-private code: `main.tsx`, `App.tsx`, routes, page components, private components, hooks, and stores.

---

## Step 3 — Check for Shared Code Introduced by This Module

Before finishing, check whether this module contributed any code to `src/shared/` that is now orphaned (i.e., used only by the deleted module).

### 3a. Shared Components

Search for components in `src/shared/components/` that were added specifically for this module and are not referenced elsewhere:

```bash
# Find all import references to shared components across remaining source files
grep -r "from.*shared/components" src/modules/ --include="*.tsx" --include="*.ts"
```

Review the results. If a component in `src/shared/components/` appears in zero remaining imports, it is safe to delete.

### 3b. Global Stores

Check `src/shared/store/` for stores that were introduced to expose dashboard state globally (e.g., `useDashboardStore.ts`):

```bash
grep -r "useDashboardStore" src/ --include="*.tsx" --include="*.ts"
```

If there are no remaining references, delete the store file.

### 3c. Shared Hooks and Utils

Apply the same check to `src/shared/hooks/` and `src/shared/utils/`:

```bash
grep -r "from.*shared/hooks" src/modules/ --include="*.tsx" --include="*.ts"
grep -r "from.*shared/utils" src/modules/ --include="*.tsx" --include="*.ts"
```

Delete any file that is no longer referenced.

### 3d. Shared Types

Check `src/shared/types/` for type definitions that were introduced for this module:

```bash
grep -r "from.*shared/types" src/modules/ --include="*.tsx" --include="*.ts"
```

> **Tip:** If you use a TypeScript-aware editor, the "Find All References" feature is the most reliable way to locate orphaned exports.

---

## Step 4 — Run the Build to Verify

Run a production build to confirm there are no broken imports or TypeScript errors:

```bash
npm run build
```

A clean exit (no errors) means the removal is complete. If the build fails:

- Read the error message to identify which file still holds a reference to the deleted module.
- Fix the import (either delete the reference or move the dependency to shared).
- Re-run `npm run build`.

---

## Step 5 — Run Tests

Run the full test suite to make sure no test files reference the removed module:

```bash
npm run test
npm run test:e2e
```

Delete any test files in `e2e/` that were testing the removed page (e.g., `e2e/dashboard.spec.ts`).

---

## Checklist

- [ ] `pages/<name>.html` deleted
- [ ] `src/modules/<name>/` deleted
- [ ] `src/shared/` inspected for orphaned components, stores, hooks, utils, and types
- [ ] `npm run build` exits cleanly
- [ ] `npm run test` passes
- [ ] `e2e/<name>.spec.ts` deleted (if present)
- [ ] No navigation links pointing to the removed page remain in other modules (fix or remove them)
