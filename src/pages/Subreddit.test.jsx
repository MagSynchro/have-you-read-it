import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Subreddit from "./Subreddit.jsx";
import postsReducer from "../features/posts/postsSlice.js";
import subredditsReducer from "../features/subreddits/subredditsSlice.js";

vi.mock("../utils/redditFetch.js", () => ({
  redditFetch: vi.fn(),
}));

import { redditFetch } from "../utils/redditFetch.js";

function renderSubreddit() {
  const store = configureStore({
    reducer: { posts: postsReducer, subreddits: subredditsReducer },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/r/gaming"]}>
        <Routes>
          <Route path="/r/:subredditName" element={<Subreddit />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
}

describe("Subreddit", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    redditFetch.mockReset();
    redditFetch
      .mockResolvedValueOnce({
        data: {
          children: [{ data: { id: "gam1", title: "Gaming Post", author: "a", subreddit: "gaming", url: "", thumbnail: "self", num_comments: 1, ups: 5 } }],
          after: "4",
        },
      })
      .mockResolvedValue({
        data: {
          children: [{ data: { id: "gam5", title: "Second Page Post", author: "a", subreddit: "gaming", url: "", thumbnail: "self", num_comments: 1, ups: 5 } }],
          after: null,
        },
      });
  });

  it("fetches posts for the route's subreddit and marks it visited", async () => {
    const store = renderSubreddit();
    await waitFor(() => expect(screen.getByText("Gaming Post")).toBeInTheDocument());
    expect(redditFetch).toHaveBeenCalledWith(expect.objectContaining({ subreddit: "gaming", sort: "hot" }));
    expect(store.getState().subreddits.visited).toContain("gaming");
  });

  it("fetches the next page using the current after cursor", async () => {
    renderSubreddit();
    await waitFor(() => expect(screen.getByText("Gaming Post")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(redditFetch).toHaveBeenLastCalledWith(
        expect.objectContaining({ subreddit: "gaming", sort: "hot", after: "4" })
      )
    );
  });
});
