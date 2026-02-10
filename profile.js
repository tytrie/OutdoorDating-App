const api = window.OutdoorApi;
const profileForm = document.querySelector('[data-profile-form]');
const profileName = document.querySelector('[data-profile-name]');
const profileBio = document.querySelector('[data-profile-bio]');
const profileLocation = document.querySelector('[data-profile-location]');
const profileTags = document.querySelector('[data-profile-tags]');
const calendarGrid = document.querySelector('[data-profile-calendar]');
const eventList = document.querySelector('[data-profile-event-list]');
const sidebarEvents = document.querySelector('[data-profile-events]');

let events = [];

const renderProfile = (profile) => {
  if (!profile) return;
  profileName.textContent = profile.name || 'Adventure profile';
  profileBio.textContent = profile.bio || 'Update your info to help matches find you.';
  profileLocation.textContent = `Location: ${profile.location || 'Unknown'}`;
  profileTags.innerHTML = '';
  (profile.activities || '').split(',').map((x) => x.trim()).filter(Boolean).forEach((activity) => {
    const tag = document.createElement('span');
    tag.textContent = activity;
    profileTags.append(tag);
  });
  if (profileForm) {
    profileForm.name.value = profile.name || '';
    profileForm.location.value = profile.location || '';
    profileForm.activities.value = profile.activities || '';
    profileForm.availability.value = profile.availability || '';
    profileForm.bio.value = profile.bio || '';
  }
};

const renderEvents = () => {
  calendarGrid.innerHTML = '';
  sidebarEvents.innerHTML = '';
  eventList.innerHTML = '';
  events.slice(0, 7).forEach((event) => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    cell.innerHTML = `${event.time}<span>${event.title}</span>`;
    calendarGrid.append(cell);
  });
  events.slice(0, 3).forEach((event) => {
    const row = document.createElement('div');
    row.className = 'calendar-event';
    row.innerHTML = `<strong>${event.time}</strong><span>${event.title} • ${event.groupName || ''}</span>`;
    sidebarEvents.append(row);
  });
  events.forEach((event) => {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.innerHTML = `<div class="post-header"><div><h4>${event.title}</h4><p>${event.time} • ${event.location || ''}</p></div><span class="post-tag">${event.visibility || 'Group'}</span></div><p class="post-body">${event.notes || ''}</p>`;
    eventList.append(card);
  });
};

profileForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const fd = new FormData(profileForm);
    const data = await api.updateProfile({
      name: String(fd.get('name')).trim(),
      location: String(fd.get('location')).trim(),
      activities: String(fd.get('activities')).trim(),
      availability: String(fd.get('availability')).trim(),
      bio: String(fd.get('bio')).trim()
    });
    renderProfile(data.profile);
  } catch (error) {
    alert(error.message);
  }
});

(async () => {
  try {
    const [profileData, eventsData] = await Promise.all([api.getProfile(), api.profileEvents()]);
    renderProfile(profileData.profile || {});
    events = eventsData.events || [];
    renderEvents();
  } catch (error) {
    alert('Log in to use profile features.');
  }
})();
