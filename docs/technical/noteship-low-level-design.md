# Noteship — Low-Level Design & Execution Guide (LLD)

**Document purpose:** Translate the HLD into concrete, buildable engineering decisions: data models, API contracts, async jobs, semantic search, billing, entitlements, testing, and coding conventions.

**Build bias:** MVP-first, readable code, strict TypeScript, minimal ops, serverless on AWS, external managed services allowed when cheaper/better.

---

## 0) Decisions locked for MVP

- **Frontend:** Next.js (single app: landing + dashboard)
- **Backend:** API Gateway + Lambda (Node.js/TypeScript)
- **Canonical content:** S3 markdown notes + artifacts (versioned)
- **Metadata/state:** DynamoDB
- **Vector DB:** Managed external (e.g., Qdrant Cloud) for semantic search
- **Async jobs:** SQS + worker Lambdas (+ DLQ)
- **Billing:** Stripe
- **Entitlements:** Derived from internal plan config; enforced server-side
- **Editor:** TipTap (ProseMirror) -> serialize to Markdown for storage

Details: see `docs/technical/index.md`.

---

## 1) Repository structure (monorepo) + conventions

### 1.1 Monorepo tooling

- **pnpm workspaces** + **turborepo** (or Nx; prefer turbo for simplicity)
- **TypeScript:** strict mode everywhere
- **Lint/format:** ESLint + Prettier
- **Prettier command:** `pnpm prettier --write .` (run before PRs/commits; applies to apps, packages, and docs)
- **Styling (web):** Tailwind CSS + shadcn/ui primitives; generate components into `apps/web/components/ui` and keep app-specific styles minimal.
- **Validation:** Zod for request/response schemas + shared types
- **Testing:** Vitest/Jest (unit/integration), Playwright (E2E)

Details: see `docs/technical/index.md`.

### 1.2 Suggested folder layout

```
/apps
  /web                 # Next.js app
  /api                 # API Gateway Lambdas (handlers)
  /workers             # Async worker Lambdas (SQS consumers, scheduled)
/packages
  /domain              # Entities, feature keys, shared types, zod schemas
  /connectors          # Vendor connectors (LinkedIn, Medium, future)
  /infra               # CDK stacks + constructs
  /utils               # cross-cutting utilities (logging, ids, time)
  # Locale copy (public pages)
apps/web/data          # Localized copy per surface (e.g., landing) with {en, ar} payloads
```

### 1.3 Code architecture rules

- Handlers are thin: parse/validate, auth, call use-case, return response.
- Use-cases contain business logic and depend on **interfaces**, not AWS SDK.
- Adapters implement interfaces (DynamoDB/S3/Stripe/Qdrant).
- DynamoDB adapters must map/validate items via `@noteship/domain` schemas and mappers in `packages/domain/src/schemas`.
- Keep DI simple: explicit `deps` object with module-level caching for expensive clients.

---

## 2) Data architecture

Details: see `docs/technical/index.md`.

### 2.1 S3 layout (canonical content)

Bucket: `noteship-content-{env}` (versioning enabled)

Paths:

```
users/{userId}/notes/{noteId}/note.md
users/{userId}/notes/{noteId}/artifacts/{artifactId}.{ext}
users/{userId}/posts/{provider}/{postId}/draft.md
users/{userId}/posts/{provider}/{postId}/payload.json
```

Notes:

- `note.md` is the canonical representation.
- Artifacts are references (images, exports, generated drafts, etc.)
- Use stable IDs and never rely on raw filenames.

### 2.2 DynamoDB tables (MVP)

You can do single-table later. For MVP, use **multiple tables** to stay readable.

#### Table: `Users`

Partition key: `userId`
Attributes:

- `email`, `name`, `createdAt`
- `planId`, `subscriptionStatus`, `currentPeriodEnd` (denormalized convenience)
- `currentPeriodStart` (ISO, from Stripe `current_period_start`)
- `stripeCustomerId` (optional)

#### Table: `Notes`

Partition key: `userId`
Sort key: `noteId`
Attributes:

- `noteId`, `title`, `tags[]`
- `s3Key` (to note.md), `contentHash`, `updatedAt`, `createdAt`
- `embeddingStatus` (pending|ready|failed)
- `embeddingVersion` (hash or S3 versionId)
- `editorFormat` (tiptap/markdown) (optional; default markdown)
  Indexes:
- GSI1 (ByUpdatedAt): `userId` (PK), `updatedAt` (SK, ISO string) for listing latest notes
- Optional tag index later (avoid premature complexity)

