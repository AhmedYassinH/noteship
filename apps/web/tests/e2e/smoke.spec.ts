import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set");

  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
