# Feature 001: Unit Test Coverage

## Overview

The app has meaningful, non-trivial logic — reducers, a data-shaping layer, pagination math, thumbnail/media-parsing branches, recursive comment rendering — with zero automated test coverage today. This feature adds behavioral test coverage across the pure logic, components, and pages, using Vitest + React Testing Library, so regressions in this logic surface before a human notices them in the browser.

## User Scenarios & Testing

This feature's "user" is the maintainer:
- A maintainer runs `npm run test` and gets a fast, deterministic pass/fail signal without a browser or network access.
- A maintainer who changes `formatNumber`'s boundary behavior, `redditFetch`'s pagination math, or a reducer's shape gets a failing test pointing at exactly what broke.
- A maintainer adding a new component can `npm run test:watch` while developing it.

## Functional Requirements

1. Vitest + React Testing Library MUST be configured and runnable via `npm run test` (single pass), `npm run test:watch`, and `npm run test:coverage`.
2. Every pure-logic module listed in the Coverage Map below MUST have tests covering its documented branches and edge cases, not just a smoke test that it runs without throwing.
3. Every component/page listed in the Coverage Map MUST be tested with the dependencies it actually needs (`MemoryRouter`, Redux `Provider`, mocked `redditFetch`) — no test may hit the real `demoData.js` content where mocking is called for (so tests don't silently break if the dataset's content changes), per Coverage Map notes.
4. No test may depend on network access or real timers where fake timers/mocks are more appropriate.
5. `README.md`'s "Technologies Used" section MUST say Vitest, not Jest.

## Non-Functional Constraints

- No hard coverage-percentage gate in CI — this is about meaningful behavioral coverage per the map below, not a number.
- Tests are colocated next to source as `*.test.js`/`*.test.jsx`, matching this codebase's existing per-file organization.
- This feature must not modify `src/data/demoData.js`'s content or `redditFetch.js`'s public behavior — it tests what Feature 004 already built, it doesn't change it (beyond incidental fixes noted below).

## Out of Scope

- `src/components/ErrorMessage.jsx` / `src/components/LoadingSpinner.jsx` — empty, unused files. Not tested, not implemented, per `CLAUDE.md` §1.
- A CI pipeline to run these tests automatically (no GitHub Actions workflow) — out of scope per `CLAUDE.md` §6.
- Visual/snapshot testing — this is behavioral testing only.

## Coverage Map

**Pure logic (highest value):**
- `src/utils/helpers.js` — `formatNumber` boundary cases (<1000, 1000, 999999, 1000000, billions; and that it returns a number, not a string, for <1000 — a real quirk worth asserting explicitly, not silently "fixing"); `removeAmp` including `null`/`undefined`/empty-string input.
- `src/utils/redditFetch.js` — subreddit listing for each sort (`hot`/`new`/`top`/`best`), pagination (`after` advancing correctly, `null` once exhausted, looping back after exhaustion), post+comments lookup (found and the "unknown postId" fallback), search (matching and non-matching), and an unknown-subreddit listing returning empty rather than throwing.
- `src/features/posts/postsSlice.js` — reducer behavior for `pending`/`fulfilled`/`rejected`, the `fetchPosts` thunk's payload shaping (mock `redditFetch`), and all four selectors.
- `src/features/subreddits/subredditsSlice.js` — `addVisitedSubreddit`: dedup-and-move-to-end behavior, the 10-item cap/shift, and case-insensitivity (`toLowerCase()`).

**Components** (mount with the dependencies they actually need):
- `Breadcrumbs`, `FilterBar`, `Pagination`, `SearchResults`, `Comment` (image/video/link URL-splitting branches and recursive replies), `PostCard` (thumbnail validity logic — `self`/`default`/`nsfw`/`spoiler`/non-`http` should all suppress the thumbnail), `SearchBar` (submit navigates with encoded query, empty/whitespace submit does nothing and doesn't navigate), `Header` (dropdown reflects visited subreddits minus current, changing it navigates).

**Pages** (mock `redditFetch` and/or dispatch rather than relying on real `demoData.js` content):
- `Home`, `Subreddit` (including that `addVisitedSubreddit` is dispatched on mount), `Search` (including the "no results" and loading states), `Post` (including the two-part `[postData, commentsData]` response shape it expects from `redditFetch`).

## Acceptance Criteria

- [x] `npm run test` runs and passes with the full coverage map implemented. Verified: 68 tests passed across 16 files.
- [x] `vite.config.js` has a `test` block; `src/test/setup.js` imports `@testing-library/jest-dom`.
- [x] `package.json` has `test`, `test:watch`, `test:coverage` scripts and the required devDependencies.
- [x] `README.md` says Vitest, not Jest.
- [x] `npm run build` still succeeds after adding test infrastructure. Verified: clean build.