#### Table: `Posts`

Partition key: `userId`
Sort key: `postId`
Attributes:

- `postId`, `noteId` (source)
- `provider` (linkedin|medium)
- `status` (draft|queued|scheduled|publishing|published|failed)
- `scheduledAt` (ISO) nullable
- `publishedAt` (ISO) nullable
- `contentS3Key` (draft.md)
- `error` (lastErrorCode/message) nullable
- `createdAt`, `updatedAt`
  Indexes:
- GSI1 (ByStatusUpdatedAt): `userId` (PK), `statusUpdatedAt` (SK, `${status}#${updatedAt}`)
- GSI2 (BySchedule): `scheduleStatus` (PK, value `scheduled`), `scheduledAt` (SK, ISO string) (for scheduler dispatcher)

#### Table: `IntegrationAccounts`

Partition key: `userId`
Sort key: `providerAccountId` (e.g., `${provider}#${accountId}`)
Attributes:

- `provider` (linkedin|medium|...)
- `accountId` (vendor account identifier/URN)
- `status` (connected|revoked|error)
- `scopes[]`, `connectedAt`, `updatedAt`
- Encrypted credentials fields (ciphertext + iv + tag + alg + keyVersion)
- Credential timestamps (`credentialsUpdatedAt`, `tokenExpiresAt`, `refreshTokenExpiresAt`)
- provider metadata (e.g., LinkedIn person URN)

#### Table: `Usage`

Partition key: `userId`
Sort key: `periodStart` (ISO date; use Stripe `current_period_start`)
Attributes:

- `aiGenerationsUsed`
- `scheduledPostsUsed`
- `postsPublished` (optional; analytics)
- `storageUsedMb` (optional)
- `updatedAt`

Notes:

- `storageUsedMb` is reserved on upload init to enforce `max_storage_mb` entitlements.
- Consider a later reconcile step on upload completion to adjust for failed uploads.

#### Table: `Jobs` (optional, recommended)

If you want observable job history beyond SQS:
Partition key: `userId`
Sort key: `jobId`
Attributes:

- `type` (EMBED_NOTE|PUBLISH_POST|IMPORT_NOTE)
- `status` (queued|running|succeeded|failed)
- `payload` (small), `createdAt`, `updatedAt`

> You can skip Jobs table initially if you log well and rely on DLQ; add later when needed.

#### DynamoDB capacity + recovery (MVP defaults)

- **Capacity mode:** Provisioned with fixed low capacities to keep total provisioned RCUs/WCUs within the Always Free tier (25/25) and avoid DynamoDB auto scaling alarm sprawl in low-traffic environments. Re-evaluate for production and either re-enable auto scaling or move to on-demand capacity.
- **PITR:** Disabled in MVP for cost control; enable for production per the production checklist.

---

## 3) Vector DB design (Qdrant-like model)

Details: see `docs/technical/index.md`.

### 3.1 Collection

Collection name: `noteship_notes_{env}`

### 3.2 Vector record payload

Each chunk is a point:

- `id`: `${userId}:${noteId}:${version}:${chunkIndex}`
- `vector`: embedding array
- `payload`:
  - `userId`
  - `noteId`
  - `version` (embeddingVersion)
  - `chunkIndex`
  - optional `blockId` (future)
  - optional `title` (duplicate for better ranking; optional)
  - `createdAt`

### 3.3 Filters

Always filter by `userId` (multi-tenant isolation).

### 3.4 Re-embedding strategy

- Compute `embeddingVersion` as content hash of normalized text OR use S3 `versionId`.
- On note update:
  - If version unchanged -> skip embedding job
  - If changed -> embed and upsert new points; delete old version points for note

---

## 4) Embedding + semantic search design

Details: see `docs/technical/index.md`.

### 4.1 Text extraction + normalization

Input sources:

- `note.md` (canonical)
- Exclude non-text artifacts by default

Normalization steps:

- Strip or downweight URLs, boilerplate
- Convert markdown to plain text with headings preserved
- Optional: include title and tags as prefix

### 4.2 Chunking

- Chunk size target: **300–800 tokens**
- Overlap: **10–15%**
- Chunk at paragraph boundaries when possible

### 4.3 Embedding workflow (async)

SQS job type: `EMBED_NOTE`

Payload:

```json
{ "userId": "u1", "noteId": "n1", "version": "v123", "s3Key": "users/u1/notes/n1/note.md" }
```

Worker steps:

