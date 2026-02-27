import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("loads the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Plant/i);
  });

  test("sidebar navigates to Plants", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("aside").getByRole("link", { name: /plants/i }).click();
    await expect(page).toHaveURL(/\/plants/);
    await expect(page.getByRole("heading", { name: /plants/i })).toBeVisible();
  });

  test("sidebar navigates to Seeds", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("aside").getByRole("link", { name: /seeds/i }).click();
    await expect(page).toHaveURL(/\/seeds/);
    await expect(page.getByRole("heading", { name: /seed/i })).toBeVisible();
  });

  test("sidebar navigates to Garden", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("aside").getByRole("link", { name: /garden/i }).click();
    await expect(page).toHaveURL(/\/garden/);
    await expect(page.getByRole("heading", { name: /garden|location/i })).toBeVisible();
  });

  test("sidebar navigates to Calendar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("aside").getByRole("link", { name: /calendar/i }).click();
    await expect(page).toHaveURL(/\/calendar/);
    await expect(page.getByRole("heading", { name: /calendar|planting/i })).toBeVisible();
  });

  test("sidebar navigates back to Dashboard", async ({ page }) => {
    await page.goto("/plants");
    await page.waitForLoadState("networkidle");
    await page.locator("aside").getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("chat button opens chat panel", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /ask ai/i }).click();
    // The Sheet has a sr-only title, so look for the visible h2 inside the panel
    await expect(
      page.locator("h2:visible", { hasText: /Garden AI/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("full navigation flow through all pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");

    const sidebar = page.locator("aside");

    await sidebar.getByRole("link", { name: /plants/i }).click();
    await expect(page).toHaveURL(/\/plants/);

    await sidebar.getByRole("link", { name: /seeds/i }).click();
    await expect(page).toHaveURL(/\/seeds/);

    await sidebar.getByRole("link", { name: /garden/i }).click();
    await expect(page).toHaveURL(/\/garden/);

    await sidebar.getByRole("link", { name: /calendar/i }).click();
    await expect(page).toHaveURL(/\/calendar/);

    await sidebar.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL("/");
  });
});
