# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm workspace monorepo (`pnpm-workspace.yaml` → `apps/*`) with two apps:

- `apps/api` — NestJS 12 backend (Express platform), listens on `PORT` or 3000. Persists users, posts, likes and comments in Postgres through Drizzle ORM (`src/database/`, schema in `src/database/schema.ts`). Post search is Postgres full text (`posts.search_vector`, a generated column that needs the functions from migration `0001_search_functions`). Reads are public (`OptionalAuthGuard`); writes need a JWT (`AuthGuard`). Thumbnails are stored in `UPLOADS_DIR` (default `uploads/`, gitignored) and served at `/uploads`.
- `apps/web` — React 19 + Vite 8 frontend (TypeScript 7). `/feed`, `/posts/:id` and `/publicar` share `MainTemplate` through a layout route; `useSession` exposes the login state without a Provider.

There are no shared packages yet. The web app calls the API with axios through `apps/web/src/services/`; `VITE_API_URL` defaults to `/api`, which the proxy in `apps/web/vite.config.ts` forwards to `http://localhost:3000` without the prefix.

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

# Database (Postgres 18 via Docker Compose, named volume `postgres_data`)
docker compose up -d      # then copy apps/api/.env.example to apps/api/.env
pnpm api db:generate      # drizzle-kit: new migration in apps/api/drizzle/ after editing schema.ts
pnpm api db:migrate       # apply migrations to DATABASE_URL
pnpm api db:seed          # mock authors and posts; safe to rerun, only recreates the posts of *@codeconnect.dev (password: senha12345)
```

API tests use **Vitest** (not Jest), with `globals: true`. They need no Docker: specs and e2e tests run on in-memory PGlite via `apps/api/test/create-test-database.ts`, which applies the real migrations; e2e overrides the `PG_POOL` and `DRIZZLE` providers with it. `DATABASE_URL` is read inside the provider factory (after `main.ts` loads `.env`), never at import time.

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

### Colors and font sizes

Never write hex values or arbitrary font sizes (`text-[15px]`, `bg-[#888]`) in classes. Everything comes from the `@theme` block of `src/index.css`:

- **Colors have two layers.** The *palette* (`grafite`, `cinza-escuro`, `cinza-medio`, `verde-destaque`, `verde-petroleo`, `offwhite`, `vermelho-erro`) is the only place hex values live. The *semantic roles* (`bg`, `card`, `input`, `primary`, `on-primary`, `error`) point to the palette via `var(--color-*)`, and components should use the roles (`bg-primary`, `text-on-primary`). Use a palette color directly only when no role fits (e.g. `text-offwhite`, `bg-offwhite`).
- **A new color** is added to the palette first; add a semantic role only if it has a recurring purpose.
- **Font sizes use the default Tailwind scale** (`text-xs`, `text-sm`, `text-lg`, `text-2xl`, `text-3xl`...). When the Figma size has no exact token, pick the closest one instead of customizing: 31px → `text-3xl`, 22px → `text-2xl`, 15px → `text-sm`, 12.5px → `text-xs`. Do not add `--text-*` tokens to the theme.

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
