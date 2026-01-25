# Noteship — System Architecture (HLD)

**Document purpose:** Provide the end-to-end architectural “map” of Noteship at a high level (components, boundaries, major data flows, and deployment topology) without low-level implementation details.

**Architecture goals (MVP):**

- AWS-first, serverless where it makes sense
- Cost-efficient for low initial scale (solo users)
- Modular enough to add many integrations over time (imports/exports)
- Reliable async workflows (publishing, embedding)
- Clear separation: **content** vs **metadata** vs **indexes** vs **billing**

Details: `docs/technical/detailed/03-mvp-scope-and-feature-definition.md`, `docs/technical/detailed/05-functional-requirements.md`, `docs/technical/detailed/06-non-functional-requirements.md`.

---

## 1) System overview

### Core concepts

- **Canonical content**: Markdown notes + artifacts stored in S3
- **Metadata**: Note lists, statuses, user config, subscriptions in DynamoDB
- **Derived indexes**: Vector embeddings in a managed Vector DB (e.g., Qdrant)
- **Integrations**: Connector-based architecture (LinkedIn/Medium now; more later)
- **Async-first**: SQS jobs processed by worker Lambdas with retries + DLQ

### High-level component diagram

```mermaid
flowchart LR
  subgraph Client["Client (Browser)"]
    UI["Next.js Web App<br/>Dashboard + Landing"]
  end

  subgraph AWS["AWS (Core Platform)"]
    CF["CloudFront"]
    S3["S3<br/>Notes (Markdown) + Artifacts"]
    APIGW["API Gateway"]
    API["Lambda API (Handlers)<br/>Thin controllers"]
    DDB["DynamoDB<br/>Metadata + State"]
    SQS["SQS<br/>Jobs Queue"]
    DLQ["DLQ"]
    WORKER["Lambda Workers<br/>Async processing"]
    EB["EventBridge (optional)<br/>Events routing"]
    CW["CloudWatch Logs/Metrics"]
    SM["Env vars / KMS (optional)<br/>Tokens + Secrets"]
  end

  subgraph External["External Services"]
    VDB["Vector DB (Qdrant Cloud)"]
    STRIPE["Stripe (Billing)"]
    LI["LinkedIn API"]
    MED["Medium API"]
    LLM["LLM Provider / Bedrock (future)<br/>Embeddings + Generation"]
  end

  UI --> CF --> APIGW --> API
  API --> DDB
  API --> S3
  API --> SQS
  WORKER --> S3
  WORKER --> DDB
  WORKER --> VDB
  WORKER --> LI
  WORKER --> MED
  API --> STRIPE
  WORKER --> LLM

  SQS --> WORKER
  WORKER --> DLQ

  API --> CW
  WORKER --> CW
  API --> SM
  WORKER --> SM
```

Details: `docs/technical/detailed/07-system-high-level-architecture.md`.

---

## 2) Frontend architecture (high level)

### Choice

- **Single Next.js app** (Landing + Dashboard) for simplicity:
  - One auth integration
  - One deployment pipeline
  - Shared UI/components without duplication

### Frontend responsibilities

- Auth UI and session handling
- Rich text editing (TipTap)
- Calling API endpoints for notes, search, posts, scheduling
- Client-side feature gating (hide/disable) based on entitlements snapshot
- Showing async job statuses (scheduled/published/failed)
- Bilingual UX (EN/AR) with RTL/LTR layout mirroring per brand docs (`docs/brand/noteship-language-guidelines.md`, `docs/brand/noteship-layout-rtl-ltr.md`, `docs/brand/noteship-typography.md`)

### Frontend non-responsibilities

- Never enforce security/plan gates solely in UI
- Never call vendor APIs directly (LinkedIn/Medium)
- Never store secrets/tokens in the browser

Details: `docs/technical/detailed/08-frontend-architecture.md`.

---

## 3) Backend architecture (high level)

### Core backend building blocks

1. **API Layer (API Gateway + Lambda API)**
   - Stateless request handlers
   - Validates input, resolves user identity, calls use-cases
   - Auth0 JWT authorizer (Universal Login; Google SSO + passwordless email)
   - Writes canonical content to S3 and metadata to DynamoDB
   - Enqueues async jobs (embedding, publishing)

2. **Async Layer (SQS + Worker Lambdas + DLQ)**
   - Performs long-running or unreliable work:
     - embedding / vector upsert
     - publishing to vendors
     - scheduling execution
   - Retries with backoff
   - DLQ for visibility and manual replay later

3. **Integration Layer (Connectors)**
   - Each vendor is a connector module implementing a standard contract
   - Auth tokens stored server-side and used by workers
   - Connector logic is isolated from core domain logic

