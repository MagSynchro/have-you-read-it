# Plan: 002-netlify-production-deploy

## Technical Context

- **Stack:** React 19 + Vite 7 (client), Netlify Functions (Node serverless, AWS Lambda-compatible runtime) for the Reddit proxy.
- **Dependencies touched:** `package.json` (possibly none added — see Phase 0), no new client-side dependencies.
- **Files touched:** `netlify/functions/reddit.js`, `netlify.toml` (new), `README.md` (URL/tooling correction only — Jest wording itself belongs to Feature 001, but this plan must not leave the placeholder URL in place per spec FR6).
- **Out of scope reaffirmed:** no OAuth/signed Reddit API, no new hosting provider, no changes to `public/_redirects`.

## Constitution Check

- **Principle 2 (server-side Reddit access only):** Satisfied — no change to the access pattern; client still goes through `/api/reddit` in prod and the Vite proxy in dev.
- **Principle 3 (no signed API, no secrets):** Satisfied — fix stays within the existing unauthenticated public JSON endpoints.
- **Principle 5 (deployability):** This entire feature exists to satisfy this principle.
- **Principle 6 (simplicity):** Satisfied — fixing the dependency issue with the runtime's native `fetch` avoids adding infra; `netlify.toml` just declares what already exists implicitly.
- No violations requiring justification.

## Project Structure

```
netlify/functions/reddit.js   (modified: drop node-fetch import)
netlify.toml                  (new)
README.md                     (modified: live URL placeholder removed)
```

No new files beyond `netlify.toml`. No test files needed for this feature specifically beyond what Feature 001's coverage map already assigns to `netlify/functions/reddit.js` — this plan does not duplicate that test work, it only makes the function deployable.

## Phase 0: Research

**Open question: how to resolve the `node-fetch` bundling failure?**

Two options per CLAUDE.md §1:
- (a) Drop the `node-fetch` import and rely on the runtime's native global `fetch`.
- (b) Add `node-fetch` to `package.json` dependencies.

**Resolution: Option (a).** Netlify Functions run on Node 18+ by default, and Node 18+ ships a native, spec-compliant global `fetch` (undici-based) — no import needed. This is strictly cheaper: zero new dependency, zero risk of a version mismatch between declared and bundled `node-fetch`, and it directly eliminates the bundling failure that's been blocking every deploy. Option (b) would still work but adds a dependency for functionality the runtime already provides for free, violating Constitution Principle 6 (Simplicity) without justification. Decision: remove the `import fetch from "node-fetch"` line entirely; `fetch` becomes an ambient global in the function, same as it already is in browser/Vite code.

**Node version pin:** `netlify.toml` will pin `NODE_VERSION = "20"` (per CLAUDE.md §5's given config) to guarantee the native-fetch runtime regardless of Netlify's platform default, and to match a version the maintainer can also run locally via `netlify-cli`.

**No other open questions** — redirects, publish dir, and functions dir are already implicitly correct (`public/_redirects`, `dist`, `netlify/functions`); `netlify.toml` just needs to state them explicitly per CLAUDE.md §5.

## Phase 1: Design

**Change 1 — `netlify/functions/reddit.js`:** Remove `import fetch from "node-fetch";`. No other logic changes; the function already uses `fetch(...)` the same way a native global would be called, so this is a one-line deletion, not a rewrite. (Test coverage for this file's four URL-building branches, error handling, and CORS header is Feature 001's responsibility per its coverage map — not duplicated here.)

**Change 2 — `netlify.toml` (new file):** Exactly the config given in CLAUDE.md §5:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
```

**Change 3 — verification, not a code change:** Run `npm run build` to confirm the client build succeeds, then run `npx netlify dev` to emulate the full Netlify routing (function + redirects + SPA) locally, and manually exercise all four Reddit call shapes (Home popular/hot, a subreddit page, a search, a post-with-comments page) watching the browser console for CORS errors. This is the closest available proxy for "will this deploy correctly" without actually creating a Netlify site (out of scope — that's the user's manual dashboard step).

**Change 4 — `README.md`:** Replace the placeholder `https://your-netlify-url-here.netlify.app` with a placeholder note that the user fills in after they complete the manual Netlify dashboard step (documented separately below), since no real URL exists yet at spec time. Leave the Jest→Vitest wording correction to Feature 001, which owns the "Technologies Used" section.

## Manual step (user-performed, not automated by this feature)

After this feature's tasks are complete and merged: create a new Netlify site from the GitHub repo via the Netlify dashboard, confirm it picks up `netlify.toml`'s build settings automatically, trigger the first deploy, then replace the README placeholder with the real deployed URL.
