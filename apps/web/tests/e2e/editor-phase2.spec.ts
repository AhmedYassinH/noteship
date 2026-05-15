import { expect, test, type Page } from "@playwright/test";

const NOTE_URL = process.env.E2E_NOTE_URL;

const clearAndSeedEditor = async (page: Page) => {
  const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("First block");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Second block");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Third block");
  return editor;
};

test.describe("note editor phase2", () => {
  test.skip(
    !process.env.E2E_BASE_URL || !NOTE_URL,
    "E2E_BASE_URL and E2E_NOTE_URL are required for editor phase2 tests",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto(NOTE_URL || "/");
    await expect(page.locator('[data-testid="note-editor-content"] .ProseMirror')).toBeVisible();
  });

  test("supports block insertion below from plus command menu", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);

    await editor.locator("p").first().click();
    await page.getByTestId("editor-side-add-block").click();
    await page.getByTestId("editor-command-h1").click();
    await page.keyboard.type("Inserted heading");
    await expect(editor.locator("h1").first()).toContainText("Inserted heading");
  });

  test("closes plus command menu when clicking a line in the note", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);
    await editor.locator("p").first().click();
    await page.getByTestId("editor-side-add-block").click();
    await expect(page.getByTestId("editor-command-menu")).toBeVisible();
    await editor.locator("p").nth(1).click();
    await expect(page.getByTestId("editor-command-menu")).toBeHidden();
  });

  test("shows drag handle flow and contextual controls", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);

    await editor.locator("p").first().click();
    await page.getByTestId("editor-block-drag-handle").click();
    await expect(page.getByTestId("editor-status-message")).toContainText("Drag");

    await expect(page.getByTestId("editor-toolbar-bold").locator("svg")).toBeVisible();

    await page.getByTestId("editor-side-add-block").click();
    await expect(page.getByTestId("editor-command-menu")).toBeVisible();
    await expect(page.getByTestId("editor-command-h1").locator("svg")).toBeVisible();
    await expect(page.getByTestId("editor-command-paragraph").locator("svg")).toBeVisible();
  });

  test("hides contextual mini toolbar while typing", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();
    await expect(page.getByTestId("editor-toolbar-bold")).toBeVisible();
    await page.keyboard.type("typing");
    await expect(page.getByTestId("editor-toolbar-bold")).toBeHidden();
  });

  test("shows direction and physical alignment controls in contextual toolbar", async ({
    page,
  }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();

    await expect(page.getByTestId("editor-dir-ltr")).toBeVisible();
    await expect(page.getByTestId("editor-dir-rtl")).toBeVisible();
    await expect(page.getByTestId("editor-align-left")).toBeVisible();
    await expect(page.getByTestId("editor-align-center")).toBeVisible();
    await expect(page.getByTestId("editor-align-right")).toBeVisible();
  });

  test("shows placeholder only for empty active block", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await expect(editor.locator(".is-empty")).toHaveAttribute(
      "data-placeholder",
      "Write or type '/'",
    );

    await page.keyboard.type("non-empty block");
    await expect(editor.locator(".is-empty")).toHaveCount(0);
  });

  test("applies direction per block without changing page direction", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    const initialPageDir = await page.evaluate(() => document.documentElement.dir || "ltr");

    await clearAndSeedEditor(page);
    await editor.locator("p").first().click();
    await page.getByTestId("editor-dir-rtl").click();
    await expect(editor.locator("p").first()).toHaveAttribute("data-dir", "rtl");

    await editor.locator("p").nth(1).click();
    await page.getByTestId("editor-dir-ltr").click();
    await expect(editor.locator("p").nth(1)).toHaveAttribute("data-dir", "ltr");
    await expect(editor.locator("p").first()).toHaveAttribute("data-dir", "rtl");

    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dir || "ltr"))
      .toBe(initialPageDir);
  });

  test("keeps side add button outside editor text flow", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();
    await page.keyboard.type("Top line visibility check");

    const metrics = await page.evaluate(() => {
      const handle = document.querySelector(
        '[data-testid="editor-side-add-block"]',
      ) as HTMLElement | null;
      const firstParagraph = document.querySelector(
        '[data-testid="note-editor-content"] .ProseMirror p',
      ) as HTMLElement | null;
      const proseMirror = document.querySelector(
        '[data-testid="note-editor-content"] .ProseMirror',
      ) as HTMLElement | null;
      if (!handle || !firstParagraph || !proseMirror) {
        return null;
      }

      const handleRect = handle.getBoundingClientRect();
      const textRect = firstParagraph.getBoundingClientRect();
      const editorRect = proseMirror.getBoundingClientRect();
      return {
        handleRight: handleRect.right,
        editorLeft: editorRect.left,
        textLeft: textRect.left,
      };
    });

    expect(metrics).not.toBeNull();
    expect((metrics?.handleRight || 0) - (metrics?.editorLeft || 0)).toBeLessThanOrEqual(2);
    expect((metrics?.textLeft || 0) - (metrics?.editorLeft || 0)).toBeGreaterThan(8);
  });

  test("toggles right panel and keeps editor primary", async ({ page }) => {
    const toggle = page.getByTestId("note-side-panel-toggle");
    await expect(toggle).toBeVisible();
    await expect(page.getByTestId("note-side-panel-inline")).toBeVisible();

    await toggle.click();
    await expect(page.getByTestId("note-side-panel-inline")).toBeHidden();

    await toggle.click();
    await expect(page.getByTestId("note-side-panel-inline")).toBeVisible();
  });

  test("updates word and byte metrics while typing", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("metrics check words");

    await expect(page.getByTestId("editor-metric-words")).toContainText("Words:");
    await expect(page.getByTestId("editor-metric-size")).toContainText("Size:");
  });
});
