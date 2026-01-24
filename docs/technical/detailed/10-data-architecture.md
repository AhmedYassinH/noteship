# Noteship — Data Architecture

## Purpose

Define how data is stored and referenced.

## Canonical content: S3

Paths (example):

- `users/{userId}/notes/{noteId}/note.md`
- `users/{userId}/notes/{noteId}/artifacts/{artifactId}`

Bucket settings:

- Private access
- Versioning ON
- Optional lifecycle rules for old versions

## Metadata: DynamoDB (suggested tables)

### Table: Users

- PK: `userId`
- Attributes:
  - `email`, `name`, `createdAt`
  - `planId`, `subscriptionStatus`, `currentPeriodEnd`
  - `stripeCustomerId` (optional)

### Table: Notes

- PK: `userId`
- SK: `NOTE#{noteId}`
- Attributes:
  - `noteId`, `title`, `tags[]`, `createdAt`, `updatedAt`
  - `s3Key`, `contentHash`, `embeddingStatus`, `embeddingVersion`
  - `editorFormat` (tiptap/markdown) (optional)
- Indexes:
  - GSI1: `GSI1PK = userId`, `GSI1SK = UPDATED#{updatedAt}`
  - Optional tag index later (avoid premature complexity)

### Table: Posts

- PK: `userId`
- SK: `POST#{postId}`
- Attributes:
  - `postId`, `noteId` (source)
  - `provider` (linkedin/medium)
  - `status` (draft|queued|scheduled|publishing|published|failed)
  - `scheduledAt`, `publishedAt`
  - `contentS3Key` (draft.md)
  - `error` (lastErrorCode/message) nullable
  - `createdAt`, `updatedAt`
- Indexes:
  - GSI1: `GSI1PK = userId`, `GSI1SK = STATUS#{status}#UPDATED#{updatedAt}`
  - GSI2: `GSI2PK = STATUS#scheduled`, `GSI2SK = SCHEDULE#{scheduledAt}`

### Table: IntegrationAccounts

- PK: `userId`
- SK: `INTEGRATION#{provider}#{accountId}`
- Attributes:
  - `provider`, `accountId`, `status`
  - `scopes[]`, `connectedAt`, `updatedAt`
  - `tokenRef` (Secrets Manager pointer) or encrypted token blob
  - provider identifiers (URNs, usernames)

### Table: Usage

- PK: `userId`
- SK: `PERIOD#{YYYY-MM}`
- Attributes:
  - `aiGenerationsUsed`, `scheduledPostsUsed`
  - `postsPublished` (optional; analytics)
  - `storageUsedMb` (optional)

### Table: Jobs (optional)

- PK: `userId`
- SK: `JOB#{jobId}`
- Attributes:
  - `type` (EMBED_NOTE|PUBLISH_POST|IMPORT_NOTE)
  - `status` (queued|running|succeeded|failed)
  - `payload` (small), `createdAt`, `updatedAt`

## Vector DB (Qdrant) schema (conceptual)

Collection: `noteship_notes_{env}`
Payload per vector:

- `userId`
- `noteId`
- `chunkIndex`
- `embeddingVersion`
- optional `blockId` (future highlighting)

## Mermaid: storage mapping

```mermaid
flowchart LR
  Note[Note] --> S3[(S3 note.md)]
  Note --> DDB[(DynamoDB metadata)]
  Note --> VDB[(Vector chunks)]
  Post[Post] --> DDB
  Post --> S3[(S3 post payload)]
  Tokens[OAuth Tokens] --> DDB
```

## Re-embedding rule

- Compute `contentHash` on save; set `embeddingVersion` to that hash (or S3 versionId).
- If `contentHash` changes → regenerate vectors for new `embeddingVersion`
- Old vectors deleted or left until cleanup
