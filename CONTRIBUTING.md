# Contributing

## Before changing code

- Confirm that the feature belongs to the current application core.
- Search for existing routes, hooks, types, and Supabase queries before creating new ones.
- Do not restore files removed during the cleanup unless the product requirement explicitly needs that capability.

## Feature structure

New business features belong under `src/domains/<feature>` with clear boundaries:

```text
src/domains/<feature>/
  api/
  components/
  hooks/
  pages/
  types.ts
```

Keep route entry points thin. Presentation components should not contain unrelated data access, and data access should not be duplicated between pages.

## Required quality checks

Run these commands before pushing:

```bash
pnpm run type-check
pnpm run lint
pnpm run quality:check
pnpm run test:ci
pnpm run build
```

The CI workflow runs the same checks for the frontend.

## Database changes

Every database change must include:

- A versioned Supabase migration.
- RLS policies and a clear role/permission decision.
- Updated generated types when the schema changes.
- A test or smoke assertion for the critical behavior.

## Security

- Never commit `.env` or secret values.
- Never expose service-role keys to Vite/browser code.
- Use the central Supabase configuration module for public client configuration.
- Treat a hidden button as presentation only; authorization belongs in route guards and RLS.

## Commits

Use focused commits with an imperative subject, for example:

```text
feat: add project member permissions
fix: handle empty project file listings
refactor: move project queries into the projects domain
```