1. Load markdown from S3
2. Normalize to text
3. Chunk
4. Embed each chunk (batch requests when possible)
5. Upsert vectors to Vector DB
6. Update DynamoDB note status: `embeddingStatus=ready`, `embeddingVersion=version`

Retries:

- transient network errors: retry
- rate limits: retry with backoff
- permanent errors: set `embeddingStatus=failed` and log

### 4.4 Search workflow (sync API)

Endpoint receives query:

1. Validate query length
2. Embed query
3. Vector search (topK)
4. Aggregate by noteId (e.g., max score per note)
5. Fetch note metadata from DynamoDB
6. Return list of notes + preview snippet (and optional chunkIndex), sorted by score

Return shape (conceptual):

```json
{
  "results": [
    {
      "noteId": "n1",
      "title": "Pricing objections",
      "score": 0.84,
      "preview": "Snippet text...",
      "highlights": [{ "chunkIndex": 2 }]
    }
  ]
}
```

---

## 5) API design (REST, API Gateway)

Details: see `docs/technical/index.md`.

### 5.1 Auth

- JWT-based auth (Auth0). Use Universal Login (hosted UI) with Google SSO + passwordless email.
- API Gateway JWT authorizer validates tokens (issuer + audience) and injects user identity.
- All endpoints assume `userId` from JWT subject.

### 5.2 Endpoints (MVP)

#### Auth / Users

- `GET /me` get or create current user

#### Notes

- `GET /notes?cursor=&limit=` list notes (sorted by updatedAt)
- `POST /notes` create note (title, content in markdown)
- `GET /notes/{noteId}` get note metadata + content (via presigned S3 URL)
- `PUT /notes/{noteId}` update note (markdown)
- `DELETE /notes/{noteId}` delete note (soft delete recommended)

#### Attachments

- `POST /notes/{noteId}/uploads` get presigned upload URL
  - Body: `{ filename, contentType, sizeBytes, intent, artifactType }`
  - `intent`: `embed | attach`
  - `artifactType`: `image | pdf`
  - Limits:
    - image (embed/attach): max 5 MB
    - pdf (embed): max 1 MB
    - pdf (attach): max 5 MB
    - video upload: not supported (embed external link instead)
  - Response: `{ uploadUrl, s3Key, artifactId, publicUrl }`

#### Content access

- `POST /content/session` issue CloudFront signed cookies (user-scoped)
  - Response: `{ ok: true }`
  - Cookies are issued as `HttpOnly; Secure; SameSite=None`.
  - Cookie `Domain` uses `NOTESHIP_CONTENT_COOKIE_DOMAIN` when set. If omitted for a custom content subdomain, the API derives the parent domain so sibling API/web/content hosts can share the CloudFront cookies. Localhost, IPs, CloudFront default domains, and AWS service domains remain host-only.
  - User-folder sessions use CloudFront custom-policy cookies (`CloudFront-Policy`) so the policy can authorize `users/{userId}/*`.
  - Session TTL is configurable via optional `NOTESHIP_CONTENT_SESSION_TTL_SECONDS` (default: 43200).
  - Content URLs use `NOTESHIP_CONTENT_CUSTOM_DOMAIN` and URL-encode path segments in browser-facing URLs/policies while preserving the canonical S3 key.

#### Search

- `POST /search` semantic search across notes (body: `{ query, limit? }`)

#### Generation

- `POST /notes/{noteId}/drafts` (tone, provider) returns draft(s)

#### Posts

- `POST /posts` create post from draft (provider, content)
- `PUT /posts/{postId}/draft` update persisted draft artifact content
- `POST /posts/{postId}/publish` publish now (mode: `single` or `overflow_comments`)
- `POST /posts/{postId}/schedule` schedule at time (`timezone` optional; normalized to UTC for execution)
- `POST /posts/{postId}/cancel` cancel scheduled
- `GET /posts?status=` list posts

#### Integrations

- `GET /integrations` list connected accounts
- `POST /integrations/{provider}/connect` start OAuth
- `POST /integrations/{provider}/callback/finalize` finalize OAuth callback from authenticated frontend route
- `POST /integrations/{provider}/disconnect` revoke

#### Billing

- `POST /billing/checkout` create Stripe checkout session
- `POST /billing/portal` create customer portal session
- `POST /billing/webhook` Stripe webhook endpoint (signature verified)

### 5.3 Request/response schemas

- Define Zod schemas in `/packages/domain/schemas/*`
- Generate TS types from Zod where needed
- Validate at handler boundary; use-cases expect typed input

---

