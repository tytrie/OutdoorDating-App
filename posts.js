const api = window.OutdoorApi;
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
const fallbackTitle = params.get('title') || 'Adventure post';

const titleEl = document.querySelector('[data-post-title]');
const metaEl = document.querySelector('[data-post-meta]');
const summaryEl = document.querySelector('[data-post-summary]');
const spotsEl = document.querySelector('[data-post-spots]');
const activityEl = document.querySelector('[data-post-activity]');
const authorEl = document.querySelector('[data-post-author]');
const timeEl = document.querySelector('[data-post-time]');
const locationEl = document.querySelector('[data-post-location]');
const rsvpEl = document.querySelector('[data-post-rsvps]');
const likesEl = document.querySelector('[data-post-likes]');
const commentForm = document.querySelector('[data-comment-form]');
const commentFeed = document.querySelector('[data-comment-feed]');
const editForm = document.querySelector('[data-edit-form]');

let activePost = null;

const render = () => {
  if (!activePost) return;
  titleEl.textContent = activePost.title;
  metaEl.textContent = activePost.details;
  summaryEl.textContent = activePost.details;
  spotsEl.textContent = `Spots open: ${activePost.spots}`;
  activityEl.textContent = activePost.activity;
  authorEl.textContent = `Host: ${activePost.author}`;
  timeEl.textContent = activePost.when;
  locationEl.textContent = activePost.location;
  rsvpEl.textContent = activePost.rsvps?.length ? `RSVPs: ${activePost.rsvps.join(', ')}` : 'No RSVPs yet.';
  likesEl.textContent = `${activePost.likes || 0} likes`;
  commentFeed.innerHTML = '';
  (activePost.comments || []).forEach((comment) => {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.innerHTML = `<div class="post-header"><div><h4>${comment.author}</h4><p>${new Date(comment.createdAt).toLocaleString()}</p></div><span class="post-tag">Comment</span></div><p class="post-body">${comment.text}</p>`;
    commentFeed.append(card);
  });
  if (editForm) {
    editForm.title.value = activePost.title;
    editForm.activity.value = activePost.activity;
    editForm.when.value = activePost.when;
    editForm.location.value = activePost.location;
    editForm.spots.value = activePost.spots;
    editForm.details.value = activePost.details;
  }
};

const loadPost = async () => {
  const data = await api.listPosts();
  activePost = postId ? data.posts.find((p) => p.id === postId) : data.posts.find((p) => p.title === fallbackTitle);
  if (!activePost) {
    activePost = {
      id: null,
      title: fallbackTitle,
      details: 'Sample post. Create posts from Posts page to fully interact.',
      spots: 0,
      activity: 'Activity',
      author: 'OutdoorDating',
      when: 'TBD',
      location: 'TBD',
      likes: 0,
      rsvps: [],
      comments: []
    };
  }
  render();
};

document.querySelectorAll('[data-post-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!activePost?.id) return alert('Create this post first from the Posts page.');
    try {
      if (button.dataset.postAction === 'like') await api.likePost(activePost.id);
      if (button.dataset.postAction === 'join') await api.rsvpPost(activePost.id);
      if (button.dataset.postAction === 'save') {
        await api.rsvpPost(activePost.id);
        button.textContent = 'Saved';
      }
      await loadPost();
    } catch (error) {
      alert(error.message);
    }
  });
});

commentForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activePost?.id) return alert('Create this post first from the Posts page.');
  try {
    const text = String(new FormData(commentForm).get('comment')).trim();
    await api.commentPost(activePost.id, text);
    commentForm.reset();
    await loadPost();
  } catch (error) {
    alert(error.message);
  }
});

editForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activePost?.id) return alert('Only saved posts can be edited.');
  try {
    const fd = new FormData(editForm);
    await api.updatePost(activePost.id, {
      title: String(fd.get('title')).trim(),
      activity: String(fd.get('activity')).trim(),
      when: String(fd.get('when')).trim(),
      location: String(fd.get('location')).trim(),
      spots: Number(fd.get('spots')),
      details: String(fd.get('details')).trim()
    });
    await loadPost();
  } catch (error) {
    alert(error.message);
  }
});

loadPost();
