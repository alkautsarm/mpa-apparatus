import { Rocket } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useHomeStore } from "../store/useHomeStore";

export function HomePage() {
  const { count, increment } = useHomeStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Rocket className="size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">mpa-aparatus</h1>
        <p className="text-muted-foreground">
          A modular MPA boilerplate with Vite, React, and TypeScript.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Zustand counter: <span className="font-semibold">{count}</span>
        </p>
        <Button onClick={increment}>Increment</Button>
      </div>

      <nav className="flex gap-4 text-sm">
        <a href="/pages/auth.html" className="text-primary underline-offset-4 hover:underline">
          Auth module →
        </a>
      </nav>
    </main>
  );
}
