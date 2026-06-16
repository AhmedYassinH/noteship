import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set");

  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("primary marketing CTA starts login and does not mention Medium", async ({ page }) => {
    await page.goto("/");

    const primaryCta = page.getByRole("link", { name: /start free/i }).first();
    await expect(primaryCta).toHaveAttribute("href", "/login");
    await expect(page.getByText(/Medium/i)).toHaveCount(0);
  });
});
