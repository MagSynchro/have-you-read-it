import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostCard from "./PostCard.jsx";

function makePost(overrides = {}) {
  return {
    id: "p1",
    title: "A Test Post",
    author: "brisk_walker",
    subreddit: "gaming",
    ups: 1200,
    num_comments: 34,
    thumbnail: "self",
    ...overrides,
  };
}

function renderCard(post) {
  return render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>
  );
}

describe("PostCard", () => {
  it("links to the post's subreddit/id route", () => {
    renderCard(makePost());
    expect(screen.getByRole("link")).toHaveAttribute("href", "/r/gaming/p1");
  });

  it("renders title, author, and subreddit", () => {
    renderCard(makePost());
    expect(screen.getByText("A Test Post")).toBeInTheDocument();
    expect(screen.getByText(/u\/brisk_walker/)).toBeInTheDocument();
    expect(screen.getByText(/r\/gaming/)).toBeInTheDocument();
  });

  it.each(["self", "default", "nsfw", "spoiler", "not-a-url"])(
    "suppresses the thumbnail for %s",
    (thumbnail) => {
      renderCard(makePost({ thumbnail }));
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    }
  );

  it("shows the thumbnail for a valid http image URL", () => {
    renderCard(makePost({ thumbnail: "http://example.com/thumb.jpg" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "http://example.com/thumb.jpg");
  });
});
