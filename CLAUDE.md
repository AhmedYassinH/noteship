# Noteship Agent Instructions (Source of Truth)

These documents define product intent and system design. Follow them before making changes.

## Source-of-truth docs (read first)

- `docs/technical/noteship-system-architecture.md`
- `docs/technical/noteship-low-level-design.md`

## Priority order when resolving conflicts

1. System architecture (HLD)
2. Low-level design (LLD)

## Guardrails to prevent drift

- Treat the docs above as authoritative. If code or prototypes disagree, the docs win.
- If a requested change conflicts with the docs, pause and ask to update the docs first.
- Keep scope aligned to the MVP features and non-goals as defined in the HLD/LLD.
- When implementing or refactoring, align storage, APIs, and flows to the HLD/LLD.
- Apply bilingual/RTL rules as defined in the LLD (see the bilingual/RTL section).
- If a new decision is made, update the HLD/LLD in the same change set.
- Keep dependencies minimal; add new packages only when they unlock required MVP behavior.
- After code or doc changes, run `pnpm prettier --write .` to keep formatting consistent.

## Commit conventions

- DO NOT add "Co-Authored-By: Claude" to commit messages.
- Use the `/noteship-contrib` skill for all commits to ensure proper workflow and quality gates.

## Repo skills (Claude Code)

Skills live in `.claude/skills/` and are automatically available in Claude Code sessions via the `/skill` command or by invoking them directly.
