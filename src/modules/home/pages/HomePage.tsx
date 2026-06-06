import { Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { useHomeStore } from "../store/useHomeStore";

export function HomePage() {
  const { t } = useTranslation("home");
  const { count, increment } = useHomeStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Rocket className="size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground">{t("subheading")}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {t("counter.label")} <span className="font-semibold">{count}</span>
        </p>
        <Button onClick={increment}>{t("counter.increment")}</Button>
      </div>

      <nav className="flex gap-4 text-sm">
        <a href="/auth" className="text-primary underline-offset-4 hover:underline">
          {t("nav.authModule")}
        </a>
      </nav>
    </main>
  );
}
