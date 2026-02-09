const communityFeed = document.querySelector("[data-community-feed]");
const communityGroups = document.querySelector("[data-community-groups]");
const communitySearch = document.querySelector("[data-community-search]");

const communities = [
  { name: "Denver, CO", members: 420, activity: "Trail running + climbing" },
  { name: "Portland, OR", members: 310, activity: "Hikes + paddling" },
  { name: "Austin, TX", members: 275, activity: "Cycling + swimming" },
  { name: "Salt Lake City, UT", members: 198, activity: "Ski + climbing" },
  { name: "Seattle, WA", members: 355, activity: "Alpine adventures" },
  { name: "Boulder, CO", members: 289, activity: "Sunrise hikes" },
];

const groups = [
  { name: "Front Range Climbers", focus: "Gym nights + crag days", city: "Denver, CO" },
  { name: "Sunrise Trail Society", focus: "Weekday hikes", city: "Boulder, CO" },
  { name: "After-Work Paddle Club", focus: "Sunset sessions", city: "Portland, OR" },
];

const renderCommunities = (list) => {
  if (!communityFeed) return;
  communityFeed.innerHTML = "";
  list.forEach((community) => {
    const card = document.createElement("article");
    card.className = "feature-card";
    card.innerHTML = `
      <h3>${community.name}</h3>
      <p>${community.activity}</p>
      <p><strong>${community.members}</strong> active members</p>
      <button class="secondary" data-join-community="${community.name}">Join community</button>
    `;
    communityFeed.append(card);
  });
};

const renderGroups = () => {
  if (!communityGroups) return;
  communityGroups.innerHTML = "";
  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "group-card";
    card.innerHTML = `
      <div class="group-header">
        <div>
          <h4>${group.name}</h4>
          <p>${group.focus}</p>
        </div>
        <span class="group-tag">${group.city}</span>
      </div>
      <button class="secondary button-link" onclick="window.location='groups.html?name=${encodeURIComponent(
        group.name
      )}'">View group</button>
    `;
    communityGroups.append(card);
  });
};

if (communitySearch) {
  communitySearch.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    renderCommunities(
      communities.filter((community) => community.name.toLowerCase().includes(query))
    );
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-join-community]");
  if (!target) return;
  target.textContent = "Joined";
  target.disabled = true;
});

renderCommunities(communities);
renderGroups();
