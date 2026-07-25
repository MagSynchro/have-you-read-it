# Tasks: 002-netlify-production-deploy

## Phase 1: Fix the blocking bundling issue

- [x] **T001** Remove `import fetch from "node-fetch";` from `netlify/functions/reddit.js`. Rely on the Node 20 runtime's native global `fetch`. No other logic in the file changes.

## Phase 2: Declare build configuration

- [x] **T002** `[P]` Create `netlify.toml` at repo root with `build.command = "npm run build"`, `build.publish = "dist"`, `build.functions = "netlify/functions"`, and `build.environment.NODE_VERSION = "20"`, per plan.md Phase 1 Change 2.

## Phase 3: Local verification (must pass before declaring done)

- [x] **T003** Run `npm run build` and confirm it exits 0 with no errors. Verified.
- [x] **T004** Run `npx netlify dev` and confirm the function bundles with no missing-dependency errors in the console output. Verified: "Loaded function reddit" with no bundling error.
- [~] **T005** Through the `netlify dev` server, exercise all four Reddit call shapes and confirm each returns data with zero CORS errors in the browser console. **Blocked in this sandbox**: Reddit itself returns HTTP 403 to all outbound requests from this environment (confirmed via direct `curl`, unrelated to app code) — the function correctly reaches Reddit and correctly surfaces the 403 as a structured 500. Re-run this check from a machine with normal Reddit access before trusting a deploy. See spec.md Acceptance Criteria for detail.
- [x] **T006** Confirm client-side routing still resolves correctly on a direct load of a non-root route via the `netlify dev` server. Verified: `/r/gaming/` and `/search` both return 200 directly (no client JS needed) through `public/_redirects`' SPA catch-all.

## Phase 4: Documentation

- [x] **T007** `[P]` Update `README.md`: replace the placeholder live URL (`https://your-netlify-url-here.netlify.app`) with a note that it will be filled in after the one-time manual Netlify dashboard setup. (Leave the Jest→Vitest "Technologies Used" wording to Feature 001 — don't touch that section here.)

## Phase 5: Close-out

- [x] **T008** Re-ran `npm run build` — clean. `spec.md` Acceptance Criteria updated to reflect actual verified status, including the one item (T005-equivalent) that could not be verified in this sandbox due to a Reddit-side network block unrelated to the code. Manual Netlify dashboard connection step remains the user's own action (documented in `plan.md`).

---

Notes:
- T002 and T007 touch disjoint files with no shared state — safe to do in either order or in parallel.
- T003–T006 are verification tasks, not optional — CLAUDE.md constitution Principle 5 (Deployability) requires this before considering the feature done.
- No test-writing tasks appear in this feature's list: the `reddit.js` function's behavioral test coverage (URL-building branches, error handling, CORS header assertion) is owned by Feature 001's coverage map, not duplicated here. This feature only removes the blocking import.
