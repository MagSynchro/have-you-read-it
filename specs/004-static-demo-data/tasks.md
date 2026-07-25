# Tasks: 004-static-demo-data

## Phase 1: Dataset

- [x] **T001** Author `src/data/demoData.js`: 5 subreddits x 6 posts, covering self-text/image-link/plain-link post types and `self`/`default`/`nsfw`/`spoiler` thumbnail variety; a full comment thread (with at least one nested reply) for every post id. Done during spec/plan authoring.

## Phase 2: Data layer

- [x] **T002** Rewrite `src/utils/redditFetch.js` to resolve all five call shapes (subreddit+sort+after, postId, query, and the implicit "no params" default-to-popular case) against `demoData.js`, per plan.md Phase 1. Keep the exact same function signature and return shapes.
- [x] **T003** `[P]` Verify no other file imports anything from the old fetch-based implementation's internals (there shouldn't be any — `postsSlice.js`, `Post.jsx`, `Search.jsx` only import the `redditFetch` function itself).

## Phase 3: Remove now-dead serverless infrastructure

- [x] **T004** Delete `netlify/functions/reddit.js`; remove the `netlify/functions/` directory if empty afterward.
- [x] **T005** `[P]` Update `netlify.toml`: remove the `functions = "netlify/functions"` line.
- [x] **T006** `[P]` Update `public/_redirects`: remove the `/api/* /.netlify/functions/:splat 200` line; keep the SPA catch-all.
- [x] **T007** `[P]` Delete `.env.example`.

## Phase 4: Documentation

- [x] **T008** `[P]` Update `README.md`: remove the "Setup" section (Reddit app registration instructions) added in Feature 003; replace with a short note that the app runs entirely on bundled demo data and needs no configuration or credentials.
- [x] **T009** `[P]` Amend `.specify/memory/constitution.md` Principle 2 (final revision, dated) and remove Principle 3 (signed OAuth) outright, renumbering if needed — document the "no live data, ever, without a new spec" rule.
- [x] **T010** `[P]` Amend `CLAUDE.md`'s relevant sections (project snapshot / "why the Netlify function exists" block, constitution mirror, quick command reference) to describe the final static-data architecture, keeping the dated amendment history already present from Features 002/003.

## Phase 5: Verification

- [x] **T011** Run `npm run build` — must succeed.
- [x] **T012** Run `npm run dev` (plain Vite, no `netlify dev` needed anymore) and manually walk through: Home feed loads with demo posts; open a subreddit; run a search that matches and one that doesn't; open a post and see its comments (including a nested reply); paginate to a second page and back past the end.
- [x] **T013** Confirm zero console errors/warnings during the walkthrough (React key warnings, broken images, etc.).
- [x] **T014** Update this feature's `spec.md` Acceptance Criteria checklist to reflect actual verified status.

---

Notes:
- T005, T006, T007 touch disjoint files — safe in parallel with each other and with T003.
- T008, T009, T010 are documentation-only — safe in parallel with each other, but should land after T002–T007 so they describe the actual end state rather than an intermediate one.
- No test-writing tasks here: `redditFetch.js`'s new pure-logic implementation is exactly what Feature 001 (not yet started) should cover in its own spec — noted there, not duplicated here.
