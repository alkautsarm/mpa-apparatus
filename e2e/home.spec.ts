import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /mpa-apparatus/i })).toBeVisible();
  });

  test("displays the increment button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /increment/i })).toBeVisible();
  });

  test("increments counter when button is clicked", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /increment/i });
    await button.click();
    await expect(page.getByText(/zustand counter: 1/i)).toBeVisible();
  });
});
