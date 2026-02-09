const storageKeys = {
  groups: "od_groups",
  groupExtras: "od_group_extras",
  session: "od_session",
  profileEvents: "od_profile_events",
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
const adminOnlySections = document.querySelectorAll("[data-admin-only]");
const eventCommentForm = document.querySelector("[data-event-comment-form]");
const eventCommentFeed = document.querySelector("[data-event-comment-feed]");

const extras = getStored(storageKeys.groupExtras, {});
const seededGroups = {
  "Front Range Climbers": {
    admins: ["Mei L.", "Gabi R."],
    forum: "Beta exchange",
    calendar: "Shared climbs",
    members: 48,
  },
  "Sunrise Trail Society": {
    admins: ["Jonah P.", "Lila G."],
    forum: "Sunrise routes",
    calendar: "Weekday hikes",
    members: 32,
  },
  "After-Work Paddle Club": {
    admins: ["Rhea K.", "Devon S."],
    forum: "Lake logistics",
    calendar: "Sunset sessions",
    members: 21,
  },
};

const seeded = seededGroups[groupName];
const groupExtra = extras[groupName] || {
  admins: seeded?.admins || ["Group lead"],
  forum: seeded?.forum || "General",
  calendar: seeded?.calendar || "Connected",
  members: seeded?.members || 12,
  events: [],
  eventRsvps: {},
  eventComments: [],
  topics: [],
};

const groups = getStored(storageKeys.groups, []);
const storedGroup = groups.find((group) => group.name === groupName);
const session = getStored(storageKeys.session, null);
const isAdmin = Boolean(session && storedGroup?.createdBy === session.email);

if (storedGroup?.admins) {
  groupExtra.admins = storedGroup.admins.split(",").map((name) => name.trim());
}

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

adminOnlySections.forEach((section) => {
  section.classList.toggle("is-hidden", !isAdmin);
});

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
    const rsvps = groupExtra.eventRsvps[event.title] || [];
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
          <strong>${rsvps.length} RSVPs</strong>
          <span>Added by ${event.addedBy}</span>
        </div>
        <div class="cta-row">
          <button class="secondary" data-event-action="rsvp" data-event-title="${event.title}">Join</button>
          <button class="ghost" data-event-action="save" data-event-title="${event.title}">Add to my calendar</button>
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

const renderEventComments = () => {
  if (!eventCommentFeed) return;
  eventCommentFeed.innerHTML = "";
  groupExtra.eventComments.forEach((comment) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-header">
        <div>
          <h4>${comment.author}</h4>
          <p>${comment.time}</p>
        </div>
        <span class="post-tag">Event comment</span>
      </div>
      <p class="post-body">${comment.text}</p>
    `;
    eventCommentFeed.append(card);
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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

if (eventCommentForm) {
  eventCommentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(eventCommentForm);
    const text = String(formData.get("comment")).trim();
    if (!text) return;
    groupExtra.eventComments.unshift({ author: session?.name || "Guest", time: "Just now", text });
    persistExtras();
    eventCommentForm.reset();
    renderEventComments();
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-action]");
  if (!button) return;
  const titleValue = button.dataset.eventTitle;
  if (!titleValue) return;
  if (button.dataset.eventAction === "rsvp") {
    const list = groupExtra.eventRsvps[titleValue] || [];
    if (!list.includes(session?.name || "You")) {
      list.unshift(session?.name || "You");
      groupExtra.eventRsvps[titleValue] = list;
      persistExtras();
      renderEvents();
    }
  }
  if (button.dataset.eventAction === "save") {
    const events = getStored(storageKeys.profileEvents, []);
    const match = groupExtra.events.find((eventItem) => eventItem.title === titleValue);
    if (match) {
      events.unshift(match);
      setStored(storageKeys.profileEvents, events);
      button.textContent = "Added";
      button.disabled = true;
    }
  }
});

renderAdmins();
renderEvents();
renderTopics();
renderEventComments();
