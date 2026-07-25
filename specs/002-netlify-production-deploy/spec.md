# Feature 002: Netlify Production Deployment

## Overview

"Have You Reddit?" needs to be live on the public internet as a portfolio piece. Today the app runs correctly on a developer's own machine but has never successfully deployed to Netlify: every attempted production deploy has failed or misbehaved (see prior commit history: "I HATE CORS", "pounding head into desk. CORS"), leaving visitors unable to load any Reddit content on the hosted site. This feature makes the repository correctly configured so that a git-connected Netlify site builds successfully and serves a fully working app, with zero browser-visible CORS errors, using only Reddit's public unauthenticated JSON endpoints.

## User Scenarios & Testing

- **Visitor lands on the home page.** A first-time visitor opens the deployed URL and sees the Popular/hot post feed load within a few seconds, with no visible error state and no CORS error in the browser console.
- **Visitor browses a subreddit.** A visitor clicks into a specific subreddit and sees that subreddit's posts load correctly, and the subreddit is added to the header's visited-subreddit history.
- **Visitor searches.** A visitor types a search query and submits it; matching posts load and render, or a "no results" state is shown if nothing matches — never a network/CORS failure.
- **Visitor opens a post.** A visitor clicks a post and sees the post body/media plus its nested comment thread load correctly.
- **Visitor paginates.** A visitor clicks "Next" on a post listing and sees the next page of results load using Reddit's `after` cursor.
- **Maintainer verifies before relying on a push.** Before trusting a pushed deploy, the maintainer can run the production build and a local Netlify emulation and confirm all of the above scenarios work, so failures are caught before they reach the public URL.

## Functional Requirements

1. The repository MUST declare, in version control, everything Netlify needs to build the site and its serverless function without manual dashboard configuration of build settings (build command, publish directory, functions directory, Node runtime version).
2. The Netlify serverless Reddit proxy function MUST be deployable using only dependencies declared in the project's package manifest — no import that silently fails to bundle.
3. Every Reddit data shape the app needs (popular/hot feed, a specific subreddit + sort + pagination cursor, search results, a single post + its comments) MUST be retrievable in production through the app's own origin, not via a direct cross-origin browser request to `reddit.com`.
4. The production path MUST return the correct CORS-permissive headers so the app's own client code can consume the response without a browser CORS error.
5. Client-side routing (React Router) MUST continue to work on the deployed site for direct loads/refreshes of non-root routes (subreddit pages, post pages, search), not just client-side navigation from the home page.
6. The project's documentation MUST accurately reflect the deployed state: no placeholder deployment URL, and no claim of a testing framework the project doesn't actually use.

## Non-Functional Constraints

- No signed/OAuth Reddit API credentials, client IDs, secrets, or `.env` Reddit configuration may be introduced to satisfy this feature (see Out of Scope).
- No new backend, database, or hosting provider — Netlify + Netlify Functions only.
- The fix must not change or duplicate the existing redirect rules already defined in `public/_redirects`; that file remains the single source of truth for redirects.
- The solution must not regress local development (`npm run dev` and the existing Vite proxy must keep working exactly as before).

## Out of Scope

- Registering a Reddit API application or implementing OAuth/signed API access.
- Any item from the README's "Future Improvements" list (infinite scroll, comment collapsing, subreddit autocomplete, theming, caching).
- A CI/CD pipeline beyond Netlify's native git-based deploys (no separate GitHub Actions workflow).
- Actually connecting the GitHub repository to a Netlify site in the Netlify dashboard — that one-time manual step remains the user's own action; this feature only makes the repository ready for it.

## Acceptance Criteria

- [x] `npm run build` succeeds locally with no errors. Verified: clean production build, 86 modules, no errors.
- [x] `netlify/functions/reddit.js` has zero runtime dependencies outside what's declared in `package.json`. Verified: `node-fetch` import removed; function relies on the Node 20 runtime's native global `fetch`.
- [x] `netlify.toml` exists at the repo root with correct build command, publish directory, functions directory, and Node version. Verified: present and matches spec.
- [x] `netlify dev` starts cleanly and the function bundles/loads with no missing-dependency error. Verified via `npx netlify dev`: "Loaded function reddit" with no bundling error, and `/r/gaming/`, `/search` direct loads both return 200 through the SPA catch-all in `public/_redirects`.
- [ ] All four Reddit call shapes (popular/hot feed, subreddit + sort + pagination, search, post + comments) return real data through `/api/reddit` with zero CORS errors, verified visually in a browser. **Not verified in this session** — this sandbox's outbound network is itself blocked by Reddit (confirmed via a plain `curl https://www.reddit.com/r/popular/hot.json` returning HTTP 403 with Reddit's anti-bot block page, independent of any app code). The `/api/reddit` function correctly reached Reddit and correctly surfaced that 403 as a structured 500 per its existing error-handling branch — proving the function itself works — but no real post/comment data could be fetched from this environment to confirm the full visual path. **Action needed:** re-run `npx netlify dev` from a machine with normal Reddit access (e.g. the maintainer's own machine, where prior local runs succeeded per git history) and manually check all four call shapes before trusting a production deploy.
- [x] `public/_redirects` is unchanged and remains the only place redirect rules are defined. Verified: file untouched.
- [x] `README.md` no longer contains the placeholder Netlify URL. Verified: replaced with a note pending the manual Netlify dashboard step. (Jest claim is Feature 001's responsibility, untouched here.)
