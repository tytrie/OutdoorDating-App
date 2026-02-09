const storageKeys = {
  posts: "od_posts",
  postExtras: "od_post_extras",
};

const handleScroll = (event) => {
  const targetButton = event.target.closest("button");
  if (!targetButton) return;
  const scrollTarget = targetButton.dataset.scroll;
  if (!scrollTarget) return;
  const target = document.querySelector(scrollTarget);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

document.addEventListener("click", handleScroll);

const getStored = (key, fallback) => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const setStored = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const params = new URLSearchParams(window.location.search);
let postTitle = params.get("title") || "Adventure post";

const title = document.querySelector("[data-post-title]");
const meta = document.querySelector("[data-post-meta]");
const summary = document.querySelector("[data-post-summary]");
const spots = document.querySelector("[data-post-spots]");
const activity = document.querySelector("[data-post-activity]");
const author = document.querySelector("[data-post-author]");
const time = document.querySelector("[data-post-time]");
const location = document.querySelector("[data-post-location]");
const rsvps = document.querySelector("[data-post-rsvps]");
const likes = document.querySelector("[data-post-likes]");

const commentForm = document.querySelector("[data-comment-form]");
const commentFeed = document.querySelector("[data-comment-feed]");
const editForm = document.querySelector("[data-edit-form]");

const extras = getStored(storageKeys.postExtras, {});
const postExtra = extras[postTitle] || {
  likes: 0,
  rsvps: [],
  comments: [],
};

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
];

const posts = getStored(storageKeys.posts, []);
const storedPost = posts.find((post) => post.title === postTitle);
const fallbackPost = samplePosts.find((post) => post.title === postTitle);
const activePost = storedPost || fallbackPost;

if (title) title.textContent = postTitle;
if (meta) meta.textContent = activePost?.details || "Details appear here.";
if (summary) summary.textContent = activePost?.details || "Local adventure with flexible timing.";
if (spots) spots.textContent = `Spots open: ${activePost?.spots || 0}`;
if (activity) activity.textContent = activePost?.activity || "Activity";
if (author) author.textContent = `Host: ${activePost?.author || "OutdoorDating"}`;
if (time) time.textContent = activePost?.when || "Time";
if (location) location.textContent = activePost?.location || "Location";

const persistExtras = () => {
  extras[postTitle] = postExtra;
  setStored(storageKeys.postExtras, extras);
};

const renderInteractions = () => {
  if (rsvps) {
    rsvps.textContent = postExtra.rsvps.length
      ? `RSVPs: ${postExtra.rsvps.join(", ")}`
      : "No RSVPs yet.";
  }
  if (likes) {
    likes.textContent = `${postExtra.likes} likes`;
  }
};

const renderComments = () => {
  if (!commentFeed) return;
  commentFeed.innerHTML = "";
  postExtra.comments.forEach((comment) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-header">
        <div>
          <h4>${comment.author}</h4>
          <p>${comment.time}</p>
        </div>
        <span class="post-tag">Comment</span>
      </div>
      <p class="post-body">${comment.text}</p>
    `;
    commentFeed.append(card);
  });
};

document.querySelectorAll("[data-post-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.postAction;
    if (action === "like") {
      postExtra.likes += 1;
    }
    if (action === "join") {
      if (!postExtra.rsvps.includes("You")) {
        postExtra.rsvps.unshift("You");
      }
    }
    if (action === "save") {
      if (!postExtra.rsvps.includes("Saved for later")) {
        postExtra.rsvps.unshift("Saved for later");
      }
      button.textContent = "Saved";
    }
    persistExtras();
    renderInteractions();
  });
});

if (commentForm) {
  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(commentForm);
    const text = String(formData.get("comment")).trim();
    if (!text) return;
    postExtra.comments.unshift({
      author: "You",
      time: "Just now",
      text,
    });
    persistExtras();
    commentForm.reset();
    renderComments();
  });
}

renderInteractions();
renderComments();

if (editForm && activePost) {
  editForm.title.value = activePost.title;
  editForm.activity.value = activePost.activity;
  editForm.when.value = activePost.when;
  editForm.location.value = activePost.location;
  editForm.spots.value = activePost.spots;
  editForm.details.value = activePost.details;
}

if (editForm) {
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updated = {
      title: String(formData.get("title")).trim(),
      activity: String(formData.get("activity")).trim(),
      when: String(formData.get("when")).trim(),
      location: String(formData.get("location")).trim(),
      spots: String(formData.get("spots")).trim(),
      details: String(formData.get("details")).trim(),
      author: activePost?.author || "You",
    };
    const stored = getStored(storageKeys.posts, []);
    const index = stored.findIndex((post) => post.title === postTitle);
    if (index !== -1) {
      stored[index] = updated;
    } else {
      stored.unshift(updated);
    }
    setStored(storageKeys.posts, stored);
    if (updated.title !== postTitle) {
      extras[updated.title] = postExtra;
      delete extras[postTitle];
      postTitle = updated.title;
      window.history.replaceState({}, \"\", `post.html?title=${encodeURIComponent(updated.title)}`);
    }
    persistExtras();
    if (title) title.textContent = updated.title;
    if (meta) meta.textContent = updated.details;
    if (summary) summary.textContent = updated.details;
    if (spots) spots.textContent = `Spots open: ${updated.spots}`;
    if (activity) activity.textContent = updated.activity;
    if (author) author.textContent = `Host: ${updated.author}`;
    if (time) time.textContent = updated.when;
    if (location) location.textContent = updated.location;
  });
}
