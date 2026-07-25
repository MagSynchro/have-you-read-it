import { describe, it, expect } from "vitest";
import { redditFetch } from "./redditFetch.js";
import { POSTS_BY_SUBREDDIT } from "../data/demoData.js";

describe("redditFetch - subreddit listings", () => {
  it("returns the first page of posts in curated order for sort=hot", async () => {
    const result = await redditFetch({ subreddit: "gaming", sort: "hot" });
    const ids = result.data.children.map((c) => c.data.id);
    expect(ids).toEqual(["gam1", "gam2", "gam3", "gam4"]);
    expect(result.data.after).toBe("4");
  });

  it("sorts by ups descending for sort=top", async () => {
    const result = await redditFetch({ subreddit: "gaming", sort: "top" });
    const ups = result.data.children.map((c) => c.data.ups);
    const sorted = [...ups].sort((a, b) => b - a);
    expect(ups).toEqual(sorted);
  });

  it("reverses curated order for sort=new", async () => {
    const all = POSTS_BY_SUBREDDIT.gaming;
    const result = await redditFetch({ subreddit: "gaming", sort: "new" });
    const ids = result.data.children.map((c) => c.data.id);
    expect(ids).toEqual([...all].reverse().slice(0, 4).map((p) => p.id));
  });

  it("returns an empty listing for an unknown subreddit", async () => {
    const result = await redditFetch({ subreddit: "not-a-real-subreddit", sort: "hot" });
    expect(result.data.children).toEqual([]);
    expect(result.data.after).toBeNull();
  });
});

describe("redditFetch - pagination", () => {
  it("advances to the next page using the after cursor", async () => {
    const first = await redditFetch({ subreddit: "gaming", sort: "hot" });
    const second = await redditFetch({ subreddit: "gaming", sort: "hot", after: first.data.after });
    const ids = second.data.children.map((c) => c.data.id);
    expect(ids).toEqual(["gam5", "gam6"]);
    expect(second.data.after).toBeNull();
  });

  it("loops back to the first page once the after cursor is null", async () => {
    const result = await redditFetch({ subreddit: "gaming", sort: "hot", after: null });
    const ids = result.data.children.map((c) => c.data.id);
    expect(ids).toEqual(["gam1", "gam2", "gam3", "gam4"]);
  });
});

describe("redditFetch - post + comments", () => {
  it("returns the post and its comments for a known postId", async () => {
    const [postListing, commentsListing] = await redditFetch({ subreddit: "gaming", postId: "gam1" });
    expect(postListing.data.children[0].data.id).toBe("gam1");
    expect(commentsListing.data.children.length).toBeGreaterThan(0);
  });

  it("returns a graceful fallback for an unknown postId", async () => {
    const [postListing, commentsListing] = await redditFetch({ subreddit: "gaming", postId: "does-not-exist" });
    expect(postListing.data.children[0].data.title).toBe("Post not found");
    expect(commentsListing.data.children).toEqual([]);
  });
});

describe("redditFetch - search", () => {
  it("returns matching posts by case-insensitive title substring", async () => {
    const result = await redditFetch({ query: "CAT" });
    expect(result.data.children.some((c) => c.data.id === "pics3")).toBe(true);
  });

  it("returns an empty listing when nothing matches", async () => {
    const result = await redditFetch({ query: "zzz_no_such_post_exists" });
    expect(result.data.children).toEqual([]);
  });
});
