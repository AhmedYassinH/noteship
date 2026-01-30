# Plan: Web Alignment With Product + Brand

_Created: 2026-01-30_
_Updated: 2026-01-30_

## Implementation Status: IN PROGRESS

## 1) Goal

Align the Noteship web app (marketing + dashboard) with the updated product and brand docs, removing technical jargon and fixing RTL dashboard sidebar placement for Arabic users.

---

## 2) Scope

### In scope

- Update marketing copy to match the 3-step promise (Recall -> Repurpose -> Publish) and brand tone.
- Remove technical implementation jargon from public pages and dashboard UI copy.
- Fix RTL mirroring in the dashboard so the sidebar appears on the right for Arabic.
- Ensure Arabic copy follows bilingual/RTL guidelines.

### Out of scope

- Backend/API changes.
- New features or changes beyond copy and RTL layout alignment.
- Visual redesign beyond copy and RTL layout rules.

---

## 3) References (must align)

- [noteship-system-architecture.md](../technical/noteship-system-architecture.md)
- [noteship-low-level-design.md](../technical/noteship-low-level-design.md)
- [noteship-product-definition.md](../noteship-product-definition.md)
- [noteship-brand-foundation.md](../brand/noteship-brand-foundation.md)
- [noteship-messaging.md](../brand/noteship-messaging.md)
- [noteship-language-guidelines.md](../brand/noteship-language-guidelines.md)
- [noteship-layout-rtl-ltr.md](../brand/noteship-layout-rtl-ltr.md)
- [noteship-typography.md](../brand/noteship-typography.md)
- [noteship-marketing-pages-design-spec.md](../brand/noteship-marketing-pages-design-spec.md)

---

## 4) Technical decisions

- Keep copy localized in `apps/web/data/*` as `{ en, ar }` objects.
- Use RTL mirroring via logical CSS properties and `.rtl` root class.
- Replace technical terms with outcome-driven language from messaging docs.

---

## 5) Files to change (overview)

- `apps/web/app/layout.tsx`
- `apps/web/data/landing.ts`
- `apps/web/data/marketing-home.ts`
- `apps/web/data/marketing-features.ts`
- `apps/web/data/marketing-shared.ts`
- `apps/web/data/dashboard.ts`
- `apps/web/app/dashboard/dashboard.module.css`

---

## 6) Implementation plan (step-by-step)

### Phase A - Preparation

- [x] **A1** Re-scan marketing and dashboard copy for technical jargon and misaligned language.
- [x] **A2** Map updated messaging pillars to the existing sections to keep structure stable.

### Phase B - Core changes

- [x] **B1** Update marketing copy to match the 3-step promise and brand tone (EN + AR).
- [x] **B2** Update dashboard copy to remove technical phrasing (EN + AR).
- [x] **B3** Fix RTL layout: move dashboard sidebar to the right in Arabic; mirror split panels where needed.
- [x] **B4** Update global metadata description to align with product definition.
- [x] **B5** Polish UI: add sidebar toggle icon, fix RTL toggle order, and resolve footer overlay.

### Phase C - Validation & QA

- [x] **C1** Run `pnpm prettier --write .`.

---

## 7) Risks & mitigations

| Risk                                | Mitigation                                  |
| ----------------------------------- | ------------------------------------------- |
| Arabic copy reads awkwardly         | Keep MSA short, follow language guidelines. |
| RTL mirroring regresses other areas | Validate sidebar and panel layout in RTL.   |
| Marketing copy loses clarity        | Validate against messaging pillars and JTBD |

---

## 8) Success criteria

- [ ] Marketing pages contain no technical implementation jargon.
- [ ] Dashboard copy is aligned with recall/repurpose/publish messaging.
- [ ] Arabic dashboard sidebar appears on the right with mirrored layout.
- [ ] EN/AR copy adheres to brand tone and bilingual rules.

---

## 9) Estimated effort

| Phase | Estimate |
| ----- | -------- |
| A     | 20 min   |
| B     | 60 min   |
| C     | 20 min   |
| Total | ~1.5 hr  |
