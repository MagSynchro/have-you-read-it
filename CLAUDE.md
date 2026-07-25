# CLAUDE.md — Have You Reddit?

This file governs how Claude Code works in this repository. Its scope is two features only:

1. **Unit test coverage** for the existing React/Redux codebase (Vitest + React Testing Library).
2. **A working Netlify deployment** — now a pure static site (see the amendment below for why).

Everything here follows **Spec-Driven Development (SDD)**, spec-kit style: nothing beyond a trivial fix gets implemented without a `spec.md` → `plan.md` → `tasks.md` chain living in version control. Treat this document as the constitution's entry point and the source of truth for project-specific constraints spec-kit's generic templates don't know about.

---

## 1. Project snapshot (read this before doing anything)

**Stack:** React 19 + Redux Toolkit + React Router 7, built with Vite 7, deployed to Netlify as a **static site**. No backend, no database, no auth, no serverless function, no external network call at runtime.

**Where the data comes from:** `src/data/demoData.js` — a bundled set of synthetic, Reddit-shaped sample posts/comments/subreddits, invented for this project, not scraped from real Reddit. `src/utils/redditFetch.js` reads from it directly (same call signature and return shapes Reddit's own JSON API would produce, so `postsSlice.js`/`Post.jsx`/`Search.jsx` don't know or care that the data isn't live).

> **Amendment history (see `specs/002-netlify-production-deploy/`, `specs/003-reddit-oauth-access/`, `specs/004-static-demo-data/` for the full record):** This project went through three architectures for Reddit access before landing here. (1) Originally: Reddit's unauthenticated JSON endpoints, proxied via a Vite dev proxy and a Netlify Function in prod. That Netlify Function also had a latent bug — `import fetch from "node-fetch"` with `node-fetch` never added to `package.json`, which broke every deploy via a bundler failure — fixed in Feature 002 by switching to the runtime's native `fetch`. (2) Fixing that surfaced a deeper wall: Reddit blocks unauthenticated requests from datacenter/server IPs outright (confirmed via direct `curl`, independent of app code) — exactly the class of host Netlify Functions run on. Feature 003 switched to a Reddit "script" app using `client_credentials` (app-only) OAuth. (3) That in turn hit a second wall: Reddit no longer offers self-serve OAuth app registration for an independently-hosted external client — new registrations are funneled toward Devvit (Reddit's own in-platform app hosting), which doesn't fit a project meant to showcase a *Netlify* deployment. Feature 004 resolved this by dropping live Reddit access entirely in favor of the bundled demo dataset described above. This also retroactively explains most of the "CORS" struggles visible in this repo's early commit history — the underlying problem was never actually CORS.

**Do not** attempt to reintroduce any live Reddit access — unauthenticated, OAuth, or otherwise — without a new spec that documents why the datacenter-IP block and the OAuth-registration wall no longer apply. That's out of scope (see §6).

### Known issues to resolve as part of this work (not optional cleanup)

- `src/components/ErrorMessage.jsx` and `src/components/LoadingSpinner.jsx` are empty files, unused anywhere in the app. Leave them out of both features' scope unless a spec explicitly calls for implementing them — don't write tests against empty files, and don't delete them without asking first since they may be intentional placeholders for later work.
- `src/pages/Search.jsx` has a typo, `"No rsults found."` — fine to fix opportunistically while touching that file for tests, not worth its own spec.

---

## 2. SDD workflow (spec-kit conventions)

Directory layout this repo uses:

```
.specify/
  memory/
    constitution.md
specs/
  001-unit-test-coverage/
    spec.md
    plan.md
    tasks.md
  002-netlify-production-deploy/
    spec.md
    plan.md
    tasks.md
  003-reddit-oauth-access/       (abandoned — kept as historical record, see spec.md status note)
    spec.md
    plan.md
    tasks.md
  004-static-demo-data/          (current architecture for Reddit data access)
    spec.md
    plan.md
    tasks.md
```

If `.specify/memory/constitution.md` doesn't exist yet, create it first using §3 below verbatim as the starting content (edit only if the user directs a change — don't silently rewrite principles). If the `specs/` feature folders don't exist, create them via the sequence below before writing any implementation code.

**Per feature, in order, one gate at a time:**

1. **`spec.md`** — what and why, in user/behavior terms. No tech stack talk, no file names. Sections: Overview, User Scenarios & Testing, Functional Requirements (numbered, testable), Non-Functional Constraints, Out of Scope, Acceptance Criteria. Stop and surface this to the user before moving on if anything is ambiguous — don't guess at requirements that materially change scope.
2. **`plan.md`** — the technical approach. Sections: Technical Context (stack, dependencies touched), Constitution Check (does this violate any principle in §3? if so, justify or stop), Project Structure (files added/changed), Phase 0 Research (open questions + resolutions, e.g. the node-fetch decision above), Phase 1 Design (test strategy, mocking strategy, config changes).
3. **`tasks.md`** — an ordered, numbered checklist (`T001`, `T002`, ...), grouped by phase, with `[P]` marking tasks safe to run in parallel (touch disjoint files, no shared state). **Tests are their own tasks and come before the implementation tasks they cover** — this is the TDD gate, not a suggestion. Check tasks off as they're completed; don't batch-complete without running them.
4. **Implementation** only starts once `tasks.md` exists. Work the list in order. For any task that adds or changes logic (not pure config), write the failing test first, watch it fail for the right reason, then implement.
5. Before declaring a feature done, re-run the full test suite and the build, then update the Acceptance Criteria checklist in that feature's `spec.md` to reflect actual status — don't mark criteria met that weren't verified.

---

## 3. Constitution

Place this in `.specify/memory/constitution.md` if it doesn't already exist.

1. **Test-first (NON-NEGOTIABLE).** No new or changed logic — reducers, thunks, utils, component behavior — lands without a Vitest test written before or alongside it. Pure-config or pure-markup changes are exempt.
2. **No live external data access.** *(Amended 2026-07-25, final revision — see spec 004-static-demo-data. Full history in §1 above: originally a Netlify Function proxying unauthenticated Reddit endpoints; briefly amended to signed `client_credentials` OAuth per spec 003; both hit hard walls outside this project's control.)* The app runs entirely on the bundled synthetic dataset in `src/data/demoData.js`. No network call to `reddit.com` or any Reddit-owned domain, client-side or server-side, in dev or prod. Do not reintroduce a live Reddit fetch of any kind without a new spec documenting why the datacenter-IP block and the OAuth-registration wall no longer apply.
3. **Spec before code.** Anything beyond a one-line typo or comment fix goes through spec → plan → tasks as described in §2.
4. **Deployability.** `main` must always be buildable and deployable to Netlify as a static site: `npm run build` succeeds, `netlify.toml` stays valid.
5. **Simplicity.** Don't introduce new state management, new routing, or new infra beyond what's already here (Redux Toolkit, React Router, Vite) without that being the explicit subject of a spec.

---

## 4. Feature 1 — Unit test coverage

**Framework decision:** Vitest + React Testing Library, not Jest. Vitest reads config directly from `vite.config.js`, needs no Babel/ESM shims for this Vite + React 19 + ESM setup, and is API-compatible with Jest (`describe`/`it`/`expect`). Update `README.md`'s "Technologies Used" section from Jest to Vitest as part of this feature — don't leave the docs contradicting reality.

### Setup tasks (belong in `002...`'s — no, `001-unit-test-coverage`'s — `tasks.md`)

- Add devDependencies: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- Add a `test` block to `vite.config.js`:
  ```js
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  }
  ```
- Create `src/test/setup.js` importing `@testing-library/jest-dom`.
- Add `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`.
- Colocate tests next to source as `*.test.jsx` / `*.test.js` (e.g. `src/utils/helpers.test.js`), matching this codebase's existing per-file organization rather than a separate `__tests__` tree.

### Coverage map — what needs tests and what to watch for

Pure logic (highest value, test these thoroughly):
- `src/utils/helpers.js` — `formatNumber` (boundary cases: <1000, 1000, 999999, 1000000, billions; also that it returns a number, not a string, for <1000 — that's a real quirk in the current code, worth asserting explicitly rather than silently "fixing"), `removeAmp` (including `null`/`undefined`/empty-string input).
- `src/utils/redditFetch.js` — all branches against the bundled `demoData.js` dataset: subreddit listing + each sort variant (`hot`/`new`/`top`/`best`), pagination (`after` cursor advancing and returning `null` once exhausted), post+comments lookup (including the "unknown postId" fallback), search (matching and non-matching), and an unknown-subreddit listing returning empty rather than throwing. No network mocking needed — it's pure data-shaping logic now.
- `src/features/posts/postsSlice.js` — reducer behavior for `pending`/`fulfilled`/`rejected`, the `fetchPosts` thunk's payload shaping (mock `redditFetch`), and all four selectors.
- `src/features/subreddits/subredditsSlice.js` — `addVisitedSubreddit`: dedup-and-move-to-end behavior, the 10-item cap/shift, and case-insensitivity (`toLowerCase()`).

Components (mount with the dependencies they actually need — most need `MemoryRouter`, several need a Redux `Provider`):
- `Breadcrumbs`, `FilterBar`, `Pagination`, `SearchResults`, `Comment` (including the image/video/link URL-splitting branches and recursive replies), `PostCard` (thumbnail validity logic — `self`/`default`/`nsfw`/`spoiler`/non-`http` should all suppress the thumbnail), `SearchBar` (submit navigates with encoded query, empty/whitespace submit does nothing and doesn't navigate), `Header` (dropdown reflects visited subreddits minus current, changing it navigates).

Pages (mock `redditFetch` and/or dispatch rather than relying on the real `demoData.js` content, so tests don't break if the dataset changes):
- `Home`, `Subreddit` (including that `addVisitedSubreddit` is dispatched on mount), `Search` (including the "no results" and loading states), `Post` (including the two-part `[postData, commentsData]` response shape it expects from `redditFetch`).

**Non-goal for this feature:** a hard coverage percentage gate in CI. Aim for meaningful behavioral coverage per the map above; note any deliberately deferred file in `tasks.md` rather than skipping it silently.

---

## 5. Feature 2 — Netlify production deployment

**Deploy model:** git-based, static site. Claude Code's job is to make the repository correctly configured and verified to deploy; connecting the GitHub repo to a Netlify site is a one-time manual step in the Netlify dashboard that the user does themselves (Claude Code doesn't have Netlify account credentials and shouldn't try to obtain or use any).

> This feature originally targeted a Netlify Function as a Reddit proxy. That's gone — see the amendment in §1 and `specs/004-static-demo-data/`. What remains of this feature is simpler: a correctly configured static build.

### Tasks

- Ensure `netlify.toml` exists at the repo root:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"

  [build.environment]
    NODE_VERSION = "20"
  ```
- `public/_redirects` only needs the SPA catch-all (`/* /index.html 200`) — client-side routing (direct loads of `/r/<sub>`, `/search`, etc.) still needs this even with no function involved.
- Verify locally before relying on a pushed deploy: `npm run build` succeeds, and `npm run dev` (or `npx netlify dev` for an exact routing preview) serves a fully working app — Home, a subreddit, a search, a post-with-comments page — with zero console errors.
- Once verified, document the one-time manual step for the user: create a new Netlify site from the GitHub repo via the Netlify dashboard, confirm it picked up the `netlify.toml` build settings, trigger the first deploy, then replace the placeholder URL in `README.md` with the real deployed URL.

### Acceptance criteria

- `npm run build` succeeds locally with no errors.
- `netlify.toml` is present and correct; `public/_redirects` contains only the SPA catch-all.
- `npm run dev` serves a fully working app end to end with zero console errors — no separate dev/prod data path to worry about.
- README no longer contains the placeholder Netlify URL or the incorrect Jest claim.

---

## 6. Explicitly out of scope

Do not pursue these as part of either feature above, even if they'd be natural extensions — they belong to separate future specs if the user wants them:

- Any live Reddit data access of any kind — unauthenticated, OAuth, third-party mirror, or otherwise. Tried twice (specs `002`, `003`), abandoned both times for reasons outside this project's control (see §1). Don't resume without a new spec confirming those blockers no longer apply.
- Any of the README's "Future Improvements" (infinite scroll, comment collapsing, subreddit autocomplete, dark/light theme, caching).
- Implementing `ErrorMessage.jsx` / `LoadingSpinner.jsx` unless a spec calls for it.
- CI/CD beyond what Netlify's git-based deploy provides natively (no separate GitHub Actions pipeline unless requested).

---

## 7. Quick command reference

```bash
# tests
npm run test              # vitest run (single pass, CI-style)
npm run test:watch        # vitest watch mode
npm run test:coverage     # vitest run --coverage

# local dev
npm run dev                # vite only — fully functional, app runs entirely on bundled demo data
npx netlify dev            # optional — exact preview of Netlify's routing/redirects, not required for real data anymore

# build
npm run build               # outputs to dist/
```