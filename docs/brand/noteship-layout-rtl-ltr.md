# Noteship — RTL/LTR Layout Rules (App + Marketing)
_Last updated: 2026-01-24_

## 1) Principle
**Arabic is first-class.** RTL is not a skin. Layout and typography must be designed for RTL.

## 2) Mirroring rules
### Marketing pages
- Fully mirror layout:
  - Hero alignment, image placement, section flow
- Keep icons directional:
  - arrows should flip in RTL

### App dashboard
- Mirror navigation and primary layout regions for RTL.
- Keep “technical” tokens LTR:
  - IDs, URLs, code snippets, platform names

## 3) Mixed-language content
- If a note is English inside Arabic UI, do not force RTL.
- Use proper direction wrappers and spacing around punctuation.
- Keep platform names in English (LinkedIn, Medium).

## 4) Alignment rules
- Arabic UI: right-aligned text; numbers may remain LTR
- English UI: left-aligned text
- Tables:
  - Align numeric columns consistently
  - Keep timestamps readable

## 5) Component rules
- Inputs:
  - cursor starts on the right for Arabic
- Breadcrumbs:
  - mirror order and separators
- Toggles and progress:
  - mirror direction where meaning is directional

## 6) QA checklist
- Nav ordering correct?
- Icons flipped correctly?
- Mixed English terms not breaking line wraps?
- Arabic line-height adequate?
- Punctuation rendering correct?
