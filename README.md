# Have You Reddit?

A lightweight Reddit-style browsing client built with React and Redux, running entirely on bundled synthetic demo data (see below) rather than live Reddit content.
The application allows users to browse a sample "popular" feed, explore a curated set of sample subreddits, search sample post content, and view nested comment threads.

This project focuses on modern frontend architecture using Redux Toolkit, client-side routing, and responsive design.

## Live Application

Not yet deployed — the repository is deploy-ready (see `netlify.toml`), but the one-time step of connecting this GitHub repo to a Netlify site via the Netlify dashboard hasn't been done yet. This line will be replaced with the live URL once that's complete.

---

# About the Data

This app doesn't call Reddit's API. Two attempts at live server-side Reddit access were tried and abandoned (see `specs/002-netlify-production-deploy/` and `specs/003-reddit-oauth-access/` for the full history): Reddit blocks unauthenticated requests from datacenter/server IPs outright, and Reddit no longer offers self-serve OAuth app registration for an independently-hosted client like this one — new registrations are funneled toward Devvit, Reddit's in-platform app hosting, which doesn't fit a project meant to showcase a Netlify deployment.

Instead, the app ships with a small set of synthetic, Reddit-shaped sample content (`src/data/demoData.js`) — invented posts, comments, and subreddits, not scraped from real Reddit. No configuration, credentials, or setup steps are needed; `npm run dev` alone is fully functional.

---

# Technologies Used

* React
* Redux Toolkit
* React Router
* Vite
* Vitest
* React Testing Library
* Netlify (Deployment)

---

# Features

* Browse posts from the **Popular** feed
* Navigate to **specific subreddits**
* **Search** Reddit posts
* View **individual post pages**
* Display **images and videos inline**
* Fully **nested comment threads**
* **Pagination** for large result sets
* **Subreddit history dropdown**
* Responsive design supporting **mobile and desktop**
* Smooth **page transitions and UI animations**

---

# Wireframes / Initial Design

Retro ASCII Mockups used during initial project planning.

## Home Page

```
Home>r/subreddit/> Post >            <= (Breadcrumbs)
 ------------------------------
|      HAVE YOU REDDIT?       |
|-----------------------------|
|[Popular▼] [ Search ______ ] |
|-----------------------------|
| Result One for Popular      |
| Result Two for Popular      |
| Result Three for Popular    |
| Result Four for Popular     |
| Result Five for Popular     |
-------------------------------
|            Next>            |
 ------------------------------
```

## Subreddit View

```
-------------------------------------------------
|               HAVE YOU REDDIT?                |
|-----------------------------------------------|
|[Popular▼] [ Search ______ ]                   |
|-----------------------------------------------|
|Home>r/gaming/>                                |
|-----------------------------------------------|
|  Post 1                                       |
|  Post 2                                       |
|  Post 3                                       |
|  Post 4                                       |
-------------------------------------------------
|                    Next>                      |
-------------------------------------------------
```

## Post View

```
Home>r/SubReddit>Post Title>
-------------------------------------------------
|               HAVE YOU REDDIT?                |
|-----------------------------------------------|
|[Popular▼] [ Search ______ ]                   |
|-----------------------------------------------|
|Home>r/gaming/>post title                      |
|-----------------------------------------------|
|  Image / Video / Content                      |
|                                               |
-------------------------------------------------
| Comment                                       |
|-----------------------------------------------|
| SubComment                                    |
| SubComment                                    |
-------------------------------------------------
| Comment                                       |
-------------------------------------------------
```

---

# Future Improvements

* Infinite scrolling for posts
* Improved media handling for Reddit video formats
* Comment collapsing and expanding
* Subreddit autocomplete search
* Dark / Light theme toggle
* Performance optimizations and caching

---

# Testing

Unit tests were written using **Vitest** and **React Testing Library** to validate core components and application behavior.

---

# Author

Phillip Abernathy
