const storageKeys = {
  groups: "od_groups",
  groupExtras: "od_group_extras",
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
const groupName = params.get("name") || "Group";

const title = document.querySelector("[data-group-title]");
const description = document.querySelector("[data-group-description]");
const focus = document.querySelector("[data-group-focus]");
const members = document.querySelector("[data-group-members]");
const calendar = document.querySelector("[data-group-calendar]");
const forum = document.querySelector("[data-group-forum]");
const nextEvent = document.querySelector("[data-group-next-event]");
const admins = document.querySelector("[data-group-admins]");

const adminForm = document.querySelector("[data-admin-form]");
const adminFeed = document.querySelector("[data-admin-feed]");
const eventForm = document.querySelector("[data-event-form]");
const eventFeed = document.querySelector("[data-event-feed]");
const forumForm = document.querySelector("[data-forum-form]");
const forumFeed = document.querySelector("[data-forum-feed]");

const extras = getStored(storageKeys.groupExtras, {});
const groupExtra = extras[groupName] || {
  admins: ["You"],
  forum: "General",
  calendar: "Connected",
  members: 12,
  events: [],
  topics: [],
};

const groups = getStored(storageKeys.groups, []);
const storedGroup = groups.find((group) => group.name === groupName);

if (title) title.textContent = groupName;
if (description) {
  description.textContent =
    storedGroup?.focus || "Manage admins, private forums, and shared calendars with your crew.";
}
if (focus) focus.textContent = storedGroup?.focus || "Weekly meetups and special trips.";
if (members) members.textContent = `Members: ${groupExtra.members}`;
if (calendar) calendar.textContent = `Calendar: ${groupExtra.calendar}`;
if (forum) forum.textContent = `Forum: ${groupExtra.forum}`;
if (nextEvent) {
  nextEvent.textContent =
    groupExtra.events[0]?.time || storedGroup?.event || "Next: Not scheduled";
}
if (admins) admins.textContent = `Admins: ${groupExtra.admins.join(", ")}`;

const persistExtras = () => {
  extras[groupName] = groupExtra;
  setStored(storageKeys.groupExtras, extras);
};

const renderAdmins = () => {
  if (!adminFeed) return;
  adminFeed.innerHTML = "";
  groupExtra.admins.forEach((admin) => {
    const card = document.createElement("article");
    card.className = "feature-card";
    card.innerHTML = `<h3>${admin}</h3><p>Organizer permissions enabled.</p>`;
    adminFeed.append(card);
  });
};

const renderEvents = () => {
  if (!eventFeed) return;
  eventFeed.innerHTML = "";
  groupExtra.events.forEach((event) => {
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
        <div>
          <strong>Visibility: ${event.visibility}</strong>
          <span>Added by ${event.addedBy}</span>
        </div>
      </div>
    `;
    eventFeed.append(card);
  });
};

const renderTopics = () => {
  if (!forumFeed) return;
  forumFeed.innerHTML = "";
  groupExtra.topics.forEach((topic) => {
    const card = document.createElement("article");
    card.className = "feature-card";
    card.innerHTML = `
      <h3>${topic.topic}</h3>
      <p>${topic.message}</p>
      <p><strong>Category:</strong> ${topic.category}</p>
    `;
    forumFeed.append(card);
  });
};

if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(adminForm);
    const admin = String(formData.get("admin")).trim();
    const role = String(formData.get("role")).trim();
    if (!admin) return;
    groupExtra.admins.unshift(`${admin} (${role})`);
    persistExtras();
    adminForm.reset();
    renderAdmins();
  });
}

if (eventForm) {
  eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(eventForm);
    const newEvent = {
      title: String(formData.get("title")).trim(),
      time: String(formData.get("time")).trim(),
      location: String(formData.get("location")).trim(),
      visibility: String(formData.get("visibility")).trim(),
      notes: String(formData.get("notes")).trim(),
      addedBy: "You",
    };
    groupExtra.events.unshift(newEvent);
    persistExtras();
    eventForm.reset();
    renderEvents();
    if (nextEvent) {
      nextEvent.textContent = newEvent.time;
    }
  });
}

if (forumForm) {
  forumForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(forumForm);
    const topic = {
      topic: String(formData.get("topic")).trim(),
      category: String(formData.get("category")).trim(),
      message: String(formData.get("message")).trim(),
    };
    groupExtra.topics.unshift(topic);
    persistExtras();
    forumForm.reset();
    renderTopics();
  });
}

renderAdmins();
renderEvents();
renderTopics();
