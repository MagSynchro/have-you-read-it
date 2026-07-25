import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home.jsx";
import postsReducer from "../features/posts/postsSlice.js";

vi.mock("../utils/redditFetch.js", () => ({
  redditFetch: vi.fn(),
}));

import { redditFetch } from "../utils/redditFetch.js";

function renderHome() {
  const store = configureStore({ reducer: { posts: postsReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>
  );
}

describe("Home", () => {
  beforeEach(() => {
    redditFetch.mockReset();
    redditFetch.mockResolvedValue({
      data: {
        children: [
          { data: { id: "p1", title: "Popular Post", author: "a", subreddit: "popular", url: "", thumbnail: "self", num_comments: 1, ups: 5 } },
        ],
        after: null,
      },
    });
  });

  it("fetches and renders the popular feed on mount", async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText("Popular Post")).toBeInTheDocument());
    expect(redditFetch).toHaveBeenCalledWith(expect.objectContaining({ subreddit: "popular", sort: "hot" }));
  });

  it("re-fetches with the new sort when a filter is clicked", async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText("Popular Post")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "New" }));

    await waitFor(() =>
      expect(redditFetch).toHaveBeenCalledWith(expect.objectContaining({ subreddit: "popular", sort: "new" }))
    );
  });
});
