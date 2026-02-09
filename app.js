const buttons = document.querySelectorAll("button");
const waitlistForm = document.querySelector(".waitlist-form");
const authStatus = document.querySelector("[data-auth-status]");
const logoutButton = document.querySelector("[data-auth-action=\"logout\"]");
const postForm = document.querySelector("[data-post-form]");
const postFeed = document.querySelector("[data-post-feed]");
const groupForm = document.querySelector("[data-group-form]");
const groupFeed = document.querySelector("[data-group-feed]");
const calendarTabs = document.querySelectorAll("[data-calendar-tab]");

const storageKeys = {
  users: "od_users",
  session: "od_session",
  posts: "od_posts",
  groups: "od_groups",
};

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

const getSession = () => getStored(storageKeys.session, null);
const setSession = (session) => setStored(storageKeys.session, session);

const renderAuthStatus = () => {
  if (!authStatus) return;
  const session = getSession();
  authStatus.textContent = session ? `${session.name} (${session.email})` : "Guest";
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

buttons.forEach((button) => {
  const alertMessage = button.dataset.alert;
  if (alertMessage) {
    button.addEventListener("click", () => {
      window.alert(alertMessage);
    });
  }
});

if (waitlistForm) {
  waitlistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(waitlistForm);
    const email = formData.get("email");
    const city = formData.get("city");
    window.alert(`Thanks ${email}! We'll ping you when ${city} goes live.`);
    waitlistForm.reset();
  });
}

const requireAuth = () => {
  const session = getSession();
  if (!session) {
    window.alert("Please log in or create an account to use this feature.");
    return null;
  }
  return session;
};

document.querySelectorAll("[data-auth]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get("email")).trim().toLowerCase();
    const password = String(formData.get("password")).trim();
    if (form.dataset.auth === "register") {
      const name = String(formData.get("name")).trim();
      const users = getStored(storageKeys.users, []);
      if (users.some((user) => user.email === email)) {
        window.alert("That email already has an account.");
        return;
      }
      users.push({ name, email, password });
      setStored(storageKeys.users, users);
      setSession({ name, email });
      form.reset();
      renderAuthStatus();
      window.alert("Account created! You are now logged in.");
      return;
    }
    const users = getStored(storageKeys.users, []);
    const match = users.find((user) => user.email === email && user.password === password);
    if (!match) {
      window.alert("Login failed. Check your email or password.");
      return;
    }
    setSession({ name: match.name, email: match.email });
    form.reset();
    renderAuthStatus();
    window.alert("Welcome back!");
  });
});

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    setSession(null);
    renderAuthStatus();
    window.alert("You have been logged out.");
  });
}

const renderPosts = () => {
  if (!postFeed) return;
  postFeed.querySelectorAll("[data-user-post]").forEach((node) => node.remove());
  const posts = getStored(storageKeys.posts, []);
  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.dataset.userPost = "true";
    card.innerHTML = `
      <div class="post-header">
        <div>
          <h4>${post.title}</h4>
          <p>${post.when} • ${post.activity}</p>
        </div>
        <span class="post-tag">${post.activity}</span>
      </div>
      <p class="post-body">${post.details}</p>
      <div class="post-footer">
        <div>
          <strong>${post.spots} spots open</strong>
          <span>Posted by ${post.author}</span>
        </div>
        <button class="secondary" data-scroll="#waitlist">Request invite</button>
      </div>
    `;
    postFeed.prepend(card);
  });
};

if (postForm) {
  postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const session = requireAuth();
    if (!session) return;
    const formData = new FormData(postForm);
    const post = {
      title: String(formData.get("title")).trim(),
      activity: String(formData.get("activity")),
      when: String(formData.get("when")).trim(),
      spots: String(formData.get("spots")).trim(),
      details: String(formData.get("details")).trim(),
      author: session.name,
    };
    const posts = getStored(storageKeys.posts, []);
    posts.unshift(post);
    setStored(storageKeys.posts, posts);
    postForm.reset();
    renderPosts();
  });
}

const renderGroups = () => {
  if (!groupFeed) return;
  groupFeed.querySelectorAll("[data-user-group]").forEach((node) => node.remove());
  const groups = getStored(storageKeys.groups, []);
  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "group-card";
    card.dataset.userGroup = "true";
    card.innerHTML = `
      <div class="group-header">
        <div>
          <h4>${group.name}</h4>
          <p>${group.focus}</p>
        </div>
        <span class="group-tag">Custom</span>
      </div>
      <ul class="group-details">
        <li>Next meetup: ${group.event}</li>
        <li>Admins: ${group.admins}</li>
        <li>Private forum: ${group.forum}</li>
        <li>Group calendar: Connected</li>
      </ul>
      <button class="secondary" data-scroll="#waitlist">Join group</button>
    `;
    groupFeed.prepend(card);
  });
};

if (groupForm) {
  groupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const session = requireAuth();
    if (!session) return;
    const formData = new FormData(groupForm);
    const group = {
      name: String(formData.get("name")).trim(),
      focus: String(formData.get("focus")).trim(),
      admins: String(formData.get("admins")).trim(),
      forum: String(formData.get("forum")).trim(),
      event: String(formData.get("event")).trim(),
    };
    const groups = getStored(storageKeys.groups, []);
    groups.unshift(group);
    setStored(storageKeys.groups, groups);
    groupForm.reset();
    renderGroups();
  });
}

calendarTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    calendarTabs.forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");
  });
});

renderAuthStatus();
renderPosts();
renderGroups();