## 6) Async jobs design (SQS)

Details: see `docs/technical/index.md`.

### 6.1 Job types

- `EMBED_NOTE`
- `PUBLISH_POST` (used for immediate and scheduled publishes)
- `IMPORT_NOTE` (future)

### 6.2 Payload envelope

Standardize:

```json
{
  "jobId": "uuid",
  "type": "PUBLISH_POST",
  "userId": "u1",
  "createdAt": "2026-01-21T00:00:00Z",
  "payload": {}
}
```

### 6.3 Idempotency

- Every publish job must be idempotent:
  - Use `postId` as idempotency key
  - In worker: if `status=published`, do nothing
  - If vendor supports idempotency tokens, use them

### 6.4 Scheduling approach

Decision (MVP):

- Use a scheduled dispatcher worker (every minute) that queries due posts by `scheduledAt` via GSI2 and enqueues `PUBLISH_POST`.
- Defer per-post EventBridge Scheduler until scale warrants it.

---

## 7) Connector / integration LLD

Details: see `docs/technical/index.md`.

### 7.1 Connector interface (TypeScript)

Conceptual:

- `publishPost(input): Promise<PublishResult>`
- `startOAuth(): URL`
- `handleOAuthCallback(code): IntegrationAccount`
- `refreshTokenIfNeeded(account): IntegrationAccount`
- `disconnect(account): void`

### 7.2 LinkedIn + Medium specifics (MVP)

- Store per-user integration account
- LinkedIn OAuth uses `openid profile w_member_social`; resolve member identity via `/v2/userinfo` (`sub`)
- Worker publishes using stored token
- LinkedIn media publish supports:
  - text-only
  - text + images (max from `LINKEDIN_MAX_IMAGES_PER_POST`, capped at 20)
  - text + one PDF
- API validates media before queueing and writes a publish payload snapshot to `users/{userId}/posts/{provider}/{postId}/payload.json`
- Worker uploads LinkedIn media synchronously in-job, then creates the post (no media status polling requirement)
- Handle rate limits with retries/backoff
- Map internal post format to vendor payload

### 7.3 Import connectors (future)

- Webhook ingestion endpoint (preferred)
- Polling job (fallback)
- Normalize vendor payload -> internal note markdown
- Trigger embedding job automatically

---

## 8) Billing + plans + entitlements

Details: see `docs/technical/index.md`.

### 8.1 Stripe objects

- Product: Noteship
- Prices: Free (internal only), Pro Monthly/Yearly
- Checkout for upgrades, Customer Portal for management

### 8.2 Stripe webhooks (required)

Handle at minimum:

- `checkout.session.completed`
- `customer.subscription.created/updated/deleted`
- `invoice.payment_failed` (optional but useful)

Webhook handler rules:

- Verify signature
- Update `Users` subscription fields (denormalized)
- Persist subscription record if you choose (optional)

### 8.3 Plan -> entitlements mapping (MVP)

- Keep entitlements in code config (JSON/TS) for MVP to avoid admin tooling.
- Types:
  - boolean: `scheduled_publish`
  - quota: `ai_generations_per_month`
  - capacity: `max_notes`

### 8.4 Enforcement

- **Backend always enforces**:
  - before generation: check quota
  - before scheduling: check boolean entitlement
  - before creating note: check capacity limit
- Frontend uses entitlements to hide/disable and upsell.

### 8.5 Usage counters

- Increment usage on success:
  - AI generation success ? `aiGenerationsUsed += 1`
  - Schedule creation success ? `scheduledPostsUsed += 1`
  - Publish success ? `postsPublished += 1` (optional analytics)
- Usage counters are tracked per Stripe billing cycle. Use `current_period_start` as the `periodStart` key to align with billing.

---

## 9) Security implementation rules

Details: see `docs/technical/index.md`.

- Vendor tokens must never reach frontend.
- Store tokens encrypted at rest (KMS or encrypted fields).
- API/workers load runtime config (LLM, OAuth, billing, vector DB) from env vars.
- API custom domain + cert are configured via `NOTESHIP_API_CUSTOM_DOMAIN` and `NOTESHIP_API_CERTIFICATE_ARN`.
- Content CDN custom domain + cert are configured via `NOTESHIP_CONTENT_CUSTOM_DOMAIN` and `NOTESHIP_CONTENT_CERTIFICATE_ARN`.
- S3 access:
  - Prefer access through backend (signed URLs only if needed)
- Multi-tenant:
  - Every DDB query is partitioned by `userId`
  - Vector DB queries always filter by `userId`

