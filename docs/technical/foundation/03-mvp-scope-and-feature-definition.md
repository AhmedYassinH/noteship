# Noteship — MVP Scope & Feature Definition

## Purpose

Define MVP features precisely and prevent scope creep.

## MVP Feature List

### 1) Authentication & account

- Sign up/sign in
- User profile basics
- Plan state visible (free/paid)

### 2) Notes

- Create/edit/delete notes
- TipTap editor
- Autosave (client-side throttled)
- Attach files (S3)
- Export note as Markdown

### 3) Semantic search

- Semantic search across all user notes
- Results return relevant notes (no in-note highlighting in MVP)

### 4) AI content generation

- Generate LinkedIn draft(s) from a note
- Tone/persona selection
- Regenerate/refine

### 5) Publishing integrations

- Connect LinkedIn (OAuth) and publish posts
- Future connectors are out of MVP scope

### 6) Scheduling

- Schedule posts
- Cancel/edit scheduled posts
- Retry failed publishes

### 7) Plans & limits

- Feature gating (e.g., scheduling only paid)
- Quotas (e.g., AI generations per month)

## Explicitly out of scope (MVP)

- Analytics dashboards
- Teams/workspaces
- Collaboration features
- “Block-level” in-note semantic highlight/jump

## MVP Assumptions

- Solo users: tenant = user
- Low initial traffic
- Cost efficiency prioritized over premature scaling
