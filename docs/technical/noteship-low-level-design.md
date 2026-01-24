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
- **Editor:** TipTap (ProseMirror) → serialize to Markdown for storage

Details: `docs/technical/detailed/03-mvp-scope-and-feature-definition.md`, `docs/technical/detailed/05-functional-requirements.md`.

---

## 1) Repository structure (monorepo) + conventions

### 1.1 Monorepo tooling

- **pnpm workspaces** + **turborepo** (or Nx; prefer turbo for simplicity)
- **TypeScript:** strict mode everywhere
- **Lint/format:** ESLint + Prettier
- **Prettier command:** `pnpm prettier --write .` (run before PRs/commits; applies to apps, packages, and docs)
- **Validation:** Zod for request/response schemas + shared types
- **Testing:** Vitest/Jest (unit/integration), Playwright (E2E)

Details: `docs/technical/detailed/08-frontend-architecture.md`, `docs/technical/detailed/09-backend-architecture.md`, `docs/technical/detailed/16-testing-and-quality-strategy.md`.

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
- Keep DI simple: explicit `deps` object with module-level caching for expensive clients.

---

## 2) Data architecture

Details: `docs/technical/detailed/10-data-architecture.md`.

### 2.1 S3 layout (canonical content)

Bucket: `noteship-content-{env}` (versioning enabled)

Paths:

```
users/{userId}/notes/{noteId}/note.md
users/{userId}/notes/{noteId}/artifacts/{artifactId}.{ext}
users/{userId}/posts/{postId}/draft.md
users/{userId}/posts/{postId}/payload.json
```

Notes:

- `note.md` is the canonical representation.
- Artifacts are references (images, exports, generated drafts, etc.)
- Use stable IDs and never rely on raw filenames.

### 2.2 DynamoDB tables (MVP)

You can do single-table later. For MVP, use **multiple tables** to stay readable.

#### Table: `Users`

Partition key: `pk = userId`
Attributes:

- `email`, `name`, `createdAt`
- `planId`, `subscriptionStatus`, `currentPeriodEnd` (denormalized convenience)
- `stripeCustomerId` (optional)

#### Table: `Notes`

Partition key: `pk = userId`
Sort key: `sk = NOTE#{noteId}`
Attributes:

- `noteId`, `title`, `tags[]`
- `s3Key` (to note.md), `updatedAt`, `createdAt`
- `embeddingStatus` (pending|ready|failed)
- `embeddingVersion` (hash or S3 versionId)
- `editorFormat` (tiptap/markdown) (optional; default markdown)
  Indexes:
- GSI1: `GSI1PK = userId`, `GSI1SK = UPDATED#{updatedAt}` for listing latest notes
- Optional tag index later (avoid premature complexity)

#### Table: `Posts`

Partition key: `pk = userId`
Sort key: `sk = POST#{postId}`
Attributes:

- `postId`, `noteId` (source)
- `provider` (linkedin|medium)
- `status` (draft|queued|scheduled|publishing|published|failed)
- `scheduleAt` (ISO) nullable
- `contentS3Key` (draft.md)
- `error` (lastErrorCode/message) nullable
- `createdAt`, `updatedAt`
  Indexes:
- GSI1: `GSI1PK = userId`, `GSI1SK = STATUS#{status}#UPDATED#{updatedAt}`
- GSI2: `GSI2PK = provider`, `GSI2SK = SCHEDULE#{scheduleAt}` (for scheduled execution) OR use SQS delay/scheduler

#### Table: `IntegrationAccounts`

Partition key: `pk = userId`
Sort key: `sk = INTEGRATION#{provider}#{accountId}`
Attributes:

- `provider` (linkedin|medium|...)
- `accountId` (vendor account identifier/URN)
- `status` (connected|revoked|error)
- `scopes[]`, `connectedAt`, `updatedAt`
- `tokenRef` (pointer to Secrets Manager) OR encrypted token blob
- provider metadata (e.g., LinkedIn person URN)

#### Table: `Usage`

Partition key: `pk = userId`
Sort key: `sk = PERIOD#{YYYY-MM}`
Attributes:

- `aiGenerationsUsed`
- `postsPublished`
- `storageUsedMb` (optional)
- `updatedAt`

#### Table: `Jobs` (optional, recommended)

If you want observable job history beyond SQS:
Partition key: `pk = userId`
Sort key: `sk = JOB#{jobId}`
Attributes:

- `type` (EMBED_NOTE|PUBLISH_POST|IMPORT_NOTE)
- `status` (queued|running|succeeded|failed)
- `payload` (small), `createdAt`, `updatedAt`

> You can skip Jobs table initially if you log well and rely on DLQ; add later when needed.

---

## 3) Vector DB design (Qdrant-like model)

Details: `docs/technical/detailed/13-embedding-and-semantic-search-design.md`.

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
  - If version unchanged → skip embedding job
  - If changed → embed and upsert new points; delete old version points for note

---

## 4) Embedding + semantic search design

Details: `docs/technical/detailed/13-embedding-and-semantic-search-design.md`.

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
6. Return list of notes + snippet references (chunkIndex), sorted by score

Return shape (conceptual):

