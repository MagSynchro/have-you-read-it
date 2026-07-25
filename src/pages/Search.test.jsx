import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search.jsx";

vi.mock("../utils/redditFetch.js", () => ({
  redditFetch: vi.fn(),
}));

import { redditFetch } from "../utils/redditFetch.js";

function renderSearch(query) {
  return render(
    <MemoryRouter initialEntries={[`/search?q=${query}`]}>
      <Search />
    </MemoryRouter>
  );
}

describe("Search", () => {
  beforeEach(() => {
    redditFetch.mockReset();
  });

  it("shows a loading state before results arrive", () => {
    redditFetch.mockReturnValue(new Promise(() => {})); // never resolves
    renderSearch("cats");
    expect(screen.getByText("Loading results...")).toBeInTheDocument();
  });

  it("shows matching results once the fetch resolves", async () => {
    redditFetch.mockResolvedValue({
      data: {
        children: [{ data: { id: "pics3", title: "My cat post", author: "a", subreddit: "pics", thumbnail: "self", num_comments: 1, ups: 5 } }],
      },
    });
    renderSearch("cats");
    await waitFor(() => expect(screen.getByText("My cat post")).toBeInTheDocument());
  });

  it("shows a no-results message when nothing matches", async () => {
    redditFetch.mockResolvedValue({ data: { children: [] } });
    renderSearch("zzz");
    await waitFor(() => expect(screen.getByText("No results found.")).toBeInTheDocument());
  });
});
