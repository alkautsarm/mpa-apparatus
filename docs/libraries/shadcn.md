# shadcn

shadcn is a collection of copy-paste React components built on top of Radix UI primitives and styled with Tailwind CSS. Components are not installed as a package dependency — the CLI copies the source files directly into your project, giving you full ownership and customizability.

This project uses the **new-york** style, **Tailwind v4**, and **CSS variables** for theming.

---

## How It Is Wired

### Component Location

All shadcn components live in `src/shared/components/ui/`. Any module can import from there:

```tsx
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
```

### Tailwind v4

The project uses `@tailwindcss/vite` (the Vite plugin for Tailwind v4). There is no `tailwind.config.ts` — configuration is driven by CSS directives in `src/shared/styles/globals.css`.

### CSS Variables

Theme tokens (colors, radii, shadows, etc.) are declared as CSS custom properties on `:root` and `.dark` in `globals.css`. shadcn components reference these variables through Tailwind utility classes like `bg-background`, `text-foreground`, `border-border`, etc.

```css
/* src/shared/styles/globals.css (excerpt) */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --radius: 0.5rem;
    /* ... */
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */
  }
}
```

### `cn` Utility

shadcn ships with a `cn` helper (usually placed at `src/shared/utils/cn.ts`) that merges class names with `clsx` and `tailwind-merge`:

```ts
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Adding a New Component

Use the shadcn CLI to add a component. The CLI reads `components.json` (the shadcn config at the project root) to know where to place files.

```bash
npx shadcn add <component-name>
```

Examples:

```bash
npx shadcn add card
npx shadcn add dialog
npx shadcn add form
npx shadcn add table
```

The command copies the component source into `src/shared/components/ui/` and installs any required Radix UI packages. Commit the generated files as part of your project.

To see all available components:

```bash
npx shadcn add --help
# or browse: https://ui.shadcn.com/docs/components
```

---

## Customizing the Theme

Edit the CSS custom properties in `src/shared/styles/globals.css`. Each token is an HSL triplet (hue, saturation, lightness) without the `hsl()` wrapper — Tailwind v4 wraps it internally.

```css
:root {
  /* Change the primary color to a blue */
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;

  /* Adjust the border radius */
  --radius: 0.375rem;  /* was 0.5rem */
}
```

Changes take effect immediately in the dev server (hot module reload).

### Switching to Dark Mode

Toggle dark mode by adding the `dark` class to `<html>`. You can do this in JavaScript:

```ts
document.documentElement.classList.toggle("dark");
```

Or drive it from a Zustand store in `src/shared/store/useThemeStore.ts` so the preference persists across pages via `localStorage`.

---

## Customizing a Component

Because components are copied into your project, you can edit them freely. Open the file and change whatever you need:

```tsx
// src/shared/components/ui/button.tsx
// Change the default variant, add a new size, adjust padding, etc.
```

Be aware that if you run `npx shadcn add button` again it will overwrite your changes. Keep customizations minimal or document them with a comment.

---

## Removing shadcn

If you want to remove shadcn and use a different styling approach:

1. **Delete the component files.**

   ```bash
   rm -rf src/shared/components/ui/
   ```

2. **Remove Radix UI packages.** shadcn components depend on `@radix-ui/*` packages. Remove them from `package.json`:

   ```bash
   npm uninstall @radix-ui/react-dialog @radix-ui/react-slot clsx tailwind-merge
   # repeat for each @radix-ui/* package you installed
   ```

3. **Remove the CSS variable theme tokens.** Delete the `:root` and `.dark` blocks added by shadcn from `globals.css`, keeping only the Tailwind base directives.

4. **Remove `components.json`** from the project root (shadcn's config file).

5. **Fix import errors.** Any module that imported `Button`, `Input`, etc. from `@/shared/components/ui/` will now have broken imports. Replace them with whatever you use instead.

---

## Alternatives

| Alternative | Notes |
|---|---|
| **Vanilla CSS** | Delete shadcn, write plain `.css` files, import them in components. Most control, most work. |
| **CSS Modules** | Use `*.module.css` files. Vite supports them natively — no extra config needed. |
| **Radix Themes** | A fully styled Radix UI component library. Install `@radix-ui/themes` and wrap your app in `<Theme>`. |
| **Mantine** | Full-featured component library with its own styling system. Install `@mantine/core`. |
| **Chakra UI** | Component library with a theme object. Install `@chakra-ui/react`. |
| **Headless UI** | Unstyled accessible components from the Tailwind team. Pair with Tailwind utilities directly. |
