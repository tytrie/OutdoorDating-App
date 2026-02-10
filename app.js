const api = window.OutdoorApi;

const waitlistForm = document.querySelector('.waitlist-form');
const authStatus = document.querySelector('[data-auth-status]');
const logoutButtons = document.querySelectorAll('[data-auth-action="logout"]');
const profileMenu = document.querySelector('[data-profile-menu]');
const profileToggle = document.querySelector('[data-profile-toggle]');
const profileDropdown = document.querySelector('[data-profile-dropdown]');
const postForm = document.querySelector('[data-post-form]');
const postFeed = document.querySelector('[data-post-feed]');
const groupForm = document.querySelector('[data-group-form]');
const groupFeed = document.querySelector('[data-group-feed]');

const scrollHandler = (event) => {
  const btn = event.target.closest('button[data-scroll]');
  if (!btn) return;
  const target = document.querySelector(btn.dataset.scroll);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
document.addEventListener('click', scrollHandler);

const session = () => api.getSession();

const renderAuth = () => {
  const user = session();
  if (authStatus) authStatus.textContent = user ? `${user.name} (${user.email})` : 'Guest';
  if (profileToggle && profileMenu) {
    profileToggle.textContent = user ? 'Profile' : 'Log in';
    profileMenu.classList.toggle('is-logged-out', !user);
    if (!user) profileMenu.classList.remove('open');
  }
};

if (profileToggle && profileMenu) {
  profileToggle.addEventListener('click', (event) => {
    const user = session();
    if (!user) {
      const login = document.querySelector('#login');
      if (login) login.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.location.href = 'index.html#login';
      return;
    }
    event.stopPropagation();
    profileMenu.classList.toggle('open');
  });
  document.addEventListener('click', (event) => {
    if (!profileMenu || !profileDropdown) return;
    if (!profileMenu.contains(event.target)) profileMenu.classList.remove('open');
  });
}

document.querySelectorAll('[data-auth]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const fd = new FormData(form);
      if (form.dataset.auth === 'register') {
        const data = await api.register({
          name: String(fd.get('name')).trim(),
          email: String(fd.get('email')).trim().toLowerCase(),
          password: String(fd.get('password')).trim()
        });
        api.setAuth(data.token, data.user);
        alert('Account created.');
      } else {
        const data = await api.login({
          email: String(fd.get('email')).trim().toLowerCase(),
          password: String(fd.get('password')).trim()
        });
        api.setAuth(data.token, data.user);
        alert('Welcome back.');
      }
      form.reset();
      renderAuth();
      renderPosts();
      renderGroups();
    } catch (error) {
      alert(error.message);
    }
  });
});

logoutButtons.forEach((button) => {
  button.addEventListener('click', () => {
    api.clearAuth();
    renderAuth();
    alert('Logged out.');
  });
});

if (waitlistForm) {
  waitlistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(waitlistForm);
    alert(`Thanks ${fd.get('email')}! We'll ping you when ${fd.get('city')} goes live.`);
    waitlistForm.reset();
  });
}

const requireAuth = () => {
  if (!session()) {
    alert('Please log in first.');
    return false;
  }
  return true;
};

async function renderPosts() {
  if (!postFeed) return;
  postFeed.querySelectorAll('[data-user-post]').forEach((n) => n.remove());
  try {
    const data = await api.listPosts();
    data.posts.forEach((post) => {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.dataset.userPost = 'true';
      card.innerHTML = `
        <div class="post-header">
          <div>
            <h4>${post.title}</h4>
            <p>${post.when} • ${post.location}</p>
          </div>
          <span class="post-tag">${post.activity}</span>
        </div>
        <p class="post-body">${post.details}</p>
        <div class="post-footer">
          <div>
            <strong>${post.spots} spots open</strong>
            <span>Posted by ${post.author}</span>
          </div>
          <a class="secondary button-link" href="post.html?id=${post.id}">Open post</a>
        </div>
      `;
      postFeed.prepend(card);
    });
  } catch {
    // no-op
  }
}

if (postForm) {
  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!requireAuth()) return;
    try {
      const fd = new FormData(postForm);
      await api.createPost({
        title: String(fd.get('title')).trim(),
        activity: String(fd.get('activity')).trim(),
        when: String(fd.get('when')).trim(),
        location: String(fd.get('location')).trim(),
        spots: Number(fd.get('spots')),
        details: String(fd.get('details')).trim()
      });
      postForm.reset();
      renderPosts();
    } catch (error) {
      alert(error.message);
    }
  });
}

async function renderGroups() {
  if (!groupFeed) return;
  groupFeed.querySelectorAll('[data-user-group]').forEach((n) => n.remove());
  try {
    const data = await api.listGroups();
    data.groups.forEach((group) => {
      const card = document.createElement('article');
      card.className = 'group-card';
      card.dataset.userGroup = 'true';
      card.innerHTML = `
        <div class="group-header">
          <div>
            <h4>${group.name}</h4>
            <p>${group.focus}</p>
          </div>
          <span class="group-tag">Custom</span>
        </div>
        <ul class="group-details">
          <li>Members: ${group.members.length}</li>
          <li>Admins: ${group.admins.join(', ')}</li>
          <li>Private forum: ${group.forum || 'General'}</li>
        </ul>
        <a class="secondary button-link" href="groups.html?id=${group.id}">View group</a>
      `;
      groupFeed.prepend(card);
    });
  } catch {
    // no-op
  }
}

if (groupForm) {
  groupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!requireAuth()) return;
    try {
      const fd = new FormData(groupForm);
      await api.createGroup({
        name: String(fd.get('name')).trim(),
        focus: String(fd.get('focus')).trim(),
        admins: String(fd.get('admins')).trim(),
        forum: String(fd.get('forum')).trim(),
        event: String(fd.get('event')).trim()
      });
      groupForm.reset();
      renderGroups();
    } catch (error) {
      alert(error.message);
    }
  });
}

renderAuth();
renderPosts();
renderGroups();
