# Plan: 001-unit-test-coverage

## Technical Context

- **Stack:** Vitest + React Testing Library + jsdom, configured through `vite.config.js` (no separate Jest/Babel config needed — Vitest reads Vite's own config and is API-compatible with Jest's `describe`/`it`/`expect`).
- **Dependencies added (devDependencies only):** `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- **Files touched:** `vite.config.js`, `package.json`, new `src/test/setup.js`, one `*.test.js`/`*.test.jsx` file per source file in the Coverage Map, `README.md`.

## Constitution Check

- **Principle 1 (test-first):** this feature *is* the test-first infrastructure; no conflict.
- **Principle 2 (no live external data access):** tests mock `redditFetch` at the module boundary for component/page tests, and exercise the real `demoData.js`-backed `redditFetch` directly for its own unit tests — neither touches the network.
- **Principle 3 (spec before code):** followed here.
- **Principle 5 (simplicity):** Vitest was chosen specifically because it needs no additional config layer beyond what Vite already has — the simpler of the two realistic choices (Vitest vs. Jest+Babel shims for ESM/React 19).
- No violations.

## Project Structure

```
vite.config.js                              (modified: add test block)
src/test/setup.js                           (new)
package.json                                (modified: scripts + devDependencies)
src/utils/helpers.test.js                   (new)
src/utils/redditFetch.test.js               (new)
src/features/posts/postsSlice.test.js       (new)
src/features/subreddits/subredditsSlice.test.js  (new)
src/components/Breadcrumbs.test.jsx         (new)
src/components/FilterBar.test.jsx           (new)
src/components/Pagination.test.jsx          (new)
src/components/SearchResults.test.jsx       (new)
src/components/Comment.test.jsx             (new)
src/components/PostCard.test.jsx            (new)
src/components/SearchBar.test.jsx           (new)
src/components/Header.test.jsx              (new)
src/pages/Home.test.jsx                     (new)
src/pages/Subreddit.test.jsx                (new)
src/pages/Search.test.jsx                   (new)
src/pages/Post.test.jsx                     (new)
README.md                                   (modified: Jest -> Vitest)
```

## Phase 0: Research

**Why Vitest over Jest?** Already decided in `CLAUDE.md` §4 before this spec was written: Vitest reads config directly from `vite.config.js`, needs no Babel/ESM shims for this Vite + React 19 + ESM setup, and is Jest-API-compatible. No open question here — just executing the existing decision.

**Mocking strategy for `redditFetch`:** component/page tests use `vi.mock("../../utils/redditFetch.js")` (or relative equivalent) and provide fixture return values shaped like — but not equal to — the real `demoData.js` content, so a future edit to the demo dataset's actual copy doesn't break unrelated component tests. `redditFetch.test.js` itself is the one place that legitimately exercises the real `demoData.js` import, since that's what it's testing.

**Mocking strategy for Redux:** tests that need `postsSlice`/`subredditsSlice` state use a real `configureStore` with just those reducers (not the whole app store) wrapped in a minimal `<Provider>`, rather than deep-mocking `react-redux` — keeps tests closer to real integration behavior for cheap.

**Routing:** any component using `Link`/`useNavigate`/`useParams`/`useLocation` is wrapped in `<MemoryRouter>` (with `initialEntries`/`initialIndex` where a specific route matters, e.g. `Header`'s `useParams` needing a `/r/:subredditName` route context).

## Phase 1: Design

**`vite.config.js` test block:**
```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/test/setup.js",
}
```

**`src/test/setup.js`:**
```js
import "@testing-library/jest-dom";
```

**`package.json` scripts:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Test-writing order (mirrors `tasks.md`):** pure logic first (highest value, no rendering complexity, fastest feedback), then components (leaf-level, fewer dependencies), then pages (compose components + Redux + routing, most setup). This order also means later tests can lean on confidence already established in earlier ones (e.g. page tests trust `PostCard` already works, so they don't need to re-assert its internals).

**Incidental fix folded in:** `src/pages/Search.jsx`'s `"No rsults found."` typo gets fixed while writing `Search.test.jsx`, per `CLAUDE.md` §1's standing permission to fix it opportunistically while touching that file — not worth its own spec.
