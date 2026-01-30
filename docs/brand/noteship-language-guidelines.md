# Noteship — Bilingual Language & Tone Guidelines (EN/AR)

_Last updated: 2026-01-28_

## 1) Principles

- **Meaning-first, not literal translation.**
- **Calm, professional voice** across both languages.
- Prefer **short sentences**; avoid stacked clauses.
- Avoid slang and “internet-y” tone.

## 2) English (EN) voice rules

- Friendly-professional, concise, direct.
- Use concrete outcomes and verbs:
  - “Recall”, “Repurpose”, “Publish”, “Schedule”, “Export”
- Prefer active voice.
- Avoid marketing fluff.

## 3) Arabic (AR) voice rules

- **Modern Standard Arabic (MSA), simplified** (clear, not overly formal).
- Prefer common modern terms:
  - “ملاحظة” (note), “مسودة” (draft), “نشر” (publish), “جدولة” (schedule)
  - “استرجاع” (recall), “تحويل إلى مسودة” (repurpose into a draft)
- Avoid archaic phrasing and heavy ornamentation.
- Keep UI microcopy short.

## 4) Translation guidelines

- Translate intent and clarity first.
- Keep product terms consistent:
  - Noteship (brand) stays **Noteship** (not translated)
  - LinkedIn / Medium remain in English within Arabic UI when needed.

## 5) RTL/LTR mixing rules

- For Arabic UI with embedded English terms, keep:
  - English brand/platform names in English
  - Wrap code-like tokens in monospace (if shown)
- Avoid long English phrases inside Arabic sentences. Prefer:
  - Arabic sentence + short English term.

## 6) Microcopy do/don’t

Do:

- “تم الحفظ”
- “إنشاء مسودة”
- “جدولة النشر”
- “استرجاع فكرة”
  Don’t:
- Long explanations in buttons
- Exclamation-heavy tone

## 7) Error message style

- State what happened
- State what user can do
- Offer retry if relevant

Example:

- EN: “Publishing failed. Check your connection and try again.”
- AR: “فشل النشر. تحقّق من الاتصال ثم أعد المحاولة.”

## 8) AI output language guidance

- Respect the user’s selected language.
- If note language is Arabic, default the draft to Arabic unless user overrides.
- Never mix languages in a single draft unless requested.
