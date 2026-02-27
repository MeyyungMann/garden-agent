import { test, expect } from "@playwright/test";

test.describe("Plants CRUD", () => {
  test("can add a new plant", async ({ page }) => {
    await page.goto("/plants");

    // Click add button
    await page.getByRole("button", { name: /add plant/i }).click();

    // Fill form
    await page.getByLabel(/name/i).fill("E2E Test Tomato");
    await page.getByLabel(/variety/i).fill("Cherry");

    // Submit
    await page.getByRole("button", { name: /add plant/i }).last().click();

    // Verify plant appears in list
    await expect(page.getByText("E2E Test Tomato")).toBeVisible({ timeout: 10000 });
  });

  test("can view plant detail", async ({ page }) => {
    await page.goto("/plants");
    const plantLink = page.getByText("E2E Test Tomato").first();
    if (await plantLink.isVisible()) {
      await plantLink.click();
      await expect(page.getByText("E2E Test Tomato")).toBeVisible();
    }
  });

  test("can delete a plant", async ({ page }) => {
    await page.goto("/plants");

    // Click on the test plant to go to its detail page
    const plantLink = page.getByText("E2E Test Tomato").first();
    if (await plantLink.isVisible()) {
      await plantLink.click();

      // Wait for detail page to load
      await expect(page.getByRole("heading", { name: /E2E Test Tomato/i })).toBeVisible();

      // Click the delete button on the detail page
      await page.getByRole("button", { name: /delete/i }).click();

      // Confirm deletion in the dialog
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: /^delete$/i }).click();

      // Wait for delete to process then reload plants page
      await page.waitForTimeout(1000);
      await page.goto("/plants");
      await page.waitForLoadState("networkidle");

      // Verify plant is removed from the list
      await expect(page.getByText("E2E Test Tomato")).toHaveCount(0, { timeout: 10000 });
    }
  });
});
