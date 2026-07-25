import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Post from "./Post.jsx";

vi.mock("../utils/redditFetch.js", () => ({
  redditFetch: vi.fn(),
}));

import { redditFetch } from "../utils/redditFetch.js";

function renderPost() {
  return render(
    <MemoryRouter initialEntries={["/r/gaming/gam1"]}>
      <Routes>
        <Route path="/r/:subredditName/:postId" element={<Post />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Post", () => {
  beforeEach(() => {
    redditFetch.mockReset();
    redditFetch.mockResolvedValue([
      {
        data: {
          children: [
            {
              data: {
                id: "gam1",
                title: "A great post",
                author: "brisk_walker",
                selftext: "the body of the post",
                url: "",
                ups: 1234,
              },
            },
          ],
        },
      },
      {
        data: {
          children: [
            { kind: "t1", data: { id: "c1", author: "quiet_otter42", body: "nice one", score: 10 } },
          ],
        },
      },
    ]);
  });

  it("renders the post title, body, author, and score", async () => {
    const { container } = renderPost();
    await waitFor(() => expect(screen.getByRole("heading", { name: "A great post" })).toBeInTheDocument());
    expect(container.querySelector(".post-body").textContent.replace(/\s+/g, " ").trim()).toBe(
      "the body of the post"
    );
    expect(screen.getByText(/u\/brisk_walker/)).toBeInTheDocument();
    expect(screen.getByText(/1\.2K/)).toBeInTheDocument();
  });

  it("renders each top-level comment", async () => {
    renderPost();
    await waitFor(() => expect(screen.getByText("quiet_otter42")).toBeInTheDocument());
    expect(screen.getByText(/nice one/)).toBeInTheDocument();
  });
});
