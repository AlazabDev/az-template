# Architecture Guide

## Scope of the current core

The repository currently contains a focused web application core:

- Public company website and content pages.
- Authentication, profiles, protected routes, and admin routes.
- Projects, project details, and project file storage.
- Quotations, messaging, chatbot, WhatsApp, and content administration.
- Legal, SEO, and public navigation pages.

The retired maintenance-request, receipts-review, legacy service pages, and legacy project-gallery modules are intentionally not part of this core. Their old routes and implementation files must not be restored as a shortcut for a new feature.

## Source boundaries

```text
src/
  app/                 Application-wide providers and routing (when introduced)
  components/ui/       Reusable visual primitives
  components/shared/   Cross-domain presentation components
  domains/             New business capabilities; each domain owns its UI, API, hooks, and types
  integrations/        External services such as Supabase
  hooks/               Existing shared hooks; new domain hooks belong in the domain
  lib/                 Stateless utilities and cross-cutting helpers
  pages/               Route entry points; keep them thin
  types/               Shared types only
```

New capabilities should be implemented as a vertical slice under `src/domains/<domain>` rather than adding unrelated files to global folders. Existing code may be migrated gradually when it is touched.

## Data and security rules

1. Supabase access goes through the central client/configuration layer or a domain API module.
2. Browser code may use only publishable/public configuration. Service-role keys belong only in server-side or Supabase Edge Function environments.
3. Every new database table requires a migration, appropriate RLS policies, typed access, and a smoke/integration test.
4. UI visibility is not authorization. Protected routes and database policies must enforce access independently.
5. Loading, empty, error, and success states are required for every data-backed screen.
6. Do not add compatibility aliases or restore deleted modules without a documented product requirement.

## Delivery sequence for new features

For each feature, deliver this sequence together:

1. Domain model and database migration.
2. RLS and permission contract.
3. Domain API and typed hooks.
4. Route/page and UI states.
5. Tests and documentation.
6. CI validation and a small, reviewable commit.

The first planned domain is `projects`, followed by role-based access and project activity/audit history.