4. **Billing Layer (Stripe)**
   - Stripe is source-of-truth for billing events
   - Noteship persists subscription state and derives entitlements
   - Webhooks update plan status; app does not trust client claims

Details: `docs/technical/detailed/09-backend-architecture.md`, `docs/technical/detailed/11-api-design-and-contracts.md`, `docs/technical/detailed/14-billing-and-stripe-integration.md`.

---

## 4) Data & storage boundaries (what lives where)

### S3 (canonical content)

- `note.md` stored per note
- `artifacts/*` stored per note (images, exports, generated outputs)
- Versioning enabled (supports history + safe re-embedding)

### DynamoDB (system of record for state/metadata)

- Notes metadata: titles, tags, timestamps, s3Key, embedding status/version
- Posts metadata: draft/scheduled/published/failed, target vendor, schedule time
- Integration accounts: vendor connections, token references, status
- Subscription state: current plan, status, period end
- Usage counters: quotas per billing period (optional in MVP but recommended)

### Vector DB (derived index)

- Chunk embeddings with metadata `{userId, noteId, chunkIndex, version}`
- Rebuilt anytime; never treated as canonical

Details: `docs/technical/detailed/10-data-architecture.md`.

---

## 5) Key flows (request + async)

Details: `docs/technical/detailed/11-api-design-and-contracts.md`, `docs/technical/detailed/12-connector-and-integration-architecture.md`, `docs/technical/detailed/13-embedding-and-semantic-search-design.md`.

### 5.1 Create / update a note

**Intent:** Persist canonical content and keep semantic search index up to date.

```mermaid
sequenceDiagram
  participant U as User (Web)
  participant FE as Next.js
  participant GW as API Gateway
  participant API as Lambda API
  participant S3 as S3 (Markdown)
  participant DDB as DynamoDB
  participant Q as SQS
  participant W as Worker Lambda
  participant V as Vector DB

  U->>FE: Edit note (TipTap)
  FE->>GW: Save note (md + metadata)
  GW->>API: Invoke handler
  API->>S3: Put note.md (versioned)
  API->>DDB: Upsert Note metadata (s3Key, updatedAt, embeddingStatus=pending)
  API->>Q: Enqueue EMBED_NOTE(job: noteId, version)
  API-->>FE: 200 OK (note saved)

  Q->>W: Deliver EMBED_NOTE
  W->>S3: Read note.md
  W->>W: Chunk + embed text
  W->>V: Upsert vectors (noteId, version, chunkIndex)
  W->>DDB: Update embeddingStatus=ready, embeddingVersion=version
```

### 5.2 Semantic search

**Intent:** User finds notes by meaning (not exact wording).

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Next.js
  participant GW as API Gateway
  participant API as Lambda API
  participant V as Vector DB
  participant DDB as DynamoDB
  participant S3 as S3

  U->>FE: Search query (natural language)
  FE->>GW: POST /search
  GW->>API: Invoke handler
  API->>V: Vector search (topK chunks filtered by userId)
  V-->>API: chunk hits (noteId, chunkIndex, score)
  API->>DDB: Fetch note metadata for noteIds
  DDB-->>API: titles, timestamps, s3Key
  API-->>FE: results (notes + snippet refs)
  FE->>S3: (optional) fetch note preview via API (preferred)
```

> MVP returns “relevant notes/snippets.” In-note jump/highlighting is deferred but the model is compatible with later block-level mapping.

### 5.3 Generate a post from a note

**Intent:** Convert a note into a LinkedIn/Medium-ready draft with tone/persona.

```mermaid
sequenceDiagram
  participant FE as Next.js
  participant GW as API Gateway
  participant API as Lambda API
  participant S3 as S3
  participant LLM as LLM Provider
  participant DDB as DynamoDB

  FE->>GW: /notes/{id}/drafts (tone, target)
  GW->>API: Invoke handler
  API->>S3: Read note.md
  API->>LLM: Generate draft(s)
  LLM-->>API: Draft content
  API->>DDB: Store Post draft metadata (status=draft)
  API->>S3: Store draft artifact (optional: artifacts/post-draft.md)
  API-->>FE: Return draft(s)
```

### 5.4 Publish now vs schedule

**Intent:** Use async pipeline for reliability and vendor rate limits.

```mermaid
flowchart TD
  A[User clicks Publish/Schedule] --> B[API validates entitlement]
  B --> C[Create Post record in DDB<br/>status=queued or scheduled]
  C --> D[Enqueue JOB_PUBLISH_POST to SQS]
  D --> E[Worker loads content from S3 + DDB]
  E --> F[Connector calls vendor API]
  F --> G{Success?}
  G -->|Yes| H[Update status=published]
  G -->|No| I[Retry with backoff]
  I --> J{Retries exceeded?}
  J -->|Yes| K[DLQ + status=failed]
  J -->|No| D
