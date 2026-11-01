# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm workspace monorepo (`pnpm-workspace.yaml` → `apps/*`) with two apps, both still close to their scaffolded starters:

- `apps/api` — NestJS 12 backend (Express platform), listens on `PORT` or 3000.
- `apps/web` — React 19 + Vite 8 frontend (TypeScript 7).

There are no shared packages yet, and the web app does not call the API yet (no proxy configured in `apps/web/vite.config.ts`).

## Commands

Run from the repo root (pnpm only — there is a `pnpm-lock.yaml`):

```bash
pnpm install
pnpm dev              # runs every "dev:*" script in parallel (web: vite, api: nest start --watch)
pnpm dev:web | pnpm dev:api
pnpm build            # build all apps (build:web / build:api for one)
pnpm lint             # oxlint in every app
pnpm test             # tests in apps that define a "test" script (api and web)

# Any app script via the filter shortcuts:
pnpm api test:e2e     # = pnpm --filter api test:e2e
pnpm web preview
```

API tests use **Vitest** (not Jest), with `globals: true`:

```bash
pnpm api test                                   # unit: **/*.spec.ts
pnpm api test src/app.controller.spec.ts        # single file
pnpm api test -t "should return"                # by test name
pnpm api test:e2e                               # **/*.e2e-spec.ts via vitest.config.e2e.ts (supertest)
pnpm api test:watch | test:cov
pnpm api format                                 # prettier on src/ and test/
```

## Conventions that differ from the usual defaults

- **Linting is oxlint, not ESLint**, in both apps. The API runs it type-aware (`oxlint --type-aware`, via `oxlint-tsgolint`) with `typescript/no-floating-promises` as an error; the web config enables the react/typescript/oxc plugins.
- **API is native ESM** (`"type": "module"`, `module: nodenext`): relative imports must use the `.js` extension (`import { AppService } from './app.service.js'`), and `main.ts` uses top-level `await`.
- **Web uses bundler resolution** with `allowImportingTsExtensions` and `verbatimModuleSyntax` (use `import type` for type-only imports); `tsc -b` runs before `vite build`, and `noUnusedLocals`/`noUnusedParameters` will fail the build.
- `dist/` in both apps is build output (gitignored).

## Frontend rules (`apps/web`)

Tailwind v4 is the styling library (via `@tailwindcss/vite`; design tokens live in the `@theme` block of `src/index.css`). Routing uses `react-router` (`src/App.tsx`). Tests run with Vitest (`globals: true`, jsdom, config in `vite.config.ts`) + React Testing Library: `pnpm web test`. Components that render `TextLink` need a `MemoryRouter` in tests.

### Component Structure - Atomic Design

All components live under `src/components/` and follow Atomic Design:

```
src/components/
  atoms/       # Smallest units: Button, Input, Label, Icon...
  molecules/   # Composed atoms: FormField, SearchBar...
  organisms/   # Complex sections: Header, PostCard, Sidebar...
  templates/   # Page-level layouts (no real data)
  pages/       # Full pages wired to real data/routes
```

Rules:
- A component **must not** import from a higher-level category (atoms cannot import molecules).
- Every component **must** have a co-located test file (`ComponentName.test.tsx`) covering its essential usage (render, key interactions, accessibility where applicable). Full coverage is not required.
- Use Vitest + React Testing Library for all frontend tests.

## Backend rules (`apps/api`)

### REST Principles

All API endpoints must be strictly REST-compliant.

- **Resources as nouns** in the URL, never verbs (`/posts`, not `/getPosts`).
- **HTTP verbs** map to actions: `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove).
- **Status codes** must be semantically correct: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `422`, `500`.
- **Plural resource names** for collections (`/users`, `/posts`).
- **Nested routes** only for true ownership relationships (`/users/{id}/posts`); no deeper than two levels.
- **Pagination** via query params (`?page=1&limit=20`) for collection endpoints.
- **Response envelope**: always return consistent JSON shapes; errors must include `statusCode`, `message`, and optionally `errors`.

## Git - Conventional Commits

Every commit **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification: `<type>(<optional scope>): <description>`, with types such as `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Use `!` or a `BREAKING CHANGE:` footer for breaking changes.

## Production telemetry (from `apps/api/AGENTS.md`)

The API is intended to report to NestJS Observe, but `ObserveModule` is not yet registered in `src/app.module.ts`, so nothing is sent. `npx @nestjs/observe link` wires it up and writes `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET` to `.env`. For questions about production behavior (errors, slow endpoints, regressions), prefer Observe data (its MCP server: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`) over reading the code alone.
