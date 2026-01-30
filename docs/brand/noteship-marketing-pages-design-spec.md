# Noteship — Public-facing Pages Design Spec (Modern Editorial, Subtle)

_Last updated: 2026-01-28_

## 0) Purpose

Define how Noteship’s **public pages** (landing/pricing/legal/docs-style pages) should look and feel, in **Arabic + English**, with a **modern editorial** aesthetic that matches the product’s calm, professional identity.

This spec is intended for:

- Designers
- Frontend engineers
- AI UI generators / implementers

---

## 1) Brand intent for public pages

### The feeling

- Calm confidence
- “Editorial clarity”
- Professional, not corporate
- Minimal, not empty

### What we deliberately avoid

- Loud gradients and neon accents
- “AI magic” visuals or robot imagery
- Overly playful vibe
- Card-heavy clutter

---

## 2) Typography (public pages)

### Locked font roles

**Headlines (EN):** Lora  
**Headlines (AR):** Noto Naskh Arabic  
**Body/UI (EN):** IBM Plex Sans  
**Body/UI (AR):** IBM Plex Sans Arabic

### Non-negotiable rules

- Serif fonts are **headlines only** (H1/H2/H3).
- All UI elements (buttons, nav, pricing tables, forms) use IBM Plex Sans/Arabic.
- Do not mix serif + sans in a single headline line.

### Hierarchy (suggested)

- H1: Lora 600, 40–52px, LH 1.1–1.2
- H2: Lora 600, 28–36px, LH 1.15–1.25
- H3: Lora 600, 20–24px, LH 1.2–1.3
- Body: Plex 400, 16–18px, LH 1.6–1.8 (AR: 1.7–1.9)
- Small/caption: Plex 400, 13–14px

### Arabic headline note

Noto Naskh Arabic should feel **editorial and refined**, but avoid extreme bold.

---

## 3) Layout & composition

### Grid

- Use a clean grid (12-column or equivalent).
- Prefer generous margins and consistent section padding.

### Spacing rhythm

- Editorial rhythm: sections breathe.
- Avoid stacking too many elements above the fold.

### Recommended section patterns

- Hero (headline + subhead + CTA + product shot)
- Problem statement
- How it works (**Note → Recall → Repurpose → Publish/Schedule**)
- Feature pillars (3)
- Screenshots
- Pricing
- FAQ
- Final CTA

### RTL/LTR behavior

- Arabic pages are fully RTL mirrored.
- Keep product/platform names in English where needed (LinkedIn, Medium, Noteship).

---

## 4) Color & visual language

### Palette philosophy

- Neutrals-first.
- One restrained accent for primary CTAs.
- Color supports meaning, not decoration.

### Backgrounds

- Prefer clean light background with subtle surface variation (“paper-like”).
- Avoid heavy textures or noise.

### Borders and depth

- Thin borders, subtle shadows.
- Use depth sparingly; avoid “card spam”.

---

## 5) Imagery & illustration

### Preferred

- Real product screenshots
- Simple line diagrams (workflow)
- Subtle editorial motifs (optional)

### Avoid

- Cartoon mascots
- Generic “AI robot” art
- Heavy 3D blobs

---

## 6) Components (marketing)

### Buttons

- Primary: solid accent
- Secondary: outline
- Tertiary: text/ghost

Rules:

- Short labels (“Start free”, “See how it works”)
- No serif in buttons

### Links

- Editorial link style (underlined on hover)
- Keep link color accessible

### Cards

- Use only for:
  - pricing plans
  - testimonials
  - feature highlights

Keep spacing generous.

### FAQ

- Accordion style
- Clear typography, no dense blocks

---

## 7) Copy style (public pages)

- Headline: promise + clarity
- Subhead: explain in one sentence
- Avoid hype and “growth hacks”
- Prefer concrete benefits:
  - recall by meaning
  - repurpose notes into drafts
  - publish reliably

Arabic:

- Clear MSA, modern phrasing, short lines.

---

## 8) Implementation notes (frontend)

### Tokens

Define tokens for:

- font families (headline vs body)
- spacing scale
- border radius
- shadows (one or two levels max)

### Don’t-break rules

- No Lora in dashboard.
- No Lora in nav/buttons/forms.
- Arabic line-height must not be compressed.

### Responsive

- Scale H1/H2 down smoothly on mobile
- Arabic wraps sooner; test on narrow widths

---

## 9) QA checklist

- Arabic pages mirrored correctly?
- Headline serif applied only where intended?
- Arabic line-height comfortable?
- Mixed English terms render correctly in RTL?
- CTAs consistent across pages?