```

---

## 6) Integration / connector model (scales with vendors)

### Why a connector model

Integrations will grow (export + import). Avoid hardcoding vendor logic into core features.

### Connector boundaries

- Core emits commands/events in **internal schema**
- Connectors map internal schema to vendor API calls and back
- Connectors run in worker context (server-side) and use stored tokens

### Connector contract (conceptual)

- `connect()` / `disconnect()` (OAuth lifecycle)
- `export()` / `publish()` for outbound
- `ingest()` for inbound (webhook or poll)
- `refreshToken()` for auth maintenance
- `validate()` for token/account health

### Integration pipeline (high level)

```mermaid
flowchart LR
  subgraph Core["Core Noteship Domain"]
    Note["Note (Markdown in S3)"]
    Post["Post (DDB state)"]
    Job["Job (SQS message)"]
    Event["Domain Event (optional)"]
  end

  subgraph Connectors["Connector Layer"]
    LIConn["LinkedIn Connector"]
    MEDConn["Medium Connector"]
    Future["Future Connectors<br/>Meeting AI, Notion, Docs, etc."]
  end

  subgraph Vendors["Vendor APIs"]
    LI["LinkedIn"]
    MED["Medium"]
    X["Other Vendors"]
  end

  Note --> Post
  Post --> Job
  Job --> LIConn --> LI
  Job --> MEDConn --> MED
  Job --> Future --> X
```

Details: `docs/technical/detailed/12-connector-and-integration-architecture.md`.

---

## 7) Deployment topology (MVP)

Details: `docs/technical/detailed/15-deployment-and-infrastructure.md`.

### Environments

- **dev**: fast iteration, lower limits, sandbox tokens
- **prod**: real billing, stricter permissions, observability

### Hosting choices (recommended for MVP)

- **AWS-only** hosting for the web app:
  - S3 + CloudFront for landing (SSG) and dashboard (SPA)
  - No SSR, no Next API routes
- AWS hosts:
  - API Gateway + Lambda
  - S3 + CloudFront for artifacts/content delivery
  - DynamoDB
  - SQS + workers
  - Env vars / KMS (optional)

### Deployment diagram (topology)

```mermaid
flowchart LR
  subgraph User["User Browser"]
    B["Web App"]
  end

  subgraph AWS["AWS"]
    CFWEB["CloudFront (Web)"]
    S3WEB["S3 (Web Assets)"]
    APIGW["API Gateway"]
    LAPI["Lambda API"]
    S3["S3 Content"]
    CF["CloudFront"]
    DDB["DynamoDB"]
    SQS["SQS"]
    W["Worker Lambdas"]
    SM["Env vars / KMS (optional)"]
    CW["CloudWatch"]
  end

  subgraph External["External"]
    STRIPE["Stripe"]
    VDB["Vector DB"]
    LI["LinkedIn"]
    MED["Medium"]
    LLM["LLM Provider"]
  end

  B --> CFWEB
  CFWEB --> S3WEB
  B --> APIGW --> LAPI
  LAPI --> DDB
  LAPI --> S3
  LAPI --> SQS
  SQS --> W
  W --> DDB
  W --> S3
  W --> VDB
  W --> LI
  W --> MED
  LAPI --> STRIPE
  W --> LLM
  LAPI --> SM
  W --> SM
  LAPI --> CW
  W --> CW
  S3 --> CF --> CFWEB
```

---

## 8) Operational principles (HLD-level)

Details: `docs/technical/detailed/06-non-functional-requirements.md`.

### Security

- Tokens for vendors stored server-side (encrypted)
- Backend enforces entitlements and authorization
- Per-user isolation in keys/partitions and access policies

### Reliability

- Async jobs for vendor calls and embeddings
- Retries + DLQ for failure visibility
- Idempotency keys for publish jobs (avoid duplicate posts)

### Cost efficiency

- Serverless compute
- S3 for large content
- Vector DB external to avoid OpenSearch cluster fixed costs (MVP)
- Quotas/limits for AI usage

---

## 9) Future evolution (without redesign)

This HLD supports adding:

- Many import/export connectors (meeting AI, Notion, Google Docs)
- In-note semantic highlighting (store block mapping in vector metadata)
- Teams/workspaces (extend DDB schema; add permissions model)
- Analytics module (later) fed by domain events/outbox pattern
