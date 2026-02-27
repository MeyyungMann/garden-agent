import { test, expect } from "@playwright/test";

test.describe("Seeds", () => {
  test("loads seed inventory page", async ({ page }) => {
    await page.goto("/seeds");
    await expect(page.getByRole("heading", { name: /seed/i })).toBeVisible();
  });

  test("shows add seed button", async ({ page }) => {
    await page.goto("/seeds");
    await expect(page.getByRole("button", { name: /add seed/i })).toBeVisible();
  });
});
