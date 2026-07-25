import { POSTS_BY_SUBREDDIT, COMMENTS_BY_POST_ID } from "../data/demoData.js";

const PAGE_SIZE = 4;

function sortPosts(posts, sort) {
  if (sort === "top") return [...posts].sort((a, b) => b.ups - a.ups);
  if (sort === "new") return [...posts].reverse();
  return posts; // hot / best: curated order
}

function buildListing(posts, after) {
  const startIndex = after ? parseInt(after, 10) : 0;
  const page = posts.slice(startIndex, startIndex + PAGE_SIZE);
  const nextIndex = startIndex + PAGE_SIZE;
  const nextAfter = nextIndex < posts.length ? String(nextIndex) : null;

  return {
    data: {
      children: page.map((data) => ({ kind: "t3", data })),
      after: nextAfter,
    },
  };
}

function findPost(postId) {
  for (const posts of Object.values(POSTS_BY_SUBREDDIT)) {
    const found = posts.find((p) => p.id === postId);
    if (found) return found;
  }
  return null;
}

export async function redditFetch({ subreddit, sort, after, postId, query }) {
  if (postId) {
    const post = findPost(postId) || {
      id: postId,
      title: "Post not found",
      author: "[deleted]",
      subreddit: subreddit || "",
      selftext: "This post isn't part of the demo dataset.",
      url: "",
      thumbnail: "self",
      ups: 0,
      num_comments: 0,
    };
    const comments = COMMENTS_BY_POST_ID[postId] || [];

    return [
      { data: { children: [{ kind: "t3", data: post }] } },
      { data: { children: comments } },
    ];
  }

  if (query) {
    const q = query.toLowerCase();
    const matches = Object.values(POSTS_BY_SUBREDDIT)
      .flat()
      .filter((p) => p.title.toLowerCase().includes(q));

    return { data: { children: matches.map((data) => ({ kind: "t3", data })), after: null } };
  }

  const posts = POSTS_BY_SUBREDDIT[subreddit] || [];
  return buildListing(sortPosts(posts, sort), after);
}