```json
{
  "results": [
    {
      "noteId": "n1",
      "title": "Pricing objections",
      "score": 0.84,
      "highlights": [{ "chunkIndex": 2 }]
    }
  ]
}
```

---

## 5) API design (REST, API Gateway)

Details: `docs/technical/detailed/11-api-design-and-contracts.md`.

### 5.1 Auth

- JWT-based auth (Cognito/Auth0). API Gateway authorizer injects user identity.
- All endpoints assume `userId` from JWT subject.

### 5.2 Endpoints (MVP)

#### Notes

- `GET /notes?cursor=&limit=` list notes (sorted by updatedAt)
- `POST /notes` create note (title, content in markdown)
- `GET /notes/{noteId}` get note metadata + content (content fetched via S3)
- `PUT /notes/{noteId}` update note (markdown)
- `DELETE /notes/{noteId}` delete note (soft delete recommended)

#### Search

- `GET /search?q=...` semantic search across notes

#### Generation

- `POST /notes/{noteId}/generate-post` (tone, provider) returns draft(s)

#### Posts

- `POST /posts` create post from draft (provider, content)
- `POST /posts/{postId}/publish` publish now
- `POST /posts/{postId}/schedule` schedule at time
- `POST /posts/{postId}/cancel` cancel scheduled
- `GET /posts?status=` list posts

#### Integrations

- `GET /integrations` list connected accounts
- `POST /integrations/{provider}/connect` start OAuth
- `GET /integrations/{provider}/callback` OAuth callback
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

Details: `docs/technical/detailed/09-backend-architecture.md`, `docs/technical/detailed/12-connector-and-integration-architecture.md`.

### 6.1 Job types

- `EMBED_NOTE`
- `PUBLISH_POST`
- `SCHEDULED_PUBLISH` (or reuse PUBLISH_POST with schedule logic)
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

MVP options:

- **Option A (simple):** store `scheduleAt` in DDB and run a scheduled worker every minute to dispatch due posts
- **Option B (clean):** EventBridge Scheduler per post (creates managed scheduled invocation)

Recommendation:

- Start with **Option A** for simplicity and cost predictability, then migrate to Scheduler if needed.

---

## 7) Connector / integration LLD

Details: `docs/technical/detailed/12-connector-and-integration-architecture.md`.

### 7.1 Connector interface (TypeScript)

Conceptual:

- `publishPost(input): Promise<PublishResult>`
- `startOAuth(): URL`
- `handleOAuthCallback(code): IntegrationAccount`
- `refreshTokenIfNeeded(account): IntegrationAccount`
- `disconnect(account): void`

### 7.2 LinkedIn + Medium specifics (MVP)

- Store per-user integration account
- Worker publishes using stored token
- Handle rate limits with retries/backoff
- Map internal post format to vendor payload

### 7.3 Import connectors (future)

- Webhook ingestion endpoint (preferred)
- Polling job (fallback)
- Normalize vendor payload → internal note markdown
- Trigger embedding job automatically

---

## 8) Billing + plans + entitlements

Details: `docs/technical/detailed/04-pricing-plans-and-entitlements.md`, `docs/technical/detailed/14-billing-and-stripe-integration.md`.

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

### 8.3 Plan → entitlements mapping (MVP)

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
  - AI generation success → `aiGenerationsUsed += 1`
  - Publish success → `postsPublished += 1`

---

## 9) Security implementation rules

Details: `docs/technical/detailed/06-non-functional-requirements.md`.

- Vendor tokens must never reach frontend.
- Store tokens encrypted:
  - Secrets Manager (preferred) OR
  - DynamoDB encrypted attribute with KMS (acceptable)
- S3 access:
  - Prefer access through backend (signed URLs only if needed)
- Multi-tenant:
  - Every DDB query is partitioned by `userId`
  - Vector DB queries always filter by `userId`

---

## 10) Observability (practical)

Details: `docs/technical/detailed/06-non-functional-requirements.md`.

- Structured logs (JSON) for API and workers
- Include: `requestId`, `userId`, `noteId/postId`, `jobId`, `provider`
- DLQ alarms (basic)
- CloudWatch metrics:
  - job failures
  - publish failures
  - embedding duration (optional)

---

## 11) Testing strategy (what to implement now)

Details: `docs/technical/detailed/16-testing-and-quality-strategy.md`.

### 11.1 Backend

**Unit tests (fast)**

- entitlement checks
- chunking logic
- mapping functions (internal → vendor payload)

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

Details: `docs/technical/detailed/08-frontend-architecture.md`.

- Languages: English (LTR) and Arabic (RTL) with user toggle; default from browser language, persist per user profile.
- Apply brand rules: see `docs/brand/noteship-language-guidelines.md`, `docs/brand/noteship-layout-rtl-ltr.md`, `docs/brand/noteship-typography.md` for tone, mirroring, and font stacks (IBM Plex Sans + IBM Plex Sans Arabic for app UI; Lora/Noto Naskh for marketing headlines).
- Layout: use CSS logical properties (`padding-inline`, `text-align: start|end`) and set `lang`/`dir` at the root per locale; mirror nav and directional icons for RTL.
- TipTap/editor:
  - Support per-block `dir` (RTL/LTR) and text alignment; keep code blocks and inline code LTR with monospace Latin fonts.
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
