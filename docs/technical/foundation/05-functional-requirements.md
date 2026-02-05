# Noteship — Functional Requirements

## Purpose

Define what the system must do (MVP).

## Authentication

- FR-A1: User can sign up/in and obtain a session
- FR-A2: User identity available to backend (JWT authorizer)

## Notes

- FR-N1: User can create/edit/delete a note
- FR-N2: Notes are stored as Markdown in S3 under a stable path
- FR-N3: Note metadata stored in DynamoDB (title, tags, timestamps, s3Key, status)
- FR-N4: User can upload attachments; attachments stored in S3 and referenced from note content

## Semantic search

- FR-S1: User can query semantically and receive ranked results
- FR-S2: Search is per-user; no cross-user leakage
- FR-S3: Search results return note references + snippet/preview (chunk text) as available

## AI generation

- FR-G1: User can generate post drafts from a selected note
- FR-G2: User can select tone/persona and regenerate
- FR-G3: Generation is gated by plan quota

## Publishing & scheduling

- FR-P1: User can connect LinkedIn via OAuth and publish a post
- FR-P2: User can connect Medium via OAuth and publish a post
- FR-P3: User can schedule a post for later
- FR-P4: Publish/schedule runs as async jobs with retries and DLQ
- FR-P5: User can view post status (draft/scheduled/published/failed) and retry/cancel

## Plans & entitlements

- FR-E1: Backend checks entitlements for gated actions
- FR-E2: Frontend can request entitlements to adapt UI
