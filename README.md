# OutdoorDating App

A full-stack local app prototype for an outdoor-focused dating and friend-making platform.

## Run Locally (Option A: Node + Express)

1. Install dependencies:

```bash
npm install
```

2. Start the app server:

```bash
npm start
```

3. Open:

- `http://localhost:8000/index.html`

## Demo Pages

- Landing: `http://localhost:8000/index.html`
- Communities: `http://localhost:8000/communities.html`
- Posts feed: `http://localhost:8000/posts.html`
- Post detail: `http://localhost:8000/post.html`
- Group dashboard: `http://localhost:8000/groups.html`
- Profiles: `http://localhost:8000/profiles.html`
- Profile editor: `http://localhost:8000/profile.html`
- Integrations (WIP): `http://localhost:8000/integrations.html`

## API

The app now exposes real local API endpoints under `/api/*` and uses a persisted JSON datastore in:

- `data/db.json`
