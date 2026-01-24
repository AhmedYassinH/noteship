# Playwright E2E

## Required flows (MVP)

Based on `docs/technical/detailed/16-testing-and-quality-strategy.md`:

1. Login/signup
2. Create note
3. Semantic search returns note
4. Connect provider (mock/sandbox)
5. Schedule publish and see status

These are the only required frontend tests for MVP.

## Stability rules

- Use data-testid for selectors.
- Avoid text-only selectors where copy changes by locale.
- Prefer deterministic fixtures and seeded data.
- Do not rely on external vendor APIs in E2E.

## Preferred mocking order (least effort first)

1. Playwright route interception for browser-visible calls.
2. Backend sandbox or stub server for server-initiated vendor calls.
3. Feature flags to force mock integrations in E2E.

## Example: route mocking + data-testid

Add a stable test id in UI:

```tsx
<button data-testid="publish-button">Publish</button>
```

Mock a network call and use the test id in Playwright:

```ts
await page.route("**/api/integrations/linkedin/**", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ connected: true }),
  });
});

await page.getByTestId("publish-button").click();
```

## Flake control

- Keep timeouts explicit and minimal.
- Avoid waiting on animations; wait on stable UI state.
- Reduce network variance by stubbing non-critical calls.

## Suggested commands (recommended when tests exist)

- `pnpm --filter @noteship/web test:e2e`

## Local setup

- `E2E_BASE_URL` controls the base URL (defaults to `http://localhost:3000`).
- `pnpm --filter @noteship/web test` skips unless `RUN_E2E=1`.
- Use `RUN_E2E=1 pnpm --filter @noteship/web test` or `pnpm --filter @noteship/web test:e2e`.
