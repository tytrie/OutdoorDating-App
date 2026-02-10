const api = window.OutdoorApi;

const params = new URLSearchParams(window.location.search);
const groupId = params.get('id');
const groupNameParam = params.get('name');

const titleEl = document.querySelector('[data-group-title]');
const descEl = document.querySelector('[data-group-description]');
const focusEl = document.querySelector('[data-group-focus]');
const membersEl = document.querySelector('[data-group-members]');
const calendarEl = document.querySelector('[data-group-calendar]');
const forumEl = document.querySelector('[data-group-forum]');
const nextEventEl = document.querySelector('[data-group-next-event]');
const adminsEl = document.querySelector('[data-group-admins]');

const adminForm = document.querySelector('[data-admin-form]');
const adminFeed = document.querySelector('[data-admin-feed]');
const eventForm = document.querySelector('[data-event-form]');
const eventFeed = document.querySelector('[data-event-feed]');
const forumForm = document.querySelector('[data-forum-form]');
const forumFeed = document.querySelector('[data-forum-feed]');
const joinButton = document.querySelector('[data-group-join]');
const commentForm = document.querySelector('[data-event-comment-form]');
const commentFeed = document.querySelector('[data-event-comment-feed]');
const adminOnly = document.querySelectorAll('[data-admin-only]');

let group = null;
let user = null;

const render = () => {
  if (!group) return;
  titleEl.textContent = group.name;
  descEl.textContent = group.focus || 'Group details';
  focusEl.textContent = group.focus || 'Weekly meetups';
  membersEl.textContent = `Members: ${group.members?.length || 0}`;
  calendarEl.textContent = 'Calendar: Connected';
  forumEl.textContent = `Forum: ${group.forum || 'General'}`;
  adminsEl.textContent = `Admins: ${(group.admins || []).join(', ')}`;
  nextEventEl.textContent = group.events?.[0]?.time || 'Next: Not scheduled';

  const isOwner = user && group.createdBy === user.id;
  adminOnly.forEach((el) => el.classList.toggle('is-hidden', !isOwner));

  if (adminFeed) {
    adminFeed.innerHTML = '';
    (group.admins || []).forEach((name) => {
      const card = document.createElement('article');
      card.className = 'feature-card';
      card.innerHTML = `<h3>${name}</h3><p>Organizer permissions enabled.</p>`;
      adminFeed.append(card);
    });
  }

  if (eventFeed) {
    eventFeed.innerHTML = '';
    (group.events || []).forEach((event) => {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-header"><div><h4>${event.title}</h4><p>${event.time} • ${event.location || ''}</p></div><span class="post-tag">${event.visibility || 'Group'}</span></div>
        <p class="post-body">${event.notes || ''}</p>
        <div class="post-footer">
          <div><strong>${event.rsvps?.length || 0} RSVPs</strong></div>
          <div class="cta-row">
            <button class="secondary" data-event-rsvp="${event.id}">Join</button>
          </div>
        </div>
      `;
      eventFeed.append(card);
    });
  }

  if (forumFeed) {
    forumFeed.innerHTML = '';
    (group.topics || []).forEach((topic) => {
      const card = document.createElement('article');
      card.className = 'feature-card';
      card.innerHTML = `<h3>${topic.topic}</h3><p>${topic.message}</p><p><strong>Category:</strong> ${topic.category}</p>`;
      forumFeed.append(card);
    });
  }

  if (commentFeed) {
    commentFeed.innerHTML = '';
    (group.events || []).forEach((event) => {
      (event.comments || []).forEach((comment) => {
        const card = document.createElement('article');
        card.className = 'post-card';
        card.innerHTML = `<div class="post-header"><div><h4>${comment.author}</h4><p>${new Date(comment.createdAt).toLocaleString()}</p></div><span class="post-tag">${event.title}</span></div><p class="post-body">${comment.text}</p>`;
        commentFeed.append(card);
      });
    });
  }
};

const load = async () => {
  try {
    if (api.getToken()) {
      const me = await api.me();
      user = me.user;
    }
  } catch {
    user = null;
  }

  const list = await api.listGroups();
  group = groupId ? list.groups.find((g) => g.id === groupId) : list.groups.find((g) => g.name === groupNameParam);
  if (!group) {
    alert('Group not found.');
    return;
  }
  render();
};

joinButton?.addEventListener('click', async () => {
  try {
    await api.joinGroup(group.id);
    await load();
    joinButton.textContent = 'Joined';
  } catch (error) {
    alert(error.message);
  }
});

adminForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Admin roles are managed by group owner settings (API permission ready).');
});

eventForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const fd = new FormData(eventForm);
    await api.createGroupEvent(group.id, {
      title: String(fd.get('title')).trim(),
      time: String(fd.get('time')).trim(),
      location: String(fd.get('location')).trim(),
      visibility: String(fd.get('visibility')).trim(),
      notes: String(fd.get('notes')).trim(),
      addedBy: user?.name || 'Owner'
    });
    eventForm.reset();
    await load();
  } catch (error) {
    alert(error.message);
  }
});

forumForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Forum topic create endpoint can be added next; permissions already handled at group owner level.');
});

eventFeed?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-event-rsvp]');
  if (!button) return;
  try {
    await api.rsvpGroupEvent(group.id, button.dataset.eventRsvp);
    await load();
  } catch (error) {
    alert(error.message);
  }
});

commentForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const firstEvent = group?.events?.[0];
  if (!firstEvent) return alert('Create an event first.');
  try {
    const text = String(new FormData(commentForm).get('comment')).trim();
    await api.commentGroupEvent(group.id, firstEvent.id, text);
    commentForm.reset();
    await load();
  } catch (error) {
    alert(error.message);
  }
});

load();
