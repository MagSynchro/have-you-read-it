import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import postsReducer, {
  fetchPosts,
  selectPosts,
  selectPostsLoading,
  selectPostsError,
  selectAfter,
} from "./postsSlice.js";

vi.mock("../../utils/redditFetch.js", () => ({
  redditFetch: vi.fn(),
}));

import { redditFetch } from "../../utils/redditFetch.js";

function makeStore() {
  return configureStore({ reducer: { posts: postsReducer } });
}

describe("postsSlice reducer", () => {
  const initialState = { posts: [], isLoading: false, error: false, after: null };

  it("sets isLoading true and clears error on pending", () => {
    const state = postsReducer(initialState, { type: fetchPosts.pending.type });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(false);
  });

  it("stores posts and after on fulfilled", () => {
    const payload = { posts: [{ id: "a" }], after: "4" };
    const state = postsReducer(
      { ...initialState, isLoading: true },
      { type: fetchPosts.fulfilled.type, payload }
    );
    expect(state.isLoading).toBe(false);
    expect(state.posts).toEqual(payload.posts);
    expect(state.after).toBe("4");
  });

  it("stores the error message and stops loading on rejected", () => {
    const state = postsReducer(
      { ...initialState, isLoading: true },
      { type: fetchPosts.rejected.type, error: { message: "boom" } }
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("boom");
  });
});

describe("fetchPosts thunk", () => {
  beforeEach(() => {
    redditFetch.mockReset();
  });

  it("shapes the redditFetch response into posts + after", async () => {
    redditFetch.mockResolvedValue({
      data: {
        children: [
          {
            data: {
              id: "p1",
              title: "Title",
              author: "author1",
              subreddit: "gaming",
              url: "",
              thumbnail: "self",
              num_comments: 3,
              ups: 100,
            },
          },
        ],
        after: "4",
      },
    });

    const store = makeStore();
    await store.dispatch(fetchPosts({ subreddit: "gaming", sort: "hot" }));

    const state = store.getState();
    expect(selectPosts(state)).toEqual([
      {
        id: "p1",
        title: "Title",
        author: "author1",
        subreddit: "gaming",
        url: "",
        thumbnail: "self",
        num_comments: 3,
        ups: 100,
      },
    ]);
    expect(selectAfter(state)).toBe("4");
    expect(selectPostsLoading(state)).toBe(false);
    expect(selectPostsError(state)).toBe(false);
  });
});
