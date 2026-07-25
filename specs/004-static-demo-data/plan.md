# Plan: 004-static-demo-data

## Technical Context

- **Stack:** unchanged client-side (React 19 + Redux Toolkit + Vite 7). The Netlify Functions runtime is removed entirely — this becomes a pure static-site deploy.
- **Dependencies touched:** none added; `node-fetch`/OAuth-related code (already dependency-free per Feature 002) is deleted, not replaced.
- **Files removed:** `netlify/functions/reddit.js` (and the now-empty `netlify/functions/` directory), `.env.example`.
- **Files added:** `src/data/demoData.js` (already authored during this session — see below).
- **Files modified:** `src/utils/redditFetch.js` (reads local data instead of fetching), `netlify.toml` (drop `functions` line), `public/_redirects` (drop `/api/*` line, keep the SPA catch-all), `README.md` (drop Reddit setup section, note demo data instead), `CLAUDE.md` + `.specify/memory/constitution.md` (amend again — this is the final architecture).

## Constitution Check

- **Principle 1 (test-first):** `redditFetch.js`'s new logic is exactly the kind of pure, testable logic Feature 001's coverage map should cover — noting this for that feature's spec rather than writing tests now (004 predates 001's implementation).
- **Principle 2 (server-side Reddit access only) — retired/replaced:** there is no Reddit access at all anymore, server or client. This principle needs a fourth amendment reflecting that.
- **Principle 3 (signed OAuth) — retired:** no credentials of any kind are used. Amend again.
- **Principle 5 (deployability):** simplified, not weakened — a static site with no function is strictly easier to keep deployable than the function-based architecture was.
- **Principle 6 (simplicity):** this feature is a simplification relative to 002/003 — removing infrastructure (the function, OAuth token caching, `.env` handling) that no longer serves a purpose.

## Project Structure

```
src/data/demoData.js          (new — synthetic dataset, already written)
src/utils/redditFetch.js      (rewritten — reads demoData.js, no fetch())
netlify/functions/            (deleted entirely)
netlify.toml                  (modified — drop functions line)
public/_redirects             (modified — drop /api/* line)
.env.example                  (deleted)
README.md                     (modified — drop Reddit setup, note demo data)
CLAUDE.md, .specify/memory/constitution.md   (amended — final architecture)
```

## Phase 0: Research

**Dataset shape decisions (already resolved during authoring):**
- Keep `redditFetch({ subreddit, sort, after, postId, query })`'s exact call signature and the exact Reddit-shaped return values (`{ data: { children: [...], after } }` for listings; `[postListing, commentsListing]` for post+comments) so `postsSlice.js`, `Post.jsx`, and `Search.jsx` require zero changes — the data source changes, nothing above it does.
- One post object is shared verbatim between subreddit listings and post-detail lookups (single source of truth per post, keyed by a globally-unique id) — avoids maintaining two divergent copies of the same content.
- Pagination cursor: a simple stringified array index (`"4"`, `"8"`, ...), opaque to callers exactly like a real Reddit `after` token is. `null` once exhausted, matching the real contract `fetchPosts`/`Pagination` already assume.
- Sort variants (`hot`/`new`/`top`/`best`) are simulated by reordering the same underlying array (`top` by `ups` descending, `new` reversed, `hot`/`best` original curated order) rather than maintaining four separate datasets — enough to make switching `FilterBar` tabs visibly do something, without quadrupling the content to author.
- Search matches by case-insensitive substring against post titles across the whole dataset, returned unpaginated (matches `Search.jsx`, which has no pagination UI).
- Unknown subreddit → empty listing. Unknown post id → a graceful "not part of the demo dataset" fallback post with no comments. Both already required by spec FR5/FR6 and both avoid a crash without adding error-boundary machinery that isn't otherwise part of this app.

**Why remove the Netlify Function instead of leaving it in place unused?** Constitution Principle 6 (simplicity): dead infrastructure that makes no request is actively misleading — a future maintainer would reasonably assume it does something. Removing it also removes the entire class of bugs Features 002/003 spent effort on (bundling, CORS, OAuth token caching), which is a meaningful simplification worth stating plainly, not just an incidental cleanup.

## Phase 1: Design

**`src/utils/redditFetch.js` — new implementation:**
- `sortPosts(posts, sort)`: returns a reordered copy per the rules above.
- `buildListing(posts, after)`: slices a page (fixed page size), returns the `{ data: { children, after } }` shape.
- `findPost(postId)`: linear search across `POSTS_BY_SUBREDDIT` (dataset is small; no index needed).
- `redditFetch(...)`: same branching order as the old implementation (postId → query → subreddit), now resolving against `demoData.js` instead of building a URL and calling `fetch`. Stays `async` for interface compatibility even though nothing actually awaits I/O.

**Removals:**
- `netlify/functions/reddit.js` deleted; if `netlify/functions/` is then empty, remove the directory too.
- `netlify.toml`: drop the `functions = "netlify/functions"` line from `[build]`; keep `command`/`publish`/`NODE_VERSION` (still a real Vite build).
- `public/_redirects`: drop the `/api/* /.netlify/functions/:splat 200` line; keep the SPA catch-all (`/* /index.html 200`) — still required for client-side routing on direct loads of `/r/...`/`/search`/etc.
- `.env.example` deleted; `README.md`'s "Setup" section (added in Feature 003) replaced with a one-line note that the app uses bundled demo data and needs no configuration at all.

**Constitution amendment (fourth revision):** Principle 2 becomes "No live external data access — the app runs entirely on bundled static demo data (`src/data/demoData.js`); do not reintroduce a live Reddit fetch, client-side or server-side, without a new spec documenting why the datacenter-IP block and OAuth-registration wall no longer apply." Principle 3 (signed OAuth) is removed outright — there's nothing left to sign. Amendment history stays visible (dated, with reasons) rather than silently rewritten, consistent with how the prior two amendments were handled.

## Manual step (none)

Unlike Features 002/003, this feature has no remaining manual step for the user — no dashboard config, no credentials to obtain. Once merged, `npm run build` + connecting the Netlify dashboard (the one step that was always going to be manual, per Feature 002) is sufficient for a working deploy.
