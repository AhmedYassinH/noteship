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

  test("moves a block downward using the rail drag handle", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);
    const firstBlock = editor.locator("p").first();
    const thirdBlock = editor.locator("p").nth(2);

    await firstBlock.hover();
    const dragHandle = page.getByTestId("editor-block-drag-handle");
    const targetBox = await thirdBlock.boundingBox();
    expect(targetBox).not.toBeNull();
    if (!targetBox) return;

    await dragHandle.dragTo(thirdBlock, {
      targetPosition: { x: 24, y: Math.max(1, targetBox.height - 2) },
    });

    await expect(editor.locator("p").nth(0)).toHaveText("Second block");
    await expect(editor.locator("p").nth(1)).toHaveText("Third block");
    await expect(editor.locator("p").nth(2)).toHaveText("First block");
  });

  test("keeps the insert menu clear of the editor footer at the last block", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);
    await editor.locator("p").nth(2).click();
    for (let index = 0; index < 18; index += 1) {
      await page.keyboard.press("Enter");
      await page.keyboard.type(`Trailing block ${index + 1}`);
    }

    const blocks = editor.locator("p");
    const blockCount = await blocks.count();
    const lastBlock = blocks.nth(blockCount - 1);
    await lastBlock.scrollIntoViewIfNeeded();
    await lastBlock.hover();
    await page.getByTestId("editor-side-add-block").click();

    const menu = page.getByTestId("editor-command-menu");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("data-placement", "top");

    const geometry = await page.evaluate(() => {
      const commandMenu = document.querySelector(
        '[data-testid="editor-command-menu"]',
      ) as HTMLElement | null;
      const footer = document.querySelector(
        '[data-testid="editor-metrics-footer"]',
      ) as HTMLElement | null;
      if (!commandMenu || !footer) return null;
      const menuRect = commandMenu.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        footerTop: footerRect.top,
        menuBottom: menuRect.bottom,
        menuTop: menuRect.top,
        viewportHeight: window.innerHeight,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.menuTop || 0).toBeGreaterThanOrEqual(8);
    expect(geometry?.menuBottom || 0).toBeLessThanOrEqual((geometry?.footerTop || 0) - 4);
    expect(geometry?.menuBottom || 0).toBeLessThanOrEqual((geometry?.viewportHeight || 0) - 8);
  });

  test("completes an image attachment without unmounting the editor DOM", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.route("**/notes/*/uploads", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "https://uploads.noteship.test/image.png",
          s3Key: "users/test/notes/test/artifacts/test-image.png",
          artifactId: "test-image",
          publicUrl: "https://content.noteship.test/test-image.png",
          expiresAt: new Date(Date.now() + 180_000).toISOString(),
        }),
      });
    });
    await page.route("https://uploads.noteship.test/**", async (route) => {
      await route.fulfill({ status: 200 });
    });
    await page.route("**/notes/*/uploads/*/complete", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.route("**/content/session", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    const editor = await clearAndSeedEditor(page);
    await editor.locator("p").nth(2).hover();
    await page.getByTestId("editor-side-add-block").click();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("editor-command-image-attach").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    });

    await expect(editor.locator("div[data-type='attachment-block']")).toBeVisible();
    await expect(page.getByTestId("note-editor-content")).toBeVisible();
    expect(pageErrors.filter((message) => message.includes("removeChild"))).toEqual([]);
  });

  test("keeps block controls visible while crossing from text into the rail", async ({ page }) => {
    const editor = await clearAndSeedEditor(page);
    const firstBlock = editor.locator("p").first();
    await firstBlock.hover();

    const addButton = page.getByTestId("editor-side-add-block");
    await expect(addButton).toBeVisible();

    const blockBox = await firstBlock.boundingBox();
    const buttonBox = await addButton.boundingBox();
    expect(blockBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    if (!blockBox || !buttonBox) return;

    const direction = await page.evaluate(() => document.documentElement.dir || "ltr");
    const startX = direction === "rtl" ? blockBox.x + blockBox.width - 4 : blockBox.x + 4;
    await page.mouse.move(startX, blockBox.y + blockBox.height / 2);
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, {
      steps: 8,
    });

    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page.getByTestId("editor-command-menu")).toBeVisible();
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

  test("keeps block controls inside the workspace rail and clear of text", async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor-content"] .ProseMirror');
    await editor.click();
    await page.keyboard.type("Top line visibility check");
    await page.waitForTimeout(750);

    const metrics = await page.evaluate(() => {
      const controls = document.querySelector(
        '[data-editor-block-controls="true"]',
      ) as HTMLElement | null;
      const firstParagraph = document.querySelector(
        '[data-testid="note-editor-content"] .ProseMirror p',
      ) as HTMLElement | null;
      const proseMirror = document.querySelector(
        '[data-testid="note-editor-content"] .ProseMirror',
      ) as HTMLElement | null;
      const workspace = document.querySelector(
        '[data-testid="note-editor-workspace"]',
      ) as HTMLElement | null;
      if (!controls || !firstParagraph || !proseMirror || !workspace) {
        return null;
      }

      const controlsRect = controls.getBoundingClientRect();
      const textRect = firstParagraph.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();
      return {
        controlsEnd:
          document.documentElement.dir === "rtl" ? controlsRect.left : controlsRect.right,
        controlsStart:
          document.documentElement.dir === "rtl" ? controlsRect.right : controlsRect.left,
        textStart: document.documentElement.dir === "rtl" ? textRect.right : textRect.left,
        workspaceEnd:
          document.documentElement.dir === "rtl" ? workspaceRect.left : workspaceRect.right,
        workspaceStart:
          document.documentElement.dir === "rtl" ? workspaceRect.right : workspaceRect.left,
      };
    });

    expect(metrics).not.toBeNull();
    const direction = await page.evaluate(() => document.documentElement.dir || "ltr");
    if (direction === "rtl") {
      expect(metrics?.controlsEnd || 0).toBeGreaterThan((metrics?.textStart || 0) + 8);
      expect(metrics?.controlsStart || 0).toBeLessThanOrEqual(metrics?.workspaceStart || 0);
    } else {
      expect(metrics?.controlsEnd || 0).toBeLessThan((metrics?.textStart || 0) - 8);
      expect(metrics?.controlsStart || 0).toBeGreaterThanOrEqual(metrics?.workspaceStart || 0);
    }
  });

  test("keeps the metrics footer outside the scrolling writing surface", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.reload();

    const geometry = await page.evaluate(() => {
      const workspace = document.querySelector(
        '[data-testid="note-editor-workspace"]',
      ) as HTMLElement | null;
      const scrollRegion = document.querySelector(
        '[data-testid="note-editor-scroll-region"]',
      ) as HTMLElement | null;
      const footer = document.querySelector(
        '[data-testid="editor-metrics-footer"]',
      ) as HTMLElement | null;
      if (!workspace || !scrollRegion || !footer) return null;
      const workspaceRect = workspace.getBoundingClientRect();
      const scrollRect = scrollRegion.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        footerBottom: footerRect.bottom,
        footerTop: footerRect.top,
        scrollBottom: scrollRect.bottom,
        workspaceBottom: workspaceRect.bottom,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.scrollBottom || 0).toBeLessThanOrEqual((geometry?.footerTop || 0) + 1);
    expect(geometry?.footerBottom || 0).toBeLessThanOrEqual((geometry?.workspaceBottom || 0) + 1);
  });

  test("restores and persists the compact dashboard sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 850 });
    await page.reload();

    const sidebar = page.getByTestId("dashboard-sidebar");
    await expect(sidebar).toBeVisible();
    await page.getByTestId("dashboard-sidebar-toggle").click();
    await expect(sidebar).toHaveCSS("width", "80px");

    await page.reload();
    await expect(sidebar).toHaveCSS("width", "80px");
    await page.getByTestId("dashboard-sidebar-toggle").click();
    await expect(sidebar).not.toHaveCSS("width", "80px");
  });

  test("persists Drafts visibility across inline and drawer layouts", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 850 });
    await page.evaluate(() => window.localStorage.removeItem("noteship-drafts-panel-open"));
    await page.reload();
    const toggle = page.getByTestId("note-side-panel-toggle");
    await expect(toggle).toBeVisible();
    await expect(page.getByTestId("note-side-panel-inline")).toBeVisible();

    await page.getByTestId("note-drafts-close").click();
    await expect(page.getByTestId("note-side-panel-inline")).toBeHidden();
    await page.reload();
    await expect(page.getByTestId("note-side-panel-inline")).toBeHidden();

    await toggle.click();
    await expect(page.getByTestId("note-side-panel-inline")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("note-side-panel-inline")).toBeVisible();

    await page.setViewportSize({ width: 768, height: 900 });
    await page.reload();
    await expect(page.getByTestId("note-side-panel-overlay")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("note-side-panel-overlay")).toBeHidden();
    await page.reload();
    await expect(page.getByTestId("note-side-panel-overlay")).toBeHidden();
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
