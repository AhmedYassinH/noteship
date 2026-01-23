# Noteship Agent Instructions (Source of Truth)

These documents define product intent and system design. Follow them before making changes.

## Source-of-truth docs (read first)
- `docs/noteship-product-definition.md`
- `docs/noteship-system-architecture.md`
- `docs/noteship-low-level-design.md`
- `docs/detailed/*.md` for expanded specs
- `docs/brand/*.md` for language, typography, and RTL/LTR rules

## Priority order when resolving conflicts
1. Product definition
2. System architecture (HLD)
3. Low-level design (LLD)

## Guardrails to prevent drift
- Treat the docs above as authoritative. If code or prototypes disagree, the docs win.
- If a requested change conflicts with the docs, pause and ask to update the docs first.
- Keep scope aligned to the MVP features and non-goals as defined in the product doc.
- When implementing or refactoring, align storage, APIs, and flows to the HLD/LLD.
- Apply bilingual/RTL rules from brand docs: Arabic and English are first-class; mirror layouts for RTL and use approved fonts/voice.
- If a new decision is made, update the relevant doc in `docs/` in the same change set.
- Keep dependencies minimal; add new packages only when they unlock required MVP behavior.
