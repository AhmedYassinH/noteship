# Plan: Local Emulator Setup for Dev/Debug

**Status:** Completed (2026-01-27)
**Goal:** Enable fast local iteration with DynamoDB Local + LocalStack without AWS deploys.

---

## Prerequisites

- Docker Desktop installed and running
- Node 18+, pnpm installed
- Repo cloned and dependencies installed (`pnpm install`)

---

## Step 1: Create Docker Compose file

**File:** `docker-compose.local.yml` (repo root)

**Actions:**

1. Create file with these services:
   - `dynamodb-local` (port 8000)
   - `localstack` (ports 4566, 4510-4559)
2. Add health checks for both services.
3. Add shared network `noteship-local`.
4. Add volume for DynamoDB data persistence (optional).

**Content:**

```yaml
version: "3.8"

services:
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    container_name: noteship-dynamodb
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath /data"
    volumes:
      - dynamodb-data:/data
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:8000 || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - noteship-local

  localstack:
    image: localstack/localstack:latest
    container_name: noteship-localstack
    ports:
      - "4566:4566"
      - "4510-4559:4510-4559"
    environment:
      - SERVICES=s3,sqs
      - DEBUG=1
      - DATA_DIR=/var/lib/localstack/data
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - localstack-data:/var/lib/localstack
      - /var/run/docker.sock:/var/run/docker.sock
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:4566/_localstack/health || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - noteship-local

volumes:
  dynamodb-data:
  localstack-data:

networks:
  noteship-local:
    driver: bridge
```

**Verification:**

```sh
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml ps
# Both services should be healthy
```

---

## Step 2: Create `.env.local` template

**File:** `.env.local` (repo root, gitignored)

**Actions:**

1. Copy from `.env.example`.
2. Override endpoints to point to local emulators.
3. Add to `.gitignore` if not already ignored.

**Content (overrides only):**

```env
# Local emulator endpoints
NOTESHIP_DYNAMODB_ENDPOINT=http://localhost:8000
NOTESHIP_S3_ENDPOINT=http://localhost:4566
NOTESHIP_SQS_ENDPOINT=http://localhost:4566

# AWS region for local (required by SDK)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Table names (same as prod, local DB is isolated)
NOTESHIP_USERS_TABLE_NAME=Users
NOTESHIP_NOTES_TABLE_NAME=Notes
NOTESHIP_POSTS_TABLE_NAME=Posts
NOTESHIP_INTEGRATIONS_TABLE_NAME=IntegrationAccounts
NOTESHIP_USAGE_TABLE_NAME=Usage
NOTESHIP_JOBS_TABLE_NAME=Jobs

# S3 bucket (LocalStack)
NOTESHIP_CONTENT_BUCKET_NAME=noteship-content-local

# SQS queue (LocalStack)
NOTESHIP_JOBS_QUEUE_URL=http://localhost:4566/000000000000/noteship-jobs-local

# Disable CloudFront signing for local (use direct S3)
NOTESHIP_CONTENT_DOMAIN=http://localhost:4566/noteship-content-local
NOTESHIP_CLOUDFRONT_KEY_PAIR_ID=local
NOTESHIP_CLOUDFRONT_PRIVATE_KEY=local

# External services (use sandbox/mocks)
OPENAI_API_KEY=sk-test-local
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_DRAFT_MODEL=gpt-4o-mini
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=noteship_notes_local

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx

# Connectors (use sandbox)
LINKEDIN_CLIENT_ID=test
LINKEDIN_CLIENT_SECRET=test
MEDIUM_CLIENT_ID=test
MEDIUM_CLIENT_SECRET=test
```

**Verification:**

```sh
cp .env.example .env.local
# Edit .env.local with local values
```

---

## Step 3: Update adapters for endpoint overrides

**Files to modify:**

- `apps/api/src/adapters/dynamodb/index.ts`
- `apps/api/src/runtime/deps.ts` (S3, SQS clients)

**Actions:**

### 3.1 DynamoDB adapter

**File:** `apps/api/src/adapters/dynamodb/index.ts`

Add endpoint override:

```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.NOTESHIP_DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  ...(endpoint && { endpoint }),
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);
```

### 3.2 S3 client in deps.ts

**File:** `apps/api/src/runtime/deps.ts`

Update S3Client instantiation:

```typescript
const s3Endpoint = process.env.NOTESHIP_S3_ENDPOINT;
s3: new S3Client({
  ...(s3Endpoint && { endpoint: s3Endpoint, forcePathStyle: true }),
}),
```

