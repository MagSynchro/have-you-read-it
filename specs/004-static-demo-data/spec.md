# Feature 004: Static Demo Data (No Live Reddit Access)

## Overview

Features 002 and 003 established that live, server-side Reddit access isn't achievable for this project through any currently available official channel: unauthenticated `www.reddit.com/*.json` endpoints reject requests from datacenter/server IPs outright (confirmed in 002), and Reddit no longer offers self-serve `client_credentials` OAuth app registration for an independently-hosted external client — new registrations are funneled toward Devvit, Reddit's own in-platform app hosting, which doesn't fit a project whose explicit goal is showcasing a *Netlify* deployment (confirmed in 003, now abandoned).

This feature resolves the situation by removing the live-data dependency entirely. The app ships with a bundled set of synthetic, Reddit-shaped demo content — sample posts, comments, and subreddits written to look and behave like real Reddit content without being scraped or attributed to real users. The deployed site becomes a pure static build: no serverless function, no CORS concern, no credentials, no external network call of any kind at runtime. This also retroactively resolves the entire "CORS on Netlify" saga visible in the project's git history — there's no longer a live cross-origin call for CORS to break.

## User Scenarios & Testing

- A visitor loads the home page and sees a believable Popular/hot feed of sample posts.
- A visitor opens a subreddit (from the curated demo set) and sees that subreddit's sample posts; visiting a subreddit outside the demo set shows an empty listing gracefully, not an error.
- A visitor searches for a term that matches sample post titles and sees matching results; a non-matching search shows the existing "no results" state.
- A visitor opens a post and sees its full body (self-text, or a linked image/article) and a nested comment thread.
- A visitor paginates through a subreddit or the home feed and sees a second page of sample posts; continuing to paginate past the end loops back rather than erroring.
- A maintainer runs `npm run dev` (plain Vite, no Netlify CLI needed) and everything above works identically to the deployed site, because there's no separate dev/prod data path anymore.

## Functional Requirements

1. The app MUST NOT make any network call to `reddit.com` or any Reddit-owned domain, client-side or server-side, in either dev or prod.
2. `redditFetch(...)`'s call signature and return shapes MUST remain unchanged from what `postsSlice.js`, `Post.jsx`, and `Search.jsx` already expect (Reddit's own listing/comment JSON shapes), so no consuming code needs to change.
3. The bundled demo dataset MUST cover, across its posts: a self-text post, a linked image post, a plain external link post, and at least one post whose `thumbnail` is `self`/`default`/`nsfw`/`spoiler` (matching `PostCard`'s existing thumbnail-suppression logic) — enough variety that existing UI branches are all reachable in the running app.
4. Every post surfaced in a subreddit listing MUST have a corresponding full post-detail + comment thread reachable by clicking into it — no dead links within the demo dataset.
5. Requesting a subreddit not present in the demo dataset MUST return an empty listing (existing empty-state UI), not a crash.
6. Requesting a post id not present in the demo dataset MUST return a graceful fallback post ("not part of the demo dataset") with no comments, not a crash.
7. Pagination MUST work against the bundled dataset using the same `after`-cursor contract the app already has (opaque string cursor, `null` when exhausted).
8. The dataset content MUST be clearly synthetic — invented usernames, invented post text — not scraped or copied from real Reddit content, to avoid stale/misleading "live" framing and any content-attribution concerns in a publicly deployed portfolio piece.

## Non-Functional Constraints

- No new runtime dependencies (the dataset is plain JS objects/modules, no data-fetching library needed).
- The Netlify Function, `netlify/functions/reddit.js`, and its OAuth token logic are removed — they have no remaining purpose once there's no live call to proxy or authenticate.
- `netlify.toml` and `public/_redirects` are simplified accordingly (no `functions` declaration, no `/api/*` redirect) since the deploy becomes a pure static site.
- Thumbnail images may reference a third-party placeholder image CDN for visual variety (decorative only, rendered directly in the visitor's own browser — not proxied through any of this project's infrastructure, so it carries none of the CORS/auth problems Features 002–003 dealt with). If that CDN is ever unreachable, only thumbnails are affected; the app's core functionality doesn't depend on it.

## Out of Scope

- Any live data source, Reddit or otherwise (see Features 002/003 for why this was tried and abandoned).
- Making the demo dataset configurable/extensible via an admin UI — it's a fixed, bundled dataset edited in source.
- Reverting or deleting Features 002/003's specs — they stay as an honest historical record of what was tried.

## Acceptance Criteria

- [x] `src/data/demoData.js` exists: 5 subreddits (popular, gaming, technology, pics, movies) x 6 posts each, covering self-text/image-link/plain-link post types, `self`/`default`/`nsfw`/`spoiler` thumbnails, and a full comment thread (including nested replies) for every post id.
- [x] `src/utils/redditFetch.js` serves all call shapes (subreddit listing + sort variants, post+comments, search, pagination) from the bundled dataset with no network call. Verified in-browser.
- [x] `netlify/functions/reddit.js` and the `netlify/functions/` directory are removed.
- [x] `netlify.toml` no longer declares a `functions` directory; `public/_redirects` no longer redirects `/api/*` (only the SPA catch-all remains).
- [x] `.env.example` removed; `README.md`'s Reddit-credential setup section replaced with an "About the Data" section explaining the bundled demo dataset.
- [x] `npm run build` succeeds. Verified: clean build, 86 modules.
- [x] `npm run dev` alone (no `netlify dev` needed) serves a fully working app with demo data end to end. Verified via browser automation.
- [x] Manual walkthrough in a browser: Home feed (✓), a subreddit incl. pagination forward and loop-back (✓ r/gaming), search with a match (✓ "cat" → pics post) and no match (✓ "no results" state), a post with nested comments (✓ pop1, including a 2-level-deep reply), and image thumbnails loading from the placeholder CDN (✓ r/pics, all 4 images `complete: true`). Zero console errors throughout.
