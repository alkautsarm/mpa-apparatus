# Zustand

Zustand is a small, fast state management library for React. It stores state outside the React component tree (in a closure), making it accessible from anywhere without prop-drilling or context provider wrappers.

This project uses **Zustand 5**.

---

## How It Is Wired

Zustand requires no global setup or provider. A store is created with `create()` from the `zustand` package and exported as a custom hook. Components call the hook to subscribe to the state they need.

---

## Store Placement

Stores in this project fall into two categories:

| Category | Location | Who can import it |
|---|---|---|
| Module-scoped | `src/modules/<name>/store/` | Only files inside `src/modules/<name>/` |
| Global | `src/shared/store/` | Any module |

This mirrors the module isolation rule: if only one module needs a piece of state, it lives in that module's store folder. If multiple modules need to read or write the same state, the store is promoted to `src/shared/store/`.

---

## Naming Convention

Each store file is named after the hook it exports:

```
use<StoreName>.ts
```

Each file exports exactly one hook. Examples:

- `src/modules/home/store/useHomeStore.ts` → exports `useHomeStore`
- `src/shared/store/useAuthStore.ts` → exports `useAuthStore`
- `src/shared/store/useThemeStore.ts` → exports `useThemeStore`

---

## Module-Scoped Store

A module-scoped store holds state that is only relevant within one module. It is never imported outside of its module directory.

```ts
// src/modules/home/store/useHomeStore.ts
import { create } from "zustand";

interface HomeState {
  greeting: string;
  setGreeting: (greeting: string) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  greeting: "Hello, world!",
  setGreeting: (greeting) => set({ greeting }),
}));
```

Usage inside the `home` module:

```tsx
// src/modules/home/pages/HomePage.tsx
import { useHomeStore } from "../store/useHomeStore";

export function HomePage() {
  const greeting = useHomeStore((state) => state.greeting);
  const setGreeting = useHomeStore((state) => state.setGreeting);

  return (
    <div>
      <p>{greeting}</p>
      <button onClick={() => setGreeting("Hi there!")}>Update</button>
    </div>
  );
}
```

> Always select individual fields with a selector function (`(state) => state.greeting`) rather than returning the whole state object. This prevents unnecessary re-renders when unrelated fields change.

---

## Global Store

A global store holds state that needs to be shared across multiple modules — for example, the currently authenticated user or the active color theme.

```ts
// src/shared/store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
```

The `persist` middleware automatically syncs the store to `localStorage` and rehydrates it on page load. This means the `user` value survives full-page navigations between MPA pages.

Usage from any module:

```tsx
// src/modules/home/pages/HomePage.tsx
import { useAuthStore } from "@/shared/store/useAuthStore";

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      {user ? <p>Welcome, {user.name}</p> : <p>Not logged in</p>}
      <button onClick={logout}>Log out</button>
    </div>
  );
}
```

---

## Async Actions

Zustand does not have a built-in async model — async logic goes inside the action functions directly:

```ts
// src/shared/store/useUserStore.ts
import { create } from "zustand";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      set({ users, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
}));
```

---

## Removing Zustand

1. Uninstall the package:

   ```bash
   npm uninstall zustand
   ```

2. Delete all store files in `src/modules/*/store/` and `src/shared/store/`.

3. Replace store usage in components with your chosen alternative (see below).

---

## Alternatives

| Alternative | Notes |
|---|---|
| **Jotai** | Atomic state model — define independent atoms and compose them. Similar footprint to Zustand. Install `jotai`. |
| **React Context API** | Built into React. Good for low-frequency updates (theme, locale). Avoid for high-frequency state (causes re-renders on all consumers). |
| **TanStack Query** | If most of your state is server state, TanStack Query (react-query) handles fetching, caching, and sync better than a general-purpose store. Install `@tanstack/react-query`. |
| **Valtio** | Proxy-based mutable state. Write mutations directly instead of calling `set`. Install `valtio`. |