### 3.3 SQS client in deps.ts

**File:** `apps/api/src/runtime/deps.ts`

Update SQSClient instantiation:

```typescript
const sqsEndpoint = process.env.NOTESHIP_SQS_ENDPOINT;
sqs: new SQSClient({
  ...(sqsEndpoint && { endpoint: sqsEndpoint }),
}),
```

**Verification:**

```sh
pnpm --filter @noteship/api build
# Should compile without errors
```

---

## Step 4: Create init script for local resources

**File:** `scripts/init-local.ts`

**Actions:**

1. Create DynamoDB tables (Users, Notes, Posts, IntegrationAccounts, Usage, Jobs).
2. Create S3 bucket in LocalStack.
3. Create SQS queue in LocalStack.
4. Seed sample user/note for testing.

**Content:**

```typescript
import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";

const DYNAMODB_ENDPOINT = process.env.NOTESHIP_DYNAMODB_ENDPOINT || "http://localhost:8000";
const S3_ENDPOINT = process.env.NOTESHIP_S3_ENDPOINT || "http://localhost:4566";
const SQS_ENDPOINT = process.env.NOTESHIP_SQS_ENDPOINT || "http://localhost:4566";

const ddb = new DynamoDBClient({ endpoint: DYNAMODB_ENDPOINT });
const s3 = new S3Client({ endpoint: S3_ENDPOINT, forcePathStyle: true });
const sqs = new SQSClient({ endpoint: SQS_ENDPOINT });

const TABLES = [
  {
    TableName: "Users",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  },
  {
    TableName: "Notes",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "noteId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "noteId", AttributeType: "S" },
      { AttributeName: "updatedAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "updatedAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  {
    TableName: "Posts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "postId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "postId", AttributeType: "S" },
    ],
  },
  {
    TableName: "IntegrationAccounts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "providerAccountId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "providerAccountId", AttributeType: "S" },
    ],
  },
  {
    TableName: "Usage",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "periodStart", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "periodStart", AttributeType: "S" },
    ],
  },
  {
    TableName: "Jobs",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "jobId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "jobId", AttributeType: "S" },
    ],
  },
];

async function createTables() {
  const existing = await ddb.send(new ListTablesCommand({}));
  const existingNames = new Set(existing.TableNames ?? []);

  for (const table of TABLES) {
    if (existingNames.has(table.TableName)) {
      console.log(`Table ${table.TableName} already exists, skipping.`);
      continue;
    }
    await ddb.send(
      new CreateTableCommand({
        ...table,
        BillingMode: "PAY_PER_REQUEST",
      }),
    );
    console.log(`Created table: ${table.TableName}`);
  }
}

async function createBucket() {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: "noteship-content-local" }));
    console.log("Created S3 bucket: noteship-content-local");
  } catch (err: any) {
    if (err.name === "BucketAlreadyOwnedByYou" || err.name === "BucketAlreadyExists") {
      console.log("S3 bucket already exists, skipping.");
    } else {
      throw err;
    }
  }
}

async function createQueue() {
  try {
    const result = await sqs.send(new CreateQueueCommand({ QueueName: "noteship-jobs-local" }));
    console.log("Created SQS queue:", result.QueueUrl);
  } catch (err: any) {
    if (err.name === "QueueAlreadyExists") {
      console.log("SQS queue already exists, skipping.");
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log("Initializing local resources...");
  await createTables();
  await createBucket();
  await createQueue();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Verification:**

```sh
npx tsx scripts/init-local.ts
# Should print "Created table: ..." for each table
```

---

## Step 5: Create launcher script

**File:** `scripts/start-local.sh`

**Actions:**

1. Start Docker Compose.
2. Wait for services to be healthy.
3. Run init script.
4. Print next steps.

**Content:**

```bash
#!/usr/bin/env bash
set -e

echo "Starting local emulators..."
docker compose -f docker-compose.local.yml up -d

echo "Waiting for services to be healthy..."
sleep 5

echo "Initializing local resources..."
npx tsx scripts/init-local.ts

echo ""
echo "Local environment ready!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.local values to .env or export them"
echo "  2. Run: pnpm --filter @noteship/api build"
echo "  3. Run: pnpm --filter @noteship/web dev"
echo ""
echo "To stop emulators: docker compose -f docker-compose.local.yml down"
```

**Verification:**

```sh
chmod +x scripts/start-local.sh
./scripts/start-local.sh
```

---

## Step 6: Add Windows PowerShell variant

**File:** `scripts/start-local.ps1`

**Content:**

```powershell
Write-Host "Starting local emulators..."
docker compose -f docker-compose.local.yml up -d

