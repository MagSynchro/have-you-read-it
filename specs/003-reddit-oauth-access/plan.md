# Plan: 003-reddit-oauth-access

## Technical Context

- **Stack:** unchanged (React 19 + Vite 7 client, Netlify Functions serverless proxy). No new dependencies — token exchange and authenticated calls use Node 20's native `fetch` and global `Buffer` (for HTTP Basic auth encoding), both already available per Feature 002's decision to drop `node-fetch`.
- **Dependencies touched:** none added to `package.json`.
- **Files touched:** `netlify/functions/reddit.js` (OAuth token fetch/cache + call `oauth.reddit.com`), `src/utils/redditFetch.js` (drop the `isDev` branch), `src/utils/env.js` (remove `isDev` if unused elsewhere), `vite.config.js` (remove dev-only `/reddit` proxy), new `.env.example`, `README.md` (setup instructions), `CLAUDE.md`/constitution already amended in a prior step.

## Constitution Check

- **Principle 2 (server-side Reddit access only):** Strengthened, not weakened — this removes the one place client-side dev code had a second access pattern (the Vite proxy), leaving exactly one path: `/api/reddit` → the function.
- **Principle 3 (amended):** This feature *is* the amendment being exercised — app-only `client_credentials`, no user login, secret stays server-side only. Directly satisfies the amended principle as written.
- **Principle 5 (deployability):** Build must keep succeeding; verified in Phase 3 below.
- **Principle 6 (simplicity):** Removing the `isDev` branch is a net simplification (one code path instead of two). Token caching is the simplest viable approach (in-memory, per warm instance) — no external cache/store introduced.
- No violations.

## Project Structure

```
netlify/functions/reddit.js   (modified: OAuth token fetch/cache, oauth.reddit.com calls)
src/utils/redditFetch.js      (modified: single code path, always calls /api/reddit)
src/utils/env.js              (modified or removed: isDev likely dead code after this change)
vite.config.js                (modified: remove /reddit proxy block)
.env.example                  (new: documents REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
README.md                     (modified: add Reddit app setup + env var instructions)
```

## Phase 0: Research

**How does Reddit's `client_credentials` (app-only) OAuth work for a "script" app?**

- Token endpoint: `POST https://www.reddit.com/api/v1/access_token` (this one Reddit endpoint stays unauthenticated-reachable — it's the credential exchange itself, not a data endpoint, and is not subject to the same block seen on `*.json` listing endpoints in Feature 002's testing).
- Auth: HTTP Basic, `Authorization: Basic base64(client_id:client_secret)`.
- Body: `application/x-www-form-urlencoded`, `grant_type=client_credentials`.
- Response: `{ access_token, token_type: "bearer", expires_in (seconds, typically 3600), scope }`.
- Subsequent data calls: same paths as before (`/r/<sub>/<sort>.json`, `/search.json`, `/r/<sub>/comments/<id>.json`) but against host `oauth.reddit.com` instead of `www.reddit.com`, with header `Authorization: Bearer <access_token>`.
- A descriptive `User-Agent` remains required (Reddit's API rules require a unique, descriptive UA regardless of auth) — keep the existing custom UA string already in the function, updated to reflect it's now an authenticated client.

**Token caching approach:** Netlify Functions reuse the same Node process/module scope across "warm" invocations (standard Lambda-backed behavior). A module-level `let cachedToken` / `let tokenExpiresAt` pair, checked at the top of each request and refreshed only when missing or within a small buffer of expiry (e.g. 60s), avoids a token request on every single Reddit call without introducing any external store. On a cold start, the module reinitializes and the first request pays for one extra round trip — acceptable and standard for this pattern.

**Why not keep the Vite dev proxy as a fallback?** The user directed dev to switch to OAuth too, specifically to avoid the situation Feature 002 uncovered: a dev path that "works" for reasons (residential IP, no auth needed) that don't hold in prod, masking real failures until deploy. One path, one truth.

**Local `.env` loading:** Netlify CLI (`netlify dev`) natively reads a `.env` file at the project root and injects its values as environment variables for both the Vite dev server and the function — no extra config needed beyond the file existing and being gitignored (already the case per the existing `.gitignore`).

## Phase 1: Design

**`netlify/functions/reddit.js` — new shape:**
- Module-level `cachedToken`, `tokenExpiresAt`.
- `async function getAccessToken()`: returns cached token if valid; otherwise POSTs to the token endpoint using `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` from `process.env`, throws a descriptive error if those env vars are missing (caught by the handler and returned as a clear 500, per spec FR4) or if Reddit rejects the credentials (non-200 from the token endpoint).
- `handler`: unchanged branching logic for building the target path (query/postId/subreddit+sort+after/default), but targets `oauth.reddit.com` and adds `Authorization: Bearer <token>`. The existing raw-text-then-JSON.parse defensive handling (added in Feature 002 verification) stays — it's still valid protection against any non-JSON response.

**`src/utils/redditFetch.js` — new shape:** single function body that always builds `URLSearchParams` and calls `/api/reddit?...`, deleting the `isDev` conditional entirely.

**`src/utils/env.js`:** grep confirmed `isDev` has no other consumers — delete the file's export (or the whole file if nothing else lives there) once `redditFetch.js` no longer imports it.

**`vite.config.js`:** remove the `server.proxy["/reddit"]` block; keep the `react()` plugin and any other config as-is.

**`.env.example`:**
```
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

**`README.md` addition:** a short "Setup" section: create a Reddit "script" app at reddit.com/prefs/apps, copy the client id (under the app name) and secret, put them in a local `.env` (copy from `.env.example`), and also set the same two variables in the Netlify dashboard (Site settings → Environment variables) before the first production deploy.
