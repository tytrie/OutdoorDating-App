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
const postTitle = params.get("title") || "Adventure post";

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

const extras = getStored(storageKeys.postExtras, {});
const postExtra = extras[postTitle] || {
  likes: 0,
  rsvps: [],
  comments: [],
};

const posts = getStored(storageKeys.posts, []);
const storedPost = posts.find((post) => post.title === postTitle);

if (title) title.textContent = postTitle;
if (meta) meta.textContent = storedPost?.details || "Details appear here.";
if (summary) summary.textContent = storedPost?.details || "Local adventure with flexible timing.";
if (spots) spots.textContent = `Spots open: ${storedPost?.spots || 0}`;
if (activity) activity.textContent = storedPost?.activity || "Activity";
if (author) author.textContent = `Host: ${storedPost?.author || "OutdoorDating"}`;
if (time) time.textContent = storedPost?.when || "Time";
if (location) location.textContent = storedPost?.location || "Location";

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
      postExtra.rsvps.unshift("You");
    }
    if (action === "save") {
      postExtra.rsvps.unshift("Saved for later");
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