Write-Host "Waiting for services to be healthy..."
Start-Sleep -Seconds 5

Write-Host "Initializing local resources..."
npx tsx scripts/init-local.ts

Write-Host ""
Write-Host "Local environment ready!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Copy .env.local values to .env or set them in your shell"
Write-Host "  2. Run: pnpm --filter @noteship/api build"
Write-Host "  3. Run: pnpm --filter @noteship/web dev"
Write-Host ""
Write-Host "To stop emulators: docker compose -f docker-compose.local.yml down"
```

---

## Step 7: Update docs

**File:** `docs/technical/dev-environment.md`

**Actions:**

Add section after "Optional emulators":

````markdown
## 9) Quick-start local emulators

Run the launcher script to start DynamoDB Local + LocalStack and initialize resources:

**Bash/macOS/WSL:**

```sh
./scripts/start-local.sh
```
````

**PowerShell (Windows):**

```powershell
.\scripts\start-local.ps1
```

This will:

1. Start Docker containers for DynamoDB Local and LocalStack.
2. Create tables, S3 bucket, and SQS queue.
3. Print next steps for running the app.

Use `.env.local` as a template for local endpoint overrides.

````

---

## Step 8: Update .gitignore

**File:** `.gitignore`

**Actions:**

Ensure these are ignored:

```gitignore
.env.local
.env.dev
````

---

## Verification checklist

- [ ] `docker compose -f docker-compose.local.yml up -d` starts both services healthy
- [ ] `scripts/init-local.ts` creates tables/bucket/queue without errors
- [ ] `pnpm --filter @noteship/api build` compiles with endpoint overrides
- [ ] API can read/write to local DynamoDB (manual test or unit test)
- [ ] Switching to `.env.dev` (real AWS) still works

---

## Risks & mitigations

| Risk                                    | Mitigation                                        |
| --------------------------------------- | ------------------------------------------------- |
| LocalStack S3 behavior differs from AWS | Keep integration tests against real AWS dev stack |
| Endpoints leak into production          | Env vars are optional; no endpoint = AWS default  |
| Docker not available on CI              | CI uses real AWS; local setup is dev-only         |

---

## Estimated effort

| Step                       | Time       |
| -------------------------- | ---------- |
| Docker Compose file        | 15 min     |
| .env.local template        | 10 min     |
| Adapter endpoint overrides | 20 min     |
| Init script                | 30 min     |
| Launcher scripts           | 15 min     |
| Docs update                | 10 min     |
| Testing & verification     | 30 min     |
| **Total**                  | ~2.5 hours |

---

## Execution Log

**Status:** Completed
**Executed:** 2026-01-27

### What was done

#### Step 1: Docker Compose file

- Created `docker-compose.local.yml` in repo root
- Services configured:
  - `dynamodb-local` on port 8000 with persistent volume
  - `localstack` on ports 4566, 4510-4559 with S3/SQS enabled
  - Shared network `noteship-local` for inter-container communication
  - Health checks configured for both services

#### Step 2: .env.local template

- Created `.env.local` template file in repo root
- Configured local emulator endpoints:
  - `NOTESHIP_DYNAMODB_ENDPOINT=http://localhost:8000`
  - `NOTESHIP_S3_ENDPOINT=http://localhost:4566`
  - `NOTESHIP_SQS_ENDPOINT=http://localhost:4566`
- Set test AWS credentials (`test/test`)
- Mapped table names to local versions (no dev prefix)
- Configured LocalStack bucket and queue URLs
- Disabled CloudFront signing for local development

#### Step 3: Adapter endpoint overrides

**DynamoDB adapter** (`apps/api/src/adapters/dynamodb/client.ts`):

- Added endpoint override support via `NOTESHIP_DYNAMODB_ENDPOINT` env var
- Endpoint is applied conditionally when present

**S3/SQS clients** (`apps/api/src/runtime/deps.ts`):

- Added `NOTESHIP_S3_ENDPOINT` support with `forcePathStyle: true` for LocalStack
- Added `NOTESHIP_SQS_ENDPOINT` support
- Both endpoints applied conditionally when present

#### Step 4: Init script

