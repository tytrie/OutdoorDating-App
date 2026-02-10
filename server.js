const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(
      {
        users: [],
        profiles: {},
        posts: [],
        groups: [],
        communities: [
          { id: "denver", name: "Denver, CO", activity: "Trail running + climbing", members: 420 },
          { id: "portland", name: "Portland, OR", activity: "Hikes + paddling", members: 310 },
          { id: "austin", name: "Austin, TX", activity: "Cycling + swimming", members: 275 }
        ],
        integrationRequests: []
      },
      null,
      2
    )
  );
}

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const writeDb = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

app.use(express.json());
app.use(express.static(__dirname));

const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const sanitizeUser = (user) => ({ id: user.id, name: user.name, email: user.email });

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuid(), name, email: String(email).toLowerCase(), passwordHash };
  db.users.push(user);
  db.profiles[user.id] = {
    name,
    location: "",
    activities: "",
    availability: "",
    bio: ""
  };
  writeDb(db);
  const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email === String(email).toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: sanitizeUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitizeUser(user) });
});

app.get("/api/communities", (req, res) => {
  const db = readDb();
  res.json({ communities: db.communities });
});

app.get("/api/posts", (req, res) => {
  const db = readDb();
  res.json({ posts: db.posts });
});

app.post("/api/posts", auth, (req, res) => {
  const { title, activity, when, location, spots, details } = req.body;
  const db = readDb();
  const post = {
    id: uuid(),
    title,
    activity,
    when,
    location,
    spots,
    details,
    authorId: req.user.userId,
    author: req.user.name,
    likes: 0,
    rsvps: [],
    comments: []
  };
  db.posts.unshift(post);
  writeDb(db);
  res.status(201).json({ post });
});

app.patch("/api/posts/:id", auth, (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.authorId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });
  Object.assign(post, req.body);
  writeDb(db);
  res.json({ post });
});

app.post("/api/posts/:id/like", auth, (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.likes += 1;
  writeDb(db);
  res.json({ likes: post.likes });
});

app.post("/api/posts/:id/rsvp", auth, (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!post.rsvps.includes(req.user.name)) post.rsvps.push(req.user.name);
  writeDb(db);
  res.json({ rsvps: post.rsvps });
});

app.post("/api/posts/:id/comments", auth, (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  const comment = { id: uuid(), author: req.user.name, text: req.body.text, createdAt: new Date().toISOString() };
  post.comments.unshift(comment);
  writeDb(db);
  res.status(201).json({ comment, comments: post.comments });
});

app.get("/api/groups", (req, res) => {
  const db = readDb();
  res.json({ groups: db.groups });
});

app.post("/api/groups", auth, (req, res) => {
  const db = readDb();
  const { name, focus, admins, forum, event } = req.body;
  const group = {
    id: uuid(),
    name,
    focus,
    admins: admins ? admins.split(",").map((x) => x.trim()) : [req.user.name],
    forum,
    createdBy: req.user.userId,
    members: [req.user.userId],
    events: event
      ? [
          {
            id: uuid(),
            title: event,
            time: event,
            location: "",
            visibility: "Group",
            notes: "",
            rsvps: [],
            comments: []
          }
        ]
      : [],
    topics: []
  };
  db.groups.unshift(group);
  writeDb(db);
  res.status(201).json({ group });
});

app.get("/api/groups/:id", (req, res) => {
  const db = readDb();
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  res.json({ group });
});

app.post("/api/groups/:id/join", auth, (req, res) => {
  const db = readDb();
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (!group.members.includes(req.user.userId)) group.members.push(req.user.userId);
  writeDb(db);
  res.json({ memberCount: group.members.length });
});

app.post("/api/groups/:id/events", auth, (req, res) => {
  const db = readDb();
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (group.createdBy !== req.user.userId) return res.status(403).json({ error: "Only owner can add events" });
  const event = { id: uuid(), ...req.body, rsvps: [], comments: [] };
  group.events.unshift(event);
  writeDb(db);
  res.status(201).json({ event, events: group.events });
});

app.post("/api/groups/:id/events/:eventId/rsvp", auth, (req, res) => {
  const db = readDb();
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  const event = group.events.find((e) => e.id === req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (!event.rsvps.includes(req.user.name)) event.rsvps.push(req.user.name);
  writeDb(db);
  res.json({ rsvps: event.rsvps });
});

app.post("/api/groups/:id/events/:eventId/comments", auth, (req, res) => {
  const db = readDb();
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  const event = group.events.find((e) => e.id === req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  const comment = { id: uuid(), author: req.user.name, text: req.body.text, createdAt: new Date().toISOString() };
  event.comments.unshift(comment);
  writeDb(db);
  res.status(201).json({ comments: event.comments });
});

app.get("/api/profile", auth, (req, res) => {
  const db = readDb();
  res.json({ profile: db.profiles[req.user.userId] || null });
});

app.patch("/api/profile", auth, (req, res) => {
  const db = readDb();
  db.profiles[req.user.userId] = { ...(db.profiles[req.user.userId] || {}), ...req.body };
  writeDb(db);
  res.json({ profile: db.profiles[req.user.userId] });
});

app.get("/api/profile/events", auth, (req, res) => {
  const db = readDb();
  const events = [];
  db.groups.forEach((group) => {
    group.events.forEach((event) => {
      if (event.rsvps.includes(req.user.name)) {
        events.push({ ...event, groupName: group.name });
      }
    });
  });
  res.json({ events });
});

app.get("/api/integrations/requests", (req, res) => {
  const db = readDb();
  res.json({ requests: db.integrationRequests });
});

app.post("/api/integrations/requests", auth, (req, res) => {
  const db = readDb();
  const request = { id: uuid(), app: req.body.app, reason: req.body.reason, by: req.user.name };
  db.integrationRequests.unshift(request);
  writeDb(db);
  res.status(201).json({ request });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
