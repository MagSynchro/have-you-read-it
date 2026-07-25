# Tasks: 001-unit-test-coverage

## Phase 1: Setup

- [x] **T001** Add devDependencies: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- [x] **T002** Add the `test` block to `vite.config.js` per plan.md Phase 1.
- [x] **T003** Create `src/test/setup.js` importing `@testing-library/jest-dom`.
- [x] **T004** Add `test`/`test:watch`/`test:coverage` scripts to `package.json`.
- [x] **T005** `[P]` Fix `README.md`'s "Technologies Used" section: Jest → Vitest.

## Phase 2: Pure logic tests

- [x] **T006** `[P]` `src/utils/helpers.test.js` — `formatNumber` boundaries (<1000 returns a number not a string, 1000, 999999, 1000000, billions) and `removeAmp` (`null`/`undefined`/empty-string/normal).
- [x] **T007** `[P]` `src/utils/redditFetch.test.js` — subreddit listing per sort variant, pagination advance/exhaust/loop, post+comments (found + unknown-id fallback), search (match + no-match), unknown subreddit → empty listing.
- [x] **T008** `[P]` `src/features/posts/postsSlice.test.js` — `pending`/`fulfilled`/`rejected` reducer cases, `fetchPosts` thunk payload shaping (mock `redditFetch`), all four selectors.
- [x] **T009** `[P]` `src/features/subreddits/subredditsSlice.test.js` — `addVisitedSubreddit` dedup-and-move-to-end, 10-item cap/shift, case-insensitivity.

## Phase 3: Component tests

- [x] **T010** `[P]` `src/components/Breadcrumbs.test.jsx` — renders each crumb as a link, separators between but not after the last.
- [x] **T011** `[P]` `src/components/FilterBar.test.jsx` — renders all four sort options, active class on current sort, click calls `onSortChange`.
- [x] **T012** `[P]` `src/components/Pagination.test.jsx` — renders Next button, click calls `onNext`.
- [x] **T013** `[P]` `src/components/SearchResults.test.jsx` — empty/undefined results → "No results found."; non-empty → one `PostCard` per result.
- [x] **T014** `[P]` `src/components/Comment.test.jsx` — non-`t1` kind renders nothing; image/video/link URL-splitting branches in body; recursive nested replies render.
- [x] **T015** `[P]` `src/components/PostCard.test.jsx` — thumbnail suppressed for `self`/`default`/`nsfw`/`spoiler`/non-`http` values, shown for a valid `http` thumbnail; links to `/r/<subreddit>/<id>`.
- [x] **T016** `[P]` `src/components/SearchBar.test.jsx` — submit with text navigates to `/search?q=<encoded>`; empty/whitespace submit does not navigate.
- [x] **T017** `[P]` `src/components/Header.test.jsx` — dropdown shows visited subreddits minus current; changing selection navigates to `/r/<selected>`.

## Phase 4: Page tests

- [x] **T018** `[P]` `src/pages/Home.test.jsx` — dispatches `fetchPosts({subreddit:"popular", sort})` on mount and on sort change; loading/error states render.
- [x] **T019** `[P]` `src/pages/Subreddit.test.jsx` — dispatches `fetchPosts` for the route's subreddit and `addVisitedSubreddit` on mount; `handleNext` dispatches with the current `after`.
- [x] **T020** `[P]` `src/pages/Search.test.jsx` — loading state, "no results" state (typo fixed to "No results found." while here, per plan.md), and rendered `PostCard`s for matches.
- [x] **T021** `[P]` `src/pages/Post.test.jsx` — renders post title/body/author from the `[postData, commentsData]` shape `redditFetch` returns; renders `Comment` per top-level comment.

## Phase 5: Close-out

- [x] **T022** Run `npm run test` — full suite must pass.
- [x] **T023** Run `npm run build` — must still succeed.
- [x] **T024** Update this feature's `spec.md` Acceptance Criteria checklist to reflect actual verified status.

---

Notes:
- Nearly everything here is `[P]` — each test file is its own new file with no shared state, so almost all of Phases 2–4 can be written in any order or in parallel. Sequencing them logic → components → pages (as listed) is a recommendation for building confidence bottom-up, not a hard dependency.
- T005 (README fix) is independent of the rest and can happen any time.
