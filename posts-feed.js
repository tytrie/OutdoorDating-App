const postsFeed = document.querySelector("[data-posts-feed]");

const samplePosts = [
  {
    title: "Alpine dawn patrol",
    when: "Sat 5:40 AM",
    location: "St. Mary trailhead",
    activity: "Hike",
    spots: 2,
    details: "Sunrise mission + coffee afterward.",
    author: "Lina S.",
  },
  {
    title: "Bike to the hot springs",
    when: "Saturday",
    location: "Park gate",
    activity: "Bike",
    spots: 4,
    details: "Social ride with snacks and a playlist.",
    author: "Isaiah M.",
  },
  {
    title: "After-work boulder session",
    when: "Fri 6:00 PM",
    location: "River gym",
    activity: "Climb",
    spots: 3,
    details: "Casual climb and gear share.",
    author: "Rhea K.",
  },
];

const getStored = (key, fallback) => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const renderPosts = () => {
  if (!postsFeed) return;
  postsFeed.innerHTML = "";
  const stored = getStored("od_posts", []);
  const posts = [...stored, ...samplePosts];
  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-header">
        <div>
          <h4>${post.title}</h4>
          <p>${post.when} • ${post.location}</p>
        </div>
        <span class="post-tag">${post.activity}</span>
      </div>
      <p class="post-body">${post.details}</p>
      <div class="post-footer">
        <div>
          <strong>${post.spots} spots open</strong>
          <span>Posted by ${post.author}</span>
        </div>
        <a class="secondary button-link" href="post.html?title=${encodeURIComponent(
          post.title
        )}">Open post</a>
      </div>
    `;
    postsFeed.append(card);
  });
};

renderPosts();
