window.OutdoorApi = (() => {
  const tokenKey = "od_token";
  const sessionKey = "od_session";

  const getToken = () => localStorage.getItem(tokenKey);
  const setAuth = (token, user) => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(sessionKey, JSON.stringify(user));
  };
  const clearAuth = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(sessionKey);
  };

  const request = async (path, options = {}) => {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  return {
    getToken,
    setAuth,
    clearAuth,
    getSession: () => JSON.parse(localStorage.getItem(sessionKey) || "null"),
    register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
    login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
    me: () => request("/api/auth/me"),
    listCommunities: () => request("/api/communities"),
    listPosts: () => request("/api/posts"),
    createPost: (payload) => request("/api/posts", { method: "POST", body: JSON.stringify(payload) }),
    updatePost: (id, payload) => request(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    likePost: (id) => request(`/api/posts/${id}/like`, { method: "POST" }),
    rsvpPost: (id) => request(`/api/posts/${id}/rsvp`, { method: "POST" }),
    commentPost: (id, text) => request(`/api/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
    listGroups: () => request("/api/groups"),
    createGroup: (payload) => request("/api/groups", { method: "POST", body: JSON.stringify(payload) }),
    getGroup: (id) => request(`/api/groups/${id}`),
    joinGroup: (id) => request(`/api/groups/${id}/join`, { method: "POST" }),
    createGroupEvent: (id, payload) => request(`/api/groups/${id}/events`, { method: "POST", body: JSON.stringify(payload) }),
    rsvpGroupEvent: (groupId, eventId) => request(`/api/groups/${groupId}/events/${eventId}/rsvp`, { method: "POST" }),
    commentGroupEvent: (groupId, eventId, text) =>
      request(`/api/groups/${groupId}/events/${eventId}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
    getProfile: () => request("/api/profile"),
    updateProfile: (payload) => request("/api/profile", { method: "PATCH", body: JSON.stringify(payload) }),
    profileEvents: () => request("/api/profile/events"),
    integrationRequests: () => request("/api/integrations/requests"),
    createIntegrationRequest: (payload) =>
      request("/api/integrations/requests", { method: "POST", body: JSON.stringify(payload) })
  };
})();
