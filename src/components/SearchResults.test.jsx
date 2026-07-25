import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchResults from "./SearchResults.jsx";

const posts = [
  { id: "p1", title: "First post", author: "a1", subreddit: "gaming", thumbnail: "self", ups: 10, num_comments: 2 },
  { id: "p2", title: "Second post", author: "a2", subreddit: "gaming", thumbnail: "self", ups: 20, num_comments: 4 },
];

describe("SearchResults", () => {
  it("shows a no-results message when results is empty", () => {
    render(
      <MemoryRouter>
        <SearchResults results={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("shows a no-results message when results is undefined", () => {
    render(
      <MemoryRouter>
        <SearchResults results={undefined} />
      </MemoryRouter>
    );
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("renders one PostCard per result", () => {
    render(
      <MemoryRouter>
        <SearchResults results={posts} />
      </MemoryRouter>
    );
    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(screen.getByText("Second post")).toBeInTheDocument();
  });
});
