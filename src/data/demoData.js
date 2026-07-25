// Bundled synthetic demo data standing in for live Reddit content.
// Shaped to match Reddit's own JSON listing/comment schema so the rest of
// the app (postsSlice, Post.jsx, Search.jsx) needs no changes to consume it.
// See specs/004-static-demo-data/spec.md for why this exists.

function img(label, color = "3a3a3a") {
  return `https://placehold.co/160x100/${color}/ffffff?text=${encodeURIComponent(label)}`;
}

function post({ id, title, author, subreddit, ups, num_comments, selftext, url, thumbnail }) {
  return { id, title, author, subreddit, ups, num_comments, selftext: selftext || "", url: url || "", thumbnail: thumbnail ?? "self" };
}

function comment(id, author, body, score, replies = []) {
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

export const POSTS_BY_SUBREDDIT = {
  popular: [
    post({ id: "pop1", title: "What's a small thing that instantly improves your day?", author: "quiet_otter42", subreddit: "popular", ups: 18400, num_comments: 5, selftext: "Could be anything, big or small. For me it's the first coffee of the morning in total silence before anyone else is awake." }),
    post({ id: "pop2", title: "This 100-year-old bridge is still in daily use", author: "brisk_walker", subreddit: "popular", ups: 9600, num_comments: 4, url: img("Old Bridge", "5b4636"), thumbnail: img("Old Bridge", "5b4636") }),
    post({ id: "pop3", title: "Scientists confirm what we suspected about naps", author: "dr_beanbag", subreddit: "popular", ups: 7200, num_comments: 4, url: "https://example-news.test/articles/nap-study", thumbnail: "default" }),
    post({ id: "pop4", title: "My grandmother's recipe box, digitized after 60 years", author: "mellow_tangent", subreddit: "popular", ups: 22100, num_comments: 3, url: img("Recipe Box", "8a6d3f"), thumbnail: img("Recipe Box", "8a6d3f") }),
    post({ id: "pop5", title: "PSA: check your smoke detector batteries this weekend", author: "copper_finch", subreddit: "popular", ups: 15300, num_comments: 3, selftext: "Seriously, it takes two minutes and it's the kind of thing everyone puts off. Do it today." }),
    post({ id: "pop6", title: "The last surviving typewriter repair shop in the city", author: "echo_valley", subreddit: "popular", ups: 6100, num_comments: 3, url: "https://example-news.test/articles/typewriter-shop" }),
  ],
  gaming: [
    post({ id: "gam1", title: "Finally beat Hollow Meadow after 40 attempts", author: "late_night_coder", subreddit: "gaming", ups: 4300, num_comments: 4, selftext: "The final boss took me a week but the ending cutscene made it all worth it. No spoilers but wow." }),
    post({ id: "gam2", title: "Warning: unexpectedly intense jump scare in the new Nightfall Arena update", author: "pinecone_hollow", subreddit: "gaming", ups: 2100, num_comments: 3, thumbnail: "nsfw" }),
    post({ id: "gam3", title: "My battlestation setup for Voxel Frontier co-op night", author: "stardust_sam", subreddit: "gaming", ups: 3900, num_comments: 3, url: img("Battlestation", "23394a"), thumbnail: img("Battlestation", "23394a") }),
    post({ id: "gam4", title: "Unpopular opinion: Ridge Runners is better than the original", author: "quiet_otter42", subreddit: "gaming", ups: 1500, num_comments: 4, selftext: "The map design alone is a huge step up, and the soundtrack doesn't get enough credit either." }),
    post({ id: "gam5", title: "Quantum Drift speedrun world record just got broken", author: "brisk_walker", subreddit: "gaming", ups: 8700, num_comments: 3, url: "https://v.redd.it/demo-speedrun-clip" }),
    post({ id: "gam6", title: "PSA: Pixel Keep is 70% off right now", author: "dr_beanbag", subreddit: "gaming", ups: 2600, num_comments: 3, thumbnail: "default" }),
  ],
  technology: [
    post({ id: "tech1", title: "This open-source tool cut our build times in half", author: "echo_valley", subreddit: "technology", ups: 5400, num_comments: 4, selftext: "We switched our CI pipeline over last month and the difference has been dramatic. Happy to answer questions about the migration." }),
    post({ id: "tech2", title: "New display panel promises deeper contrast at lower power draw", author: "mellow_tangent", subreddit: "technology", ups: 3300, num_comments: 3, url: img("New Display", "1f3a2e"), thumbnail: img("New Display", "1f3a2e") }),
    post({ id: "tech3", title: "A deep dive into how the old dial-up handshake sound actually worked", author: "copper_finch", subreddit: "technology", ups: 6800, num_comments: 4, url: "https://example-news.test/articles/dialup-handshake" }),
    post({ id: "tech4", title: "Local repair cafe has fixed over 2,000 devices this year", author: "late_night_coder", subreddit: "technology", ups: 4100, num_comments: 3, selftext: "It's entirely volunteer-run and mostly funded by donations. Nice to see this kind of thing still thriving." }),
    post({ id: "tech5", title: "Spoiler-free thoughts on the new keyboard switch I've been testing for a month", author: "pinecone_hollow", subreddit: "technology", ups: 1900, num_comments: 3, thumbnail: "spoiler" }),
    post({ id: "tech6", title: "Why this decade-old laptop still outlasts most new ones", author: "stardust_sam", subreddit: "technology", ups: 7300, num_comments: 3, url: img("Old Laptop", "3a2e1f"), thumbnail: img("Old Laptop", "3a2e1f") }),
  ],
  pics: [
    post({ id: "pics1", title: "Fog rolling over the valley this morning", author: "quiet_otter42", subreddit: "pics", ups: 12400, num_comments: 3, url: img("Foggy Valley", "445566"), thumbnail: img("Foggy Valley", "445566") }),
    post({ id: "pics2", title: "Found this hand-painted sign in a small town diner", author: "brisk_walker", subreddit: "pics", ups: 8100, num_comments: 3, url: img("Diner Sign", "6b4f2a"), thumbnail: img("Diner Sign", "6b4f2a") }),
    post({ id: "pics3", title: "My cat discovered the box the new couch came in", author: "dr_beanbag", subreddit: "pics", ups: 20300, num_comments: 4, url: img("Cat in Box", "555555"), thumbnail: img("Cat in Box", "555555") }),
    post({ id: "pics4", title: "This library reading room hasn't changed in 80 years", author: "mellow_tangent", subreddit: "pics", ups: 9700, num_comments: 3, url: img("Reading Room", "4a3b2c"), thumbnail: img("Reading Room", "4a3b2c") }),
    post({ id: "pics5", title: "Sunset from the rooftop last night, no filter", author: "copper_finch", subreddit: "pics", ups: 15800, num_comments: 3, url: img("Rooftop Sunset", "aa5533"), thumbnail: img("Rooftop Sunset", "aa5533") }),
    post({ id: "pics6", title: "Handwritten letters my grandparents sent each other in the 1950s", author: "echo_valley", subreddit: "pics", ups: 26900, num_comments: 4, url: img("Old Letters", "8a7a5a"), thumbnail: img("Old Letters", "8a7a5a") }),
  ],
  movies: [
    post({ id: "mov1", title: "Spoiler: the twist in the new mystery film everyone's talking about", author: "late_night_coder", subreddit: "movies", ups: 4600, num_comments: 4, thumbnail: "spoiler", selftext: "Still can't believe they pulled it off without a single hint in the trailer." }),
    post({ id: "mov2", title: "This practical-effects-only sci-fi film from the 80s still holds up", author: "pinecone_hollow", subreddit: "movies", ups: 7400, num_comments: 3, url: img("Sci-Fi Poster", "2a2a4a"), thumbnail: img("Sci-Fi Poster", "2a2a4a") }),
    post({ id: "mov3", title: "The score for this film deserves way more recognition", author: "stardust_sam", subreddit: "movies", ups: 3100, num_comments: 3, selftext: "Listened to the soundtrack on repeat for a week straight after watching it." }),
    post({ id: "mov4", title: "Underrated director you should know about", author: "quiet_otter42", subreddit: "movies", ups: 5200, num_comments: 3, url: "https://example-news.test/articles/underrated-director" }),
    post({ id: "mov5", title: "Behind-the-scenes photo from a classic set", author: "brisk_walker", subreddit: "movies", ups: 11200, num_comments: 3, url: img("Film Set", "333344"), thumbnail: img("Film Set", "333344") }),
    post({ id: "mov6", title: "A trailer that's better than the movie it advertised", author: "dr_beanbag", subreddit: "movies", ups: 2800, num_comments: 3, thumbnail: "default" }),
  ],
};

export const COMMENTS_BY_POST_ID = {
  pop1: [
    comment("c-pop1-1", "brisk_walker", "For me it's stepping outside barefoot on the grass for a minute before the day starts.", 320, [
      comment("c-pop1-1-1", "quiet_otter42", "Underrated. I do this too, it resets something.", 88),
    ]),
    comment("c-pop1-2", "dr_beanbag", "Making the bed. Sounds small but it changes the whole tone of the room.", 210),
  ],
  pop2: [
    comment("c-pop2-1", "mellow_tangent", "The stonework on that arch is incredible for its age.", 140),
    comment("c-pop2-2", "copper_finch", "I walked across this exact bridge last year, didn't realize how old it was.", 95),
  ],
  pop3: [
    comment("c-pop3-1", "echo_valley", "As someone who naps daily, vindicated.", 402),
    comment("c-pop3-2", "late_night_coder", "20 minutes is the sweet spot, any longer and I wake up worse.", 176),
  ],
  pop4: [
    comment("c-pop4-1", "pinecone_hollow", "This is so wholesome, thank you for sharing it.", 512),
    comment("c-pop4-2", "stardust_sam", "The handwriting alone is a piece of history.", 233),
  ],
  pop5: [
    comment("c-pop5-1", "quiet_otter42", "Just did mine, one was completely dead. Good reminder.", 301),
  ],
  pop6: [
    comment("c-pop6-1", "brisk_walker", "Didn't know these still existed. Hope they stay open.", 150),
  ],
  gam1: [
    comment("c-gam1-1", "pinecone_hollow", "That final boss broke me too. Congrats!", 210, [
      comment("c-gam1-1-1", "late_night_coder", "The phase 2 attack pattern is brutal.", 60),
    ]),
    comment("c-gam1-2", "stardust_sam", "40 attempts is honestly respectable, mine took longer.", 88),
  ],
  gam2: [
    comment("c-gam2-1", "quiet_otter42", "Turned my volume down just in time, thanks for the warning.", 140),
  ],
  gam3: [
    comment("c-gam3-1", "dr_beanbag", "Clean setup, what's the second monitor for?", 76),
    comment("c-gam3-2", "brisk_walker", "Co-op nights hit different with a setup like this.", 54),
  ],
  gam4: [
    comment("c-gam4-1", "echo_valley", "Hard disagree, but I respect the take.", 40, [
      comment("c-gam4-1-1", "quiet_otter42", "Fair, the soundtrack point still stands though.", 22),
    ]),
  ],
  gam5: [
    comment("c-gam5-1", "mellow_tangent", "The route optimization in the third section is insane.", 190),
  ],
  gam6: [
    comment("c-gam6-1", "copper_finch", "Grabbing it now, thanks for the heads up.", 65),
  ],
  tech1: [
    comment("c-tech1-1", "stardust_sam", "What did you switch from? We're evaluating options right now.", 120),
    comment("c-tech1-2", "pinecone_hollow", "Half the build time is a huge deal at scale.", 98),
  ],
  tech2: [
    comment("c-tech2-1", "late_night_coder", "Lower power draw with better contrast is a rare combo.", 140),
  ],
  tech3: [
    comment("c-tech3-1", "quiet_otter42", "Never knew the history behind that sound, fascinating.", 210),
    comment("c-tech3-2", "dr_beanbag", "That sound is basically nostalgia in audio form now.", 175),
  ],
  tech4: [
    comment("c-tech4-1", "brisk_walker", "Love seeing volunteer-run spaces like this succeed.", 133),
  ],
  tech5: [
    comment("c-tech5-1", "mellow_tangent", "Curious which switch, I've been switch-shopping myself.", 70),
  ],
  tech6: [
    comment("c-tech6-1", "echo_valley", "Build quality from that era really was different.", 165),
  ],
  pics1: [comment("c-pics1-1", "copper_finch", "Gorgeous shot, what camera?", 220)],
  pics2: [comment("c-pics2-1", "stardust_sam", "Diners like this are a dying breed.", 140)],
  pics3: [
    comment("c-pics3-1", "quiet_otter42", "Couches are just expensive box dispensers for cats.", 340),
    comment("c-pics3-2", "late_night_coder", "10/10 cat tax accepted.", 210),
  ],
  pics4: [comment("c-pics4-1", "dr_beanbag", "That warm light through the windows is perfect.", 180)],
  pics5: [comment("c-pics5-1", "pinecone_hollow", "No filter needed with a sky like that.", 260)],
  pics6: [
    comment("c-pics6-1", "brisk_walker", "This is the kind of thing that needs to be archived somewhere safe.", 410),
    comment("c-pics6-2", "mellow_tangent", "The penmanship from that generation is unreal.", 190),
  ],
  mov1: [
    comment("c-mov1-1", "echo_valley", "Agreed, rewatched it immediately after and caught the setup.", 230),
  ],
  mov2: [comment("c-mov2-1", "copper_finch", "Practical effects age so much better than early CGI.", 195)],
  mov3: [comment("c-mov3-1", "stardust_sam", "That composer doesn't get nearly enough credit.", 150)],
  mov4: [comment("c-mov4-1", "quiet_otter42", "Adding their whole filmography to my watchlist now.", 110)],
  mov5: [comment("c-mov5-1", "dr_beanbag", "Love seeing the practical set pieces up close like this.", 175)],
  mov6: [comment("c-mov6-1", "pinecone_hollow", "Happens more often than people admit.", 88)],
};
