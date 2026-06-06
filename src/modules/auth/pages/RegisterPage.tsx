import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { z } from "zod";
import { i18next } from "@/shared/lib/i18n";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useAuthStore } from "../store/useAuthStore";

function buildRegisterSchema() {
  return z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: i18next.t("auth:validation.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const { t } = useTranslation("auth");
  const [, navigate] = useLocation();
  const { isLoading, setLoading, setError } = useAuthStore();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(buildRegisterSchema()),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  function onSubmit(_values: RegisterFormValues) {
    setLoading(true);
    setError(null);
    // TODO: replace with real registration call
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">{t("register.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("register.subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("fields.emailPlaceholder")}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("fields.passwordPlaceholder")}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("fields.passwordPlaceholder")}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("register.submitting") : t("register.submit")}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("register.login")}
          </button>
        </p>
      </div>
    </main>
  );
}