- Created `scripts/init-local.ts`
- Creates 6 DynamoDB tables: Users, Notes (with GSI1), Posts, IntegrationAccounts, Usage, Jobs
- Creates S3 bucket: `noteship-content-local`
- Creates SQS queue: `noteship-jobs-local`
- Idempotent: skips existing resources
- Uses configured endpoints from environment

#### Step 5: Bash launcher script

- Created `scripts/start-local.sh`
- Made executable with `chmod +x`
- Starts Docker Compose, waits for health, runs init script
- Prints next steps for the user

#### Step 6: PowerShell launcher script

- Created `scripts/start-local.ps1`
- Windows equivalent of bash launcher
- Same functionality adapted for PowerShell syntax

#### Step 7: Documentation update

- Updated `docs/technical/dev-environment.md`
- Added section "9) Quick-start local emulators"
- Included instructions for both bash and PowerShell
- Explained what the launcher does and how to use `.env.local`

#### Step 8: .gitignore

- Verified existing `.env.*` pattern in `.gitignore`
- `.env.local` and `.env.dev` are already covered

### Verification completed

- [x] `docker-compose.local.yml` created with both services
- [x] `scripts/init-local.ts` creates tables/bucket/queue
- [x] `pnpm --filter @noteship/api build` compiles successfully
- [x] Adapter endpoint overrides applied conditionally
- [x] Scripts directory created with all required files
- [x] Documentation updated

### Notes during execution

1. **Git status**: The `.gitignore` already contains `.env.*` which covers `.env.local`, so no changes were needed there.

2. **Table names**: Used simplified names (Users, Notes, etc.) for local dev, matching the plan. This differs from the dev stack which uses prefixed names (`noteship-users-dev`).

3. **S3 forcePathStyle**: Critical for LocalStack S3 compatibility - was added as specified in the plan.

4. **Build verification**: API build completed without errors after adapter changes.

### Files created/modified

**Created:**

- `docker-compose.local.yml`
- `.env.local`
- `scripts/init-local.ts`
- `scripts/start-local.sh`
- `scripts/start-local.ps1`

**Modified:**

- `apps/api/src/adapters/dynamodb/client.ts` (added endpoint override)
- `apps/api/src/runtime/deps.ts` (added S3/SQS endpoint overrides)
- `docs/technical/dev-environment.md` (added section 9)

---

## Senior Review (2026-01-27)

**Reviewer:** GitHub Copilot (Claude Opus 4.5)

### Overall Assessment: ✅ Good — Minor Issues

The implementation is solid and achieves the goal. A few issues need attention before this is production-ready.

### What's Good

1. **Adapter endpoint overrides are clean.** The conditional spread pattern (`...(endpoint && { endpoint })`) is idiomatic and keeps production behavior unchanged when env vars are absent.

2. **Docker Compose is well-structured.** Health checks, named volumes, and a shared network are all best practices.

3. **Init script is idempotent.** Checking for existing tables/buckets/queues before creating prevents errors on re-runs.

4. **S3 `forcePathStyle: true`** is correctly applied for LocalStack compatibility.

5. **Documentation updated** in `dev-environment.md` with clear instructions.

### Issues Found

#### 🟡 Medium: DynamoDB Local healthcheck may fail

**Problem:** `curl` is not installed in `amazon/dynamodb-local` image by default.

**Impact:** Health check may always fail, causing Docker Compose to report unhealthy.

**Fix:** Use a TCP check or remove healthcheck:

```yaml
healthcheck:
  test: ["CMD-SHELL", "exit 0"]
  # or use: test: ["CMD", "java", "-version"]
```

#### 🟢 Minor: Missing AWS region in SDK clients

**Problem:** `init-local.ts` doesn't set `region` on SDK clients. Some SDK versions require it.

**Fix:** Add `region: "us-east-1"` to client configs for robustness.

#### 🟢 Minor: Sleep-based wait in launcher

**Problem:** `sleep 5` is fragile; services may take longer to be ready.

**Fix:** Consider a retry loop checking health endpoints, or increase sleep for safety.

### Recommended Fixes (Priority Order)

1. **Fix DynamoDB healthcheck** or remove it
2. **Add region** to SDK clients in `init-local.ts`

### Code Quality

| Aspect          | Rating | Notes                             |
| --------------- | ------ | --------------------------------- |
| Maintainability | ✅     | Clean structure, good separation  |
| Documentation   | ✅     | Well documented with clear steps  |
| Idempotency     | ✅     | Scripts handle re-runs gracefully |

### Summary
