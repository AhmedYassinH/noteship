# Proposal: Native Arabic + English Support (Bilingual UX)

## Objectives
- Deliver a first-class experience in both Arabic and English with a user toggle.
- Respect RTL/LTR layout, typography, and input expectations across dashboard, landing (SSG), editor, and outputs (posts/notes).
- Keep implementation minimal but extensible for future locales.

## Scope
- UI copy and navigation (landing + dashboard)
- Layout/direction handling (RTL/LTR)
- Typography and readability
- TipTap editor behavior
- Content storage, rendering, and publishing
- Search/AI generation considerations

## User experience & toggling
- Add a language toggle in the top-level UI (persist in user profile + localStorage).
- Default language based on browser `navigator.language`, fall back to English.
- Store preferred language on the user profile to sync across devices.
- Surface language in URLs for landing SSG if desired (`/ar` vs `/en`), or serve by Accept-Language header with static locales.

## Frontend implementation
- Use an i18n library (e.g., `next-intl` or `next-i18next`) for static content; keep runtime bundle small with per-locale JSON.
- Annotate root HTML with `lang` and `dir` per locale:
  - English: `<html lang="en" dir="ltr">`
  - Arabic: `<html lang="ar" dir="rtl">`
- Prefer CSS logical properties so layout adapts automatically:
  - `padding-inline`, `margin-inline`, `inset-inline`, `text-align: start|end`, `float: inline-start|inline-end`.
- Components:
  - Navigation and icons should mirror in RTL (e.g., chevrons flip via CSS `transform: scaleX(-1)` or `direction` rules).
  - Keep icons/numbers readable: align numerals LTR even inside RTL blocks when needed (e.g., code snippets, timestamps).
- Typography choices (pairings that cover Arabic + Latin):
  - Sans: `Cairo`, `IBM Plex Sans Arabic`, `Noto Sans Arabic`, paired with `Space Grotesk` or `Inter` for Latin if needed.
  - Use `font-feature-settings` and `font-variant-ligatures: normal` to preserve Arabic ligatures.
  - Ensure fallback stack includes a quality Arabic font on systems: `system-ui, "Segoe UI", "Cairo", "Noto Sans Arabic", sans-serif`.
- Spacing and line-height:
  - Increase line-height slightly for Arabic script (e.g., 1.6) for readability.
  - Avoid tight letter-spacing on Arabic text.

## TipTap editor considerations
- Direction per block: enable RTL/LTR marks or attributes so mixed content renders correctly (e.g., headings RTL, code blocks LTR).
- Use TipTap’s `TextAlign` and a direction plugin (`dir` attribute per node or custom extension) to set `direction: rtl` at block level.
- Default direction derives from note language; allow per-block overrides for mixed-language notes.
- Input handling:
  - Keep keyboard shortcuts mirrored where appropriate; ensure undo/redo and selection behavior respect RTL text.
  - Ensure paste sanitization preserves direction marks from source when present.
- Styling:
  - Apply CSS logical properties in editor content styles (`padding-inline`, `margin-inline`).
  - Code blocks and inline code should stay LTR with monospace Latin fonts.
- Serialization:
  - When exporting to Markdown, persist language metadata (frontmatter `lang: ar|en`) for later rendering.
  - Preserve `dir` attributes when rendering HTML (for previews and publishing).

## Content, storage, and rendering
- Add `language` field to note metadata and posts (e.g., `ar`, `en`).
- Rendering:
  - Set `lang` and `dir` on note/article containers.
  - For SSG landing: build per-locale pages or use a locale switcher that changes `lang/dir` and content JSON.
- Email/notifications (future): use locale templates.

## AI, search, and embeddings
- Choose embedding/generation models that support Arabic well (e.g., multilingual embeddings like `text-embedding-3-large` or Bedrock Titan Multilingual; for LLM generation consider GPT-4o-mini or Claude with Arabic support).
- Normalize Arabic text before embedding/search:
  - Handle diacritics removal for search robustness.
  - Normalize different forms of alef/yeh (optional).
- Store language with each embedding chunk to allow language-aware ranking if needed.
- Generation prompts must include language instructions and tone in the user’s selected language; preserve RTL text in outputs.

## Publishing and integrations
- When publishing to LinkedIn/Medium, set post body and title with correct `lang` metadata if supported; ensure text is already directionally correct.
- UI copy for integration flows should respect locale; vendor OAuth pages may stay English but our wrappers should be localized.

## Testing checklist
- Toggle language persists across reloads and devices.
- RTL layout mirrors correctly: nav, sidebars, accordions, pagination arrows, breadcrumbs.
- Mixed content in TipTap: Arabic paragraphs with English code blocks, lists, inline links.
- Export/import flows preserve `lang` and `dir`.
- Search results return Arabic content accurately; snippets render RTL.
- Publishing to LinkedIn/Medium preserves text direction.
- Typography renders legibly on Windows/Android/iOS (verify fallbacks).

## Risks & mitigations
- Font fallback quality: pick bundled webfonts for Arabic to avoid poor defaults.
- Mixed-direction bugs in editor: test with seed content; consider a custom TipTap extension for block-level `dir`.
- Embedding model quality in Arabic: validate with sample Arabic corpus; switch to stronger multilingual embeddings if recall is poor.
- Performance: avoid loading both font families if not needed; load per-locale subsets via CSS.
