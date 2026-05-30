import { expect, test } from "@playwright/test";

test.describe("Auth page", () => {
  test("loads and redirects to login", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("renders the login form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible();
  });

  test("navigates to register page", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
  });
});
