# Noteship — API Design & Contracts

## Purpose

Define the MVP API surface and request/response shapes (conceptual).

## Conventions

- Auth: JWT (Auth0), `userId` from token
- Validation: zod schemas in shared package
- Errors: consistent `{code, message}`

## Endpoints (MVP)

### Auth / Users

- `GET /me` get or create current user (bootstraps user record)

### Notes

- `POST /notes` create note
- `GET /notes` list notes (pagination)
- `GET /notes/{noteId}` get note (metadata + presigned S3 URL)
- `PUT /notes/{noteId}` update note
- `DELETE /notes/{noteId}` delete note

### Attachments

- `POST /notes/{noteId}/uploads` get presigned upload URL
  Body: `{ filename, contentType, sizeBytes, intent, artifactType }`
  Response: `{ uploadUrl, s3Key, artifactId, publicUrl, expiresAt }`
  The presigned URL targets a temporary S3 key under `uploads/tmp/` and expires with the upload lease. `s3Key` and `publicUrl` reference the final canonical artifact key.
- `POST /notes/{noteId}/uploads/{artifactId}/complete` verifies the temporary object, promotes it to the final artifact key, and commits storage usage.
- `POST /notes/{noteId}/uploads/{artifactId}/abandon` abandons the lease and releases reserved storage.

### Content access

- `POST /content/session` issue CloudFront signed cookies for user content
  Response: `{ ok: true }`

### Search

- `POST /search` semantic search
  Body: `{ query: string, limit?: number }`
  Response: `{ results: [{ noteId, score, preview, highlights?: [{ chunkIndex }] }] }`

### AI generation

- `POST /notes/{noteId}/drafts` generate draft(s)
  Body: `{ provider: "linkedin", tone?: string }`
  Response: `{ draftId, content }` (or stored in S3)

### Posts

- `POST /posts` create post from draft
- `PUT /posts/{postId}/draft` update draft artifact content
- `POST /posts/{postId}/publish` publish now (`mode: single|overflow_comments`)
- `POST /posts/{postId}/schedule` schedule (`timezone` optional)
- `POST /posts/{postId}/cancel` cancel scheduled
- `GET /posts` list posts and statuses

LinkedIn media validation rules (enforced before queueing):

- Allowed: text-only, text+images, text+one PDF
- Rejected: image+PDF mix, multiple PDFs, image count above configured max (`LINKEDIN_MAX_IMAGES_PER_POST`, capped to LinkedIn API max 20)
- Validation failures return typed errors (for UI handling):
  - `LINKEDIN_MEDIA_MIX_NOT_ALLOWED`
  - `LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED`
  - `LINKEDIN_TOO_MANY_IMAGES`
  - `LINKEDIN_MEDIA_INVALID`

### Integrations

- `GET /integrations` list connected providers
- `POST /integrations/{provider}/connect` start OAuth
- `POST /integrations/{provider}/callback/finalize` finalize OAuth callback from frontend route
- `POST /integrations/{provider}/disconnect` revoke

### Billing

- `POST /billing/checkout` create Stripe checkout session
- `POST /billing/portal` create customer portal session
- `POST /billing/webhook` Stripe webhook endpoint

## Idempotency

- Publish/schedule endpoints accept `Idempotency-Key` header (recommended)
- Worker jobs enforce idempotency using `postId` + `provider` + `action`
