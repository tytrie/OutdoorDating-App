const api = window.OutdoorApi;
const communityFeed = document.querySelector('[data-community-feed]');
const communityGroups = document.querySelector('[data-community-groups]');
const communitySearch = document.querySelector('[data-community-search]');

let communities = [];

const renderCommunities = (list) => {
  if (!communityFeed) return;
  communityFeed.innerHTML = '';
  list.forEach((community) => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    card.innerHTML = `
      <h3>${community.name}</h3>
      <p>${community.activity}</p>
      <p><strong>${community.members}</strong> active members</p>
      <button class="secondary" data-join-community="${community.id}">Join community</button>
    `;
    communityFeed.append(card);
  });
};

const renderGroups = (groups) => {
  if (!communityGroups) return;
  communityGroups.innerHTML = '';
  groups.forEach((group) => {
    const card = document.createElement('article');
    card.className = 'group-card';
    card.innerHTML = `
      <div class="group-header">
        <div><h4>${group.name}</h4><p>${group.focus || ''}</p></div>
        <span class="group-tag">${group.members?.length || 0} members</span>
      </div>
      <a class="secondary button-link" href="groups.html?id=${group.id}">View group</a>
    `;
    communityGroups.append(card);
  });
};

communitySearch?.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  renderCommunities(communities.filter((c) => c.name.toLowerCase().includes(query)));
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-join-community]');
  if (!target) return;
  target.textContent = 'Joined';
  target.disabled = true;
});

(async () => {
  try {
    const [communityData, groupData] = await Promise.all([api.listCommunities(), api.listGroups()]);
    communities = communityData.communities;
    renderCommunities(communities);
    renderGroups(groupData.groups);
  } catch (error) {
    console.error(error);
  }
})();
