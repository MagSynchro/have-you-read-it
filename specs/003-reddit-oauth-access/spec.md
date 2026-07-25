# Feature 003: Reddit OAuth (App-Only) Access

> **STATUS: ABANDONED, 2026-07-25.** Reddit no longer offers self-serve `client_credentials` app registration for this use case — the maintainer confirmed the reddit.com/prefs/apps flow now redirects toward Devvit (Reddit's platform for apps hosted *inside* Reddit, not a general external-API credential). Devvit doesn't fit this project's goal of an independently Netlify-hosted app. This spec's implementation was partially built (`netlify/functions/reddit.js` token-exchange code, simplified `redditFetch.js`) before this was discovered; those changes were superseded by `specs/004-static-demo-data/`, which removes server-side Reddit access entirely in favor of bundled synthetic data. Left in place, unmodified, as a historical record — do not resume this approach without first confirming Reddit has reopened this path.

## Overview

Feature 002 fixed the Netlify function's bundling failure and confirmed the app is deployable, but surfaced a deeper wall: Reddit's unauthenticated `www.reddit.com/*.json` endpoints reject requests from server-side/datacenter hosts outright, regardless of headers or code correctness. This affects both the Netlify Function in production and local `netlify dev` — the exact hosts this project's architecture depends on for all Reddit access. This is very likely the real cause behind the "CORS" symptoms chased across several prior commits: the requests were being blocked, and the browser reported the resulting failure in a CORS-shaped way.

The fix is to stop using unauthenticated endpoints and instead authenticate as a registered Reddit application using the `client_credentials` OAuth grant ("application-only" auth) — no end user ever logs into Reddit through this app; it's purely a server-to-server credential that unlocks the same public, read-only data this app already displays. Both local development and production will use this single path, closing the gap where dev "worked" for reasons unrelated to whether prod would.

## User Scenarios & Testing

(Same user-facing scenarios as Feature 002 — this feature makes them actually work, rather than changing what a visitor experiences.)

- A visitor loads the home page and sees the Popular/hot feed.
- A visitor opens a subreddit and sees its posts.
- A visitor searches and sees matching results (or a "no results" state).
- A visitor opens a post and sees its content and nested comments.
- A visitor paginates to the next page of a listing.
- A maintainer running `netlify dev` locally sees all of the above work with real data, using the same code path production uses — no separate "it worked in dev for a different reason" gap.

## Functional Requirements

1. The Netlify function MUST obtain a Reddit OAuth access token via the `client_credentials` grant before making any Reddit API call, using a client id and secret read from environment variables — never hardcoded, never sent to client-side code.
2. The function MUST reuse a cached token across warm invocations until it's close to expiry, rather than requesting a new token on every single request.
3. All four existing Reddit call shapes (popular/hot feed, subreddit + sort + pagination cursor, search, post + comments) MUST work against `oauth.reddit.com` with the bearer token, preserving the exact same query parameters and response shape the app already expects.
4. If the client id/secret environment variables are missing or Reddit rejects the credentials, the function MUST return a clear error response rather than a silent failure or an unrelated-looking crash.
5. Local development MUST use the same `/api/reddit` → Netlify function → OAuth path as production. The dev-only unauthenticated Vite proxy path is removed; there is one Reddit access code path, not two.
6. Local development MUST be able to supply the client id/secret via a gitignored `.env` file, consistent with how Netlify CLI and Vite both natively support `.env` loading.
7. The client id/secret MUST never be committed to git, in either the real values or in any tracked file — a `.env.example` documents the required variable names without real values.

## Non-Functional Constraints

- No user ever authenticates with Reddit through this app; no authorization-code/login flow, no user-specific scopes or permissions, no refresh tokens tied to a user.
- The same environment variables (client id/secret) must be set in the Netlify dashboard for production — that one-time manual step belongs to the user, not this feature's automated tasks, consistent with how Feature 002 treated the Netlify-site-creation step.
- No new dependency is required — Node 20's native `fetch` (already relied on per Feature 002) is sufficient for the token exchange and the authenticated API calls.

## Out of Scope

- Any user-facing "log in with Reddit" flow, authorization-code grant, or per-user actions (voting, posting, saving) — this project remains strictly read-only with no concept of a logged-in visitor.
- Token refresh strategies beyond simple in-memory re-fetch-when-expired (no persistent token store, no shared cache across function instances — each cold start re-authenticates, which is the standard, expected pattern for serverless `client_credentials` usage at this traffic scale).
- Changing `public/_redirects` or `netlify.toml` — those already correctly route `/api/*` to the function.

## Acceptance Criteria

- [ ] `netlify/functions/reddit.js` obtains and uses a bearer token for every Reddit call, with no remaining call to unauthenticated `www.reddit.com/*.json` endpoints.
- [ ] All four Reddit call shapes return real data through `/api/reddit` when tested via `netlify dev` on a network with normal Reddit access, with zero CORS errors.
- [ ] `src/utils/redditFetch.js` has a single code path (no `isDev` branch); `src/utils/env.js`'s `isDev` export is removed if no longer used anywhere else.
- [ ] `vite.config.js`'s dev-only `/reddit` proxy is removed.
- [ ] `.env.example` exists documenting `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`; `.env` remains gitignored (already the case).
- [ ] `README.md` documents the one-time Reddit app registration + environment variable setup (both local `.env` and Netlify dashboard) needed to run this project.
- [ ] `npm run build` still succeeds.
