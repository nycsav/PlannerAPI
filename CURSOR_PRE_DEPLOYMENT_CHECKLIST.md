# Cursor Pre-Deployment Checklist

Manual verification before deploying PlannerAPI.

## 1. Files exist with correct content

- [ ] `functions/src/generateDiscoverCards.ts` – Notion integration, HTTP trigger
- [ ] `functions/src/index.ts` – Exports generateDiscoverCards
- [ ] `docs/NOTION-INTEGRATION-DEPLOYMENT.md` – Deployment instructions

## 2. TypeScript compiles cleanly

```bash
cd functions && npm run build
```

- [ ] No TypeScript errors

## 3. Database IDs match Notion

- [ ] Notion database ID in `generateDiscoverCards.ts`: `2fa0bdffe59e80049d52c6171ae1630d`
- [ ] Matches your PlannerAPI Research Inbox database

## 4. Environment variables set

```bash
firebase functions:config:get
```

- [ ] `notion.api_key` – Notion integration secret
- [ ] `anthropic.api_key` – Anthropic API key

## 5. No debug code left behind

- [ ] No `console.log` with sensitive data
- [ ] No hardcoded API keys
- [ ] No `debugger` statements

## Deploy command

For generateDiscoverCards (Notion integration):

```bash
firebase deploy --only functions:generateDiscoverCards --project plannerapi-prod
```
