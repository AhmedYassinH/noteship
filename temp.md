# Noteship Execution Status (as of 2026-01-26)

This file tracks what is done vs what remains from the agreed plan.

## Completed

- **Docs alignment**
  - HLD/LLD and relevant frontend/API/brand docs reviewed and followed.

- **Uploads endpoint + storage entitlement enforcement**
  - Extended `POST /notes/{noteId}/uploads` to accept `sizeBytes` and enforce `max_storage_mb` capacity.
  - Added usage reservation on upload init (`storageUsedMb` increments) via `assertCapacityEntitlement` + `incrementUsageByAmount`.
  - Response now returns `artifactId` and `publicUrl`.
  - Files updated:
    - `packages/domain/src/schemas/api/notes.ts`
    - `apps/api/src/use-cases/entitlements.ts`
    - `apps/api/src/use-cases/notes.ts`
    - `apps/api/src/handlers/notes/upload.ts`
    - `apps/api/src/adapters/dynamodb/usage.ts`

- **Content session cookies (CloudFront signed cookies)**
  - Added `POST /content/session` to issue signed cookies scoped to `users/{userId}/*`.
  - Added CloudFront signer env wiring in API runtime and infra.
  - Web app calls `/content/session` on dashboard load.
  - Files updated:
    - `apps/api/src/handlers/content/session.ts`
    - `packages/domain/src/schemas/api/content.ts`
    - `packages/domain/src/schemas/api/index.ts`
    - `apps/api/src/runtime/deps.ts`
    - `packages/infra/src/stacks/api.ts`
    - `apps/web/lib/api/client.ts`
    - `apps/web/lib/api/notes.ts`
    - `apps/web/components/dashboard/DashboardShell.tsx`
    - `.env.example`
    - `docs/technical/detailed/11-api-design-and-contracts.md`
    - `docs/technical/deployment.md`

- **TipTap editor (MVP)**
  - TipTap React editor integrated for notes with Markdown serialization (canonical storage remains Markdown).
  - Editor supports headings, lists, quotes, code blocks, inline formatting.
  - Placeholder and RTL/LTR direction are supported.
  - Files updated:
    - `apps/web/components/dashboard/NoteEditor.tsx`
    - `apps/web/components/dashboard/EditorToolbar.tsx`
    - `apps/web/app/dashboard/notes/[noteId]/page.tsx`
    - `apps/web/app/dashboard/notes/page.tsx`
    - `apps/web/components/dashboard/DashboardShell.tsx`
    - `apps/web/app/dashboard/dashboard.module.css`
    - `apps/web/package.json`

- **Artifact uploads wired into editor**
  - Paste, drag/drop, and file picker uploads supported.
  - Images inserted as TipTap image nodes; other files inserted as links to `publicUrl`.
  - Files updated:
    - `apps/web/components/dashboard/NoteEditor.tsx`
    - `apps/web/data/dashboard.ts`

- **Entitlements UX (hide/disable + upsell)**
  - Added entitlements snapshot in dashboard context.
  - Scheduling disabled for Free with upsell messaging across note editor, drafts, and publishing.
  - Files updated:
    - `apps/web/lib/entitlements.ts`
    - `apps/web/components/dashboard/DashboardShell.tsx`
    - `apps/web/app/dashboard/notes/[noteId]/page.tsx`
    - `apps/web/app/dashboard/drafts/page.tsx`
    - `apps/web/app/dashboard/publishing/page.tsx`
    - `apps/web/data/dashboard.ts`
    - `apps/web/app/dashboard/dashboard.module.css`

- **Dashboard visual polish + layout alignment**
  - Refined typography, spacing rhythm, and component styling (Notion + Linear feel).
  - Improved hover, focus, and table-row affordances.
  - Files updated:
    - `apps/web/app/dashboard/dashboard.module.css`

- **Routing/loading/error/empty states + a11y/RTL sweep**
  - Added loading/error states with retry actions across dashboard routes (overview, notes, drafts, publishing, integrations, search, note detail).
  - Added `lang` attributes on dashboard pages, `aria-*` on nav, search, toolbar buttons, and save/upload status.
  - Fixed Arabic/English copy encoding and added missing localized labels (navigation, search results, billing labels).
  - Files updated:
    - `apps/web/app/dashboard/page.tsx`
    - `apps/web/app/dashboard/notes/page.tsx`
    - `apps/web/app/dashboard/notes/[noteId]/page.tsx`
    - `apps/web/app/dashboard/drafts/page.tsx`
    - `apps/web/app/dashboard/publishing/page.tsx`
    - `apps/web/app/dashboard/integrations/page.tsx`
    - `apps/web/app/dashboard/search/page.tsx`
    - `apps/web/app/dashboard/billing/page.tsx`
    - `apps/web/app/dashboard/settings/page.tsx`
    - `apps/web/components/dashboard/DashboardShell.tsx`
    - `apps/web/components/dashboard/NoteEditor.tsx`
    - `apps/web/components/dashboard/EditorToolbar.tsx`
    - `apps/web/app/dashboard/dashboard.module.css`
    - `apps/web/data/dashboard.ts`

- **Prototype audit -> route mapping (verification)**
  - Compared `archive/legacy-ui` UI surfaces to `apps/web` dashboard.
  - Summary saved in `archive-mapping.md`.

- **Formatting**
  - `pnpm prettier --write .` run after changes.

- **Build + install fixes**
  - Swapped `@tiptap/extension-markdown` for `tiptap-markdown` to allow installs; adjusted editor config.
  - Guarded CloudFront signed cookie values before building response cookies.
  - Wrapped dashboard shell in Suspense to satisfy `useSearchParams` build requirement.

- **Docs + skills alignment**
  - Updated HLD/LLD for content session cookies, upload contract, and storage reservation notes.
  - Updated skills guidance for API/Web/Infra to reflect content session and upload entitlements.

- **CI/CD dev deploy workflow**
  - CI no longer runs format; dev deploy runs on main after lint/build/test.
  - Added deploy steps for Core/API/Workers/Web and web asset sync/invalidation.

- **Infra tooling**
  - Ignored CDK/CloudFormation artifacts and build JS in `.gitignore`.
  - Infra scripts load `.env` via `NODE_OPTIONS=--env-file=../../.env` (cross-platform).

## Still Needed (from the plan)

1. **Targeted E2E smoke checks (optional but recommended)**
   - Validate: sign-in -> create note -> edit -> upload artifact -> draft -> publish/schedule.

## Open Decisions / Follow-ups

- **CloudFront cookie scope + domain**
  - Confirm `NOTESHIP_CONTENT_DOMAIN` and `NOTESHIP_CONTENT_COOKIE_DOMAIN` values for the target environment.
  - Ensure CORS origin for API is set via `NOTESHIP_WEB_ORIGIN`.

- **Storage reservation accuracy**
  - Upload init reserves `storageUsedMb` immediately; consider adding a reconcile step (`/complete`) later.

- **TipTap Markdown compatibility**
  - If Markdown parse/serialize drift is observed, consider explicitly mapping nodes and/or a stricter Markdown serializer.
