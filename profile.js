const profileForm = document.querySelector("[data-profile-form]");
const profileName = document.querySelector("[data-profile-name]");
const profileBio = document.querySelector("[data-profile-bio]");
const profileLocation = document.querySelector("[data-profile-location]");
const profileTags = document.querySelector("[data-profile-tags]");
const calendarGrid = document.querySelector("[data-profile-calendar]");
const eventList = document.querySelector("[data-profile-event-list]");
const sidebarEvents = document.querySelector("[data-profile-events]");

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

const profileKey = "od_profile";
const eventsKey = "od_profile_events";

const renderProfile = () => {
  const profile = getStored(profileKey, null);
  if (!profile) return;
  if (profileName) profileName.textContent = profile.name;
  if (profileBio) profileBio.textContent = profile.bio;
  if (profileLocation) profileLocation.textContent = `Location: ${profile.location}`;
  if (profileTags) {
    profileTags.innerHTML = "";
    profile.activities.split(",").forEach((activity) => {
      const tag = document.createElement("span");
      tag.textContent = activity.trim();
      profileTags.append(tag);
    });
  }
  if (profileForm) {
    profileForm.name.value = profile.name;
    profileForm.location.value = profile.location;
    profileForm.activities.value = profile.activities;
    profileForm.availability.value = profile.availability;
    profileForm.bio.value = profile.bio;
  }
};

const renderEvents = () => {
  const events = getStored(eventsKey, []);
  if (calendarGrid) {
    calendarGrid.innerHTML = "";
    events.slice(0, 7).forEach((event) => {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.innerHTML = `${event.time}<span>${event.title}</span>`;
      calendarGrid.append(cell);
    });
  }
  if (sidebarEvents) {
    sidebarEvents.innerHTML = "";
    events.slice(0, 3).forEach((event) => {
      const row = document.createElement("div");
      row.className = "calendar-event";
      row.innerHTML = `<strong>${event.time}</strong><span>${event.title}</span>`;
      sidebarEvents.append(row);
    });
  }
  if (eventList) {
    eventList.innerHTML = "";
    events.forEach((event, index) => {
      const card = document.createElement("article");
      card.className = "post-card";
      card.innerHTML = `
        <div class="post-header">
          <div>
            <h4>${event.title}</h4>
            <p>${event.time} • ${event.location}</p>
          </div>
          <span class="post-tag">${event.visibility}</span>
        </div>
        <p class="post-body">${event.notes}</p>
        <div class="post-footer">
          <button class="secondary" data-remove-event="${index}">Remove</button>
        </div>
      `;
      eventList.append(card);
    });
  }
};

if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    const profile = {
      name: String(formData.get("name")).trim(),
      location: String(formData.get("location")).trim(),
      activities: String(formData.get("activities")).trim(),
      availability: String(formData.get("availability")).trim(),
      bio: String(formData.get("bio")).trim(),
    };
    setStored(profileKey, profile);
    renderProfile();
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-event]");
  if (!button) return;
  const index = Number(button.dataset.removeEvent);
  const events = getStored(eventsKey, []);
  events.splice(index, 1);
  setStored(eventsKey, events);
  renderEvents();
});

renderProfile();
renderEvents();
