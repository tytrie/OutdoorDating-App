const api = window.OutdoorApi;
const form = document.querySelector('[data-integration-form]');
const feed = document.querySelector('[data-integration-feed]');

const render = (requests) => {
  if (!feed) return;
  feed.innerHTML = '';
  requests.forEach((request) => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    card.innerHTML = `<h3>${request.app}</h3><p>${request.reason}</p><p>By ${request.by || 'community'}</p>`;
    feed.append(card);
  });
};

const load = async () => {
  const data = await api.integrationRequests();
  render(data.requests);
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const fd = new FormData(form);
    await api.createIntegrationRequest({ app: String(fd.get('app')).trim(), reason: String(fd.get('reason')).trim() });
    form.reset();
    await load();
  } catch (error) {
    alert(error.message);
  }
});

load().catch(() => {});
