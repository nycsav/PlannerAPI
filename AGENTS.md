# AGENTS.md — PlannerAPI (plannerapi-clean)

## Primary objective
Redesign and iterate on the FRONTEND UX (Vite + React + TS) while keeping ALL existing backend code unchanged unless I explicitly ask otherwise.

## Hard guardrails (DO NOT VIOLATE)
- Do NOT edit backend/runtime code unless I explicitly request it:
  - `functions/**` (Cloud Functions)
  - `firestore.rules`, `firestore.indexes.json` (Firestore security/indexes)
  - `.github/**` (CI/CD)
  - Any `.env*` files, secrets, service accounts, or API keys
- Do NOT run deploy commands unless I explicitly approve (e.g., `firebase deploy`, `gcloud`, etc.).
- Do NOT rename Firestore collections (e.g., `discovercards` stays `discovercards`).

## What you ARE allowed to change
- Frontend only:
  - `src/**`
  - `index.html`, `vite.config.*`
  - UI components, CSS/Tailwind usage, page layout, onboarding flows
- If needed for frontend build only:
  - `package.json` dependency changes (ASK FIRST before adding any new dependency)

## Tech + design constraints (PlannerAPI)
- Audience: CMOs / VP Marketing / senior marketing & CX leaders (low patience, high standards).
- Style: executive intelligence console; “signal over noise.”
- Accessibility: WCAG AA contrast, visible focus states, keyboard navigation, semantic headings.
- Motion: avoid decorative animations; keep only functional hover/focus/active feedback.
- Maintain scannability: clear hierarchy, short sections, credibility cues (sources, recency).

## Workflow
1) Before making multi-file changes, propose a 3–6 bullet plan and wait for confirmation.
2) Prefer small, reviewable diffs.
3) Use a Git worktree / isolated branch for redesign variants; do not touch `main` directly.

## Verification (must do before saying “done”)
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev` smoke test (no obvious console errors on load)