---

## 10) Observability (practical)

Details: see `docs/technical/index.md`.

- Structured logs (JSON) for API and workers
- Include: `requestId`, `userId`, `noteId/postId`, `jobId`, `provider`
- DLQ alarms (basic)
- CloudWatch metrics:
  - job failures
  - publish failures
  - embedding duration (optional)

---

## 11) Testing strategy (what to implement now)

Details: see `docs/technical/index.md`.

### 11.1 Backend

**Unit tests (fast)**

- entitlement checks
- chunking logic
- mapping functions (internal -> vendor payload)

**Integration tests**

- DynamoDB adapter (localstack or dynamodb-local)
- S3 adapter (localstack)
- Stripe webhook signature verification (real sample fixtures)

**E2E tests (small set, Playwright)**
Cover only business-critical flows:

1. Sign up/sign in
2. Create note
3. Semantic search returns note
4. Generate post draft
5. Upgrade (Stripe test) and confirm scheduling unlock
6. Publish flow (can mock vendor endpoints)

> Avoid Selenium; use Playwright.

### 11.2 Frontend

- Basic component tests optional
- Prefer Playwright to validate “wiring works”

---

## 12) Build order (recommended execution sequence)

1. Auth + user bootstrap (Users table, session)
2. Notes CRUD (S3 + Notes table)
3. Embedding worker + Vector DB
4. Semantic search endpoint
5. Post generation (LLM) + draft storage
6. Integrations OAuth + publish worker (LinkedIn/Medium)
7. Scheduling dispatcher + retries/DLQ
8. Stripe checkout + webhook + entitlements enforcement
9. Minimal E2E suite

---

## 13) Bilingual and RTL/LTR support (EN + AR)

Details: see `docs/technical/index.md`.

- Languages: English (LTR) and Arabic (RTL) with user toggle; default from browser language, persist in local storage.
- Apply brand rules: see `docs/brand/noteship-language-guidelines.md`, `docs/brand/noteship-layout-rtl-ltr.md`, `docs/brand/noteship-typography.md` for tone, mirroring, and font stacks (IBM Plex Sans + IBM Plex Sans Arabic for app UI; Lora/Noto Naskh for marketing headlines).
- Layout: use CSS logical properties (`padding-inline`, `text-align: start|end`) and set `lang`/`dir` at the root per locale; mirror nav and directional icons for RTL.
- shadcn/ui: enable RTL support in shadcn config; keep `dir` set on `html` or page root and use the Radix `DirectionProvider` where a component needs explicit direction (menus, popovers, dialogs).
- TipTap/editor:
  - Keep global layout direction language-driven (`en` -> LTR, `ar` -> RTL) from user settings (`/me`), with local-storage cache for fallback.
  - Keep editor block direction controls in the block bubble menu; LTR/RTL toggles apply only to the active block and never change global site direction.
  - Default new block direction to the current note session preference (initialized from site direction and updated when user toggles/enters explicit block direction).
  - Support logical (`start/end`) and physical (`left/center/right`) alignment for mixed RTL/LTR notes.
  - Support markdown import (CommonMark/GFM) with 500 KB max file size and user-facing validation.
  - Support dual markdown export modes: rich Noteship markdown and compatibility markdown for Obsidian.
  - Keep code blocks and inline code LTR with monospace Latin fonts.
  - Preserve language metadata on notes/posts (`language: ar|en`) and render containers with `lang`/`dir`.
  - On export (Markdown) include language in frontmatter; on render keep direction attributes.
- Search/embeddings/AI: use multilingual embeddings and generation models; store language with embeddings to allow language-aware ranking; normalize Arabic text (diacritics optional) for search robustness; prompts respect selected language.
- Publishing: render body/title with correct direction; keep platform names (LinkedIn/Medium) in English inside Arabic UI.
- Testing: add E2E cases for RTL layout, mixed-language content in editor, and search/publish flows in Arabic UI.
- **Localized copy storage (public pages):** keep EN/AR marketing copy in `apps/web/data/<surface>.ts` exporting `{ en, ar }` objects (typed). Include locale-specific assets (hero/proof screenshots) and direction hints alongside text to keep components lean and ensure RTL-safe rendering.

---

## 14) Appendix: DI pattern (no library)

- Create AWS SDK clients at module scope (warm reuse)
- Build `deps` once at module scope per Lambda runtime
- Pass `deps` to use-cases explicitly
- Use-cases depend on interfaces

This achieves testability and clarity without container magic.
