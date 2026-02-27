import { test, expect } from "@playwright/test";

test.describe("Chat Navigation", () => {
  test("AI navigates to calendar page and chat panel closes", async ({ page }) => {
    // Start on the garden page (not calendar)
    await page.goto("/garden");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/garden/);

    // Open the chat panel
    await page.getByRole("button", { name: /ask ai/i }).click();
    await expect(
      page.locator("h2:visible", { hasText: /Garden AI/i })
    ).toBeVisible({ timeout: 10000 });

    // Type a navigation request and submit
    const chatInput = page.getByPlaceholder("Ask about your garden...");
    await chatInput.fill("take me to calendar");
    await chatInput.press("Enter");

    // Wait for the page to navigate to /calendar
    await expect(page).toHaveURL(/\/calendar/, { timeout: 30000 });

    // Chat panel should be closed (the visible h2 should be gone)
    await expect(
      page.locator("h2:visible", { hasText: /Garden AI/i })
    ).not.toBeVisible({ timeout: 5000 });

    // Calendar page content should be visible
    await expect(
      page.getByRole("heading", { name: /calendar|planting/i })
    ).toBeVisible();
  });

  test("AI navigates from fullscreen chat and chat becomes small", async ({ page }) => {
    await page.goto("/plants");
    await page.waitForLoadState("networkidle");

    // Open the chat panel
    await page.getByRole("button", { name: /ask ai/i }).click();
    await expect(
      page.locator("h2:visible", { hasText: /Garden AI/i })
    ).toBeVisible({ timeout: 10000 });

    // Toggle to fullscreen
    await page.getByTitle("Fullscreen").click();

    // Verify fullscreen mode is active (the overlay covers the page)
    await expect(page.locator(".absolute.inset-0.z-40")).toBeVisible();

    // Type a navigation request and submit
    const chatInput = page.getByPlaceholder("Ask about your garden...");
    await chatInput.fill("take me to seeds");
    await chatInput.press("Enter");

    // Wait for the page to navigate to /seeds
    await expect(page).toHaveURL(/\/seeds/, { timeout: 30000 });

    // Fullscreen overlay should be gone
    await expect(page.locator(".absolute.inset-0.z-40")).not.toBeVisible({ timeout: 5000 });

    // Chat panel should be closed
    await expect(
      page.locator("h2:visible", { hasText: /Garden AI/i })
    ).not.toBeVisible({ timeout: 5000 });

    // Seeds page content should be visible
    await expect(
      page.getByRole("heading", { name: /seed/i })
    ).toBeVisible();
  });
});
