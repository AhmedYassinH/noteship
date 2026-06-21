import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set");

  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("hydrates the stored Arabic locale without a server text mismatch", async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    await page.addInitScript(() => window.localStorage.setItem("noteship-lang", "ar"));

    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(
      runtimeErrors.filter(
        (message) =>
          message.includes("Text content does not match server-rendered HTML") ||
          message.includes("Hydration failed"),
      ),
    ).toEqual([]);
  });

  test("primary marketing CTA starts login and does not mention Medium", async ({ page }) => {
    await page.goto("/");

    const primaryCta = page.getByRole("link", { name: /start free/i }).first();
    await expect(primaryCta).toHaveAttribute("href", "/login");
    await expect(page.getByText(/Medium/i)).toHaveCount(0);
  });
});
