const form = document.querySelector("[data-integration-form]");
const feed = document.querySelector("[data-integration-feed]");

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

const key = "od_integration_requests";

const renderRequests = () => {
  if (!feed) return;
  feed.innerHTML = "";
  const requests = getStored(key, []);
  requests.forEach((request) => {
    const card = document.createElement("article");
    card.className = "feature-card";
    card.innerHTML = `
      <h3>${request.app}</h3>
      <p>${request.reason}</p>
    `;
    feed.append(card);
  });
};

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const request = {
      app: String(formData.get("app")).trim(),
      reason: String(formData.get("reason")).trim(),
    };
    const requests = getStored(key, []);
    requests.unshift(request);
    setStored(key, requests);
    form.reset();
    renderRequests();
  });
}

renderRequests();
