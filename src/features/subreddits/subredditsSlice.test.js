import { describe, it, expect } from "vitest";
import subredditsReducer, { addVisitedSubreddit } from "./subredditsSlice.js";

describe("subredditsSlice - addVisitedSubreddit", () => {
  it("adds a new subreddit to the end of the visited list", () => {
    const state = subredditsReducer({ visited: ["popular"] }, addVisitedSubreddit("gaming"));
    expect(state.visited).toEqual(["popular", "gaming"]);
  });

  it("lowercases the subreddit name", () => {
    const state = subredditsReducer({ visited: ["popular"] }, addVisitedSubreddit("Gaming"));
    expect(state.visited).toEqual(["popular", "gaming"]);
  });

  it("moves an already-visited subreddit to the end instead of duplicating it", () => {
    const state = subredditsReducer(
      { visited: ["popular", "gaming", "movies"] },
      addVisitedSubreddit("gaming")
    );
    expect(state.visited).toEqual(["popular", "movies", "gaming"]);
  });

  it("treats an existing entry as a match regardless of case", () => {
    const state = subredditsReducer(
      { visited: ["popular", "gaming"] },
      addVisitedSubreddit("GAMING")
    );
    expect(state.visited).toEqual(["popular", "gaming"]);
  });

  it("caps the list at 10 entries by dropping the oldest", () => {
    const visited = Array.from({ length: 10 }, (_, i) => `sub${i}`);
    const state = subredditsReducer({ visited }, addVisitedSubreddit("newest"));
    expect(state.visited).toHaveLength(10);
    expect(state.visited[0]).toBe("sub1");
    expect(state.visited.at(-1)).toBe("newest");
    expect(state.visited).not.toContain("sub0");
  });
});
