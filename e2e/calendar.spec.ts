import { test, expect } from "@playwright/test";

test.describe("Calendar", () => {
  test("loads calendar page", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: /calendar|planting/i })).toBeVisible();
  });

  test("shows year selector or current year", async ({ page }) => {
    await page.goto("/calendar");
    const currentYear = new Date().getFullYear().toString();
    await expect(page.getByText(currentYear)).toBeVisible();
  });
});
