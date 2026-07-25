import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Comment from "./Comment.jsx";

function makeComment(id, author, body, score, replies = []) {
  return {
    kind: "t1",
    data: {
      id,
      author,
      body,
      score,
      ...(replies.length ? { replies: { data: { children: replies } } } : {}),
    },
  };
}

describe("Comment", () => {
  it("renders nothing for a non-t1 kind", () => {
    const { container } = render(<Comment comment={{ kind: "more", data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when comment is falsy", () => {
    const { container } = render(<Comment comment={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the author and plain text body", () => {
    render(<Comment comment={makeComment("c1", "brisk_walker", "just plain text here", 42)} />);
    expect(screen.getByText("brisk_walker")).toBeInTheDocument();
    expect(screen.getByText(/plain text here/)).toBeInTheDocument();
    expect(screen.getByText("⬆42")).toBeInTheDocument();
  });

  it("renders an inline image for an image URL in the body", () => {
    render(<Comment comment={makeComment("c2", "a", "look at this https://example.com/pic.jpg neat", 5)} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
  });

  it("renders an inline video for a v.redd.it URL", () => {
    const { container } = render(
      <Comment comment={makeComment("c3", "a", "clip here https://v.redd.it/abc123", 5)} />
    );
    expect(container.querySelector("video source")).toHaveAttribute("src", "https://v.redd.it/abc123");
  });

  it("renders a clickable link for a plain URL", () => {
    render(<Comment comment={makeComment("c4", "a", "see https://example.com/article", 5)} />);
    expect(screen.getByRole("link", { name: "https://example.com/article" })).toHaveAttribute(
      "href",
      "https://example.com/article"
    );
  });

  it("recursively renders nested replies", () => {
    const reply = makeComment("c5-1", "quiet_otter42", "a reply", 3);
    render(<Comment comment={makeComment("c5", "brisk_walker", "top level", 10, [reply])} />);
    expect(screen.getByText("brisk_walker")).toBeInTheDocument();
    expect(screen.getByText("quiet_otter42")).toBeInTheDocument();
    expect(screen.getByText(/a reply/)).toBeInTheDocument();
  });
});
