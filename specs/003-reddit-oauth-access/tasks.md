# Tasks: 003-reddit-oauth-access

## Phase 1: Netlify function — OAuth token + authenticated calls

- [ ] **T001** In `netlify/functions/reddit.js`, add module-level token cache (`cachedToken`, `tokenExpiresAt`) and an `async getAccessToken()` that returns the cached token if still valid, otherwise exchanges `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` (HTTP Basic auth, `grant_type=client_credentials`) at `https://www.reddit.com/api/v1/access_token` for a new one. Throw a descriptive error if the env vars are missing or the exchange fails.
- [ ] **T002** Update the handler's request-building logic to target `https://oauth.reddit.com/...` (same four branches as before: query/postId/subreddit+sort+after/default) and add `Authorization: Bearer <token>`. Keep the existing raw-text/JSON.parse defensive handling and the `Access-Control-Allow-Origin: *` response header.
- [ ] **T003** Ensure a missing/invalid credentials case and a Reddit-rejects-the-token-exchange case both surface as a clear, distinct 500 response body (not a generic crash) — this is new logic, so per the constitution's test-first principle it should be covered by Feature 001's `reddit.js` test file when that lands; note it there rather than skipping silently.

## Phase 2: Simplify client-side to one code path

- [ ] **T004** `[P]` In `src/utils/redditFetch.js`, remove the `isDev` conditional; always build `URLSearchParams` and fetch `/api/reddit?...`.
- [ ] **T005** `[P]` Remove the now-unused `isDev` export from `src/utils/env.js` (delete the file if nothing else lives there — confirm via grep first).
- [ ] **T006** `[P]` Remove the `server.proxy["/reddit"]` block from `vite.config.js`.

## Phase 3: Local secrets scaffolding

- [ ] **T007** `[P]` Create `.env.example` at repo root with `REDDIT_CLIENT_ID=` and `REDDIT_CLIENT_SECRET=` (no real values). Confirm `.env` is already gitignored (it is, per existing `.gitignore`).
- [ ] **T008** Once the user supplies real credentials, create a local (gitignored, untracked) `.env` with the real `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` values for local verification in Phase 5.

## Phase 4: Documentation

- [ ] **T009** `[P]` Add a "Setup" section to `README.md`: register a Reddit "script" app at reddit.com/prefs/apps (redirect uri and about url are placeholders, unused by `client_credentials`), copy client id + secret into a local `.env` (from `.env.example`), and set the same two variables in the Netlify dashboard before the first production deploy.

## Phase 5: Verification

- [ ] **T010** Run `npm run build` — must succeed.
- [ ] **T011** Run `npx netlify dev` with real credentials in `.env` and confirm the token exchange succeeds (no auth error in function logs).
- [ ] **T012** Exercise all four Reddit call shapes through the running app (Home popular/hot, a subreddit, a search, a post + comments) and confirm real data renders with zero CORS errors in the browser console.
- [ ] **T013** Update this feature's `spec.md` Acceptance Criteria checklist to reflect actual verified status (not assumed) before closing out.

---

Notes:
- T004, T005, T006 touch disjoint files — safe in parallel.
- T007 and T009 are also disjoint from the above — safe in parallel.
- T008 depends on the user having completed their manual Reddit app registration (in progress as of this writing) and handed over real credentials.
- T011–T012 cannot be verified from a sandboxed/datacenter network per Feature 002's findings — must run wherever the maintainer has normal residential/non-blocked network access, or reasonably be assumed to work if Reddit's own token endpoint and `oauth.reddit.com` accept the authenticated request during the session (worth attempting from the current environment too, since the OAuth path is a fundamentally different endpoint than the blocked unauthenticated one and may not be subject to the same IP block — but don't treat a sandbox failure here as proof of a code bug without checking the response detail first).
