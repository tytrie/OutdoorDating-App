const profileFeed = document.querySelector("[data-profile-feed]");
const swipeStatus = document.querySelector("[data-swipe-status]");

const profiles = [
  { name: "Ari C.", location: "Denver", activity: "Trail runner", tags: ["Early riser", "Gear share"] },
  { name: "Maya J.", location: "Salt Lake", activity: "Climber", tags: ["Lead certified", "Weekend trips"] },
  { name: "Riley B.", location: "Portland", activity: "Kayaker", tags: ["Beginner friendly", "Weeknights"] },
  { name: "Sam K.", location: "Austin", activity: "Cyclist", tags: ["Social rides", "Coffee stops"] },
  { name: "Nia L.", location: "Seattle", activity: "Hiker", tags: ["Waterfalls", "Sunsets"] },
  { name: "Devon S.", location: "Boulder", activity: "Climber", tags: ["Boulder pads", "Belay"] },
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

const setStored = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const swipeKey = "od_profile_swipes";
const swipes = getStored(swipeKey, { likes: 0, passes: 0 });

const updateStatus = () => {
  if (!swipeStatus) return;
  swipeStatus.textContent = `${swipes.likes} likes • ${swipes.passes} passes`;
};

const handleSwipe = (type) => {
  if (type === "like") {
    swipes.likes += 1;
  }
  if (type === "pass") {
    swipes.passes += 1;
  }
  setStored(swipeKey, swipes);
  updateStatus();
};

const renderProfiles = () => {
  if (!profileFeed) return;
  profileFeed.innerHTML = "";
  profiles.forEach((profile) => {
    const card = document.createElement("article");
    card.className = "profile-card";
    card.innerHTML = `
      <div class="profile-top">
        <div class="avatar">${profile.name
          .split(" ")
          .map((part) => part[0])
          .join("")}</div>
        <div>
          <h4>${profile.name}</h4>
          <p>${profile.activity} • ${profile.location}</p>
        </div>
      </div>
      <div class="profile-tags">
        ${profile.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="cta-row">
        <button class="secondary" data-swipe="pass">Pass</button>
        <button class="primary" data-swipe="like">Like</button>
      </div>
    `;
    profileFeed.append(card);
  });
};

profileFeed?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-swipe]");
  if (!button) return;
  handleSwipe(button.dataset.swipe);
});

renderProfiles();
updateStatus();
