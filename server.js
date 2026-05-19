require("dotenv").config();

const crypto   = require("crypto");
const fs       = require("fs/promises");
const path     = require("path");

const express  = require("express");
const session  = require("express-session");
const bcrypt   = require("bcrypt");
const mongoose = require("mongoose");

const User = require("./models/User");
const Task = require("./models/Task");

const PORT = process.env.PORT || 3000;

// ─── MongoDB ─────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not set. Add it to your .env file.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || "nebula-dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(__dirname, { index: false }));

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.path.startsWith("/api/")) return res.status(401).json({ error: "Not authenticated" });
  return res.redirect("/login");
}

// ─── Page routes ─────────────────────────────────────────────────────────────

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/dashboard", requireAuth, (req, res) => res.sendFile(path.join(__dirname, "dashboard.html")));

app.get("/logout-page",(req,res)=>{
res.sendFile(__dirname+"/logout.html");
});
// ─── Auth API ─────────────────────────────────────────────────────────────────

app.get("/api/me", (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true, userId: req.session.userId, name: req.session.userName });
  }
  res.json({ loggedIn: false });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: "An account with that email already exists." });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed });

    req.session.userId   = user._id.toString();
    req.session.userName = user.name;
    return res.status(201).json({ success: true, name: user.name });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password." });

    req.session.userId   = user._id.toString();
    req.session.userName = user.name;
    return res.json({ success: true, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ─── Task API (MongoDB, per-user) ─────────────────────────────────────────────

app.get("/api/tasks", requireAuth, asyncRoute(async (req) => {
  const tasks = await Task.find({ userId: req.session.userId }).sort({ createdAt: -1 }).lean();
  const store = await readStore(req.session.userId);
  return { tasks: tasks.map(mongoTaskToClient), history: store.history, habits: store.habits, focusSessions: store.focusSessions };
}));

app.post("/api/tasks", requireAuth, asyncRoute(async (req) => {
  const body = req.body;
  const task = await Task.create({
    userId:   req.session.userId,
    title:    cleanText(body.title, "Untitled task", 100),
    notes:    cleanText(body.notes, "", 420),
    priority: cleanPriority(body.priority),
    status:   cleanStatus(body.status),
    done:     cleanStatus(body.status) === "done",
    tags:     cleanTags(body.tags),
    project:  cleanText(body.project || body.list, "Personal", 32),
    due:      /^\d{4}-\d{2}-\d{2}$/.test(body.due || "") ? body.due : ""
  });
  const store = await readStore(req.session.userId);
  addHistory(store, "created", { id: task._id.toString(), title: task.title });
  await writeStore(req.session.userId, store);
  return mongoTaskToClient(task.toObject());
}, 201));

app.put("/api/tasks/:id", requireAuth, asyncRoute(async (req) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
  if (!task) throw httpError(404, "Task not found");
  const body    = req.body;
  task.title    = cleanText(body.title, task.title, 100);
  task.notes    = cleanText(body.notes, task.notes, 420);
  task.priority = cleanPriority(body.priority);
  task.project  = cleanText(body.project || body.list, task.project, 32);
  task.tags     = cleanTags(body.tags);
  if (/^\d{4}-\d{2}-\d{2}$/.test(body.due || "")) task.due = body.due;
  await task.save();
  const store = await readStore(req.session.userId);
  addHistory(store, "updated", { id: task._id.toString(), title: task.title });
  await writeStore(req.session.userId, store);
  return mongoTaskToClient(task.toObject());
}));

app.patch("/api/tasks/:id/status", requireAuth, asyncRoute(async (req) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
  if (!task) throw httpError(404, "Task not found");
  const status = cleanStatus(req.body.status);
  task.status  = status;
  task.done    = status === "done";
  await task.save();
  const store = await readStore(req.session.userId);
  addHistory(store, status === "done" ? "completed" : "moved", { id: task._id.toString(), title: task.title });
  await writeStore(req.session.userId, store);
  return mongoTaskToClient(task.toObject());
}));

app.delete("/api/tasks/completed", requireAuth, asyncRoute(async (req) => {
  const removed = await Task.find({ userId: req.session.userId, done: true }).lean();
  await Task.deleteMany({ userId: req.session.userId, done: true });
  const store = await readStore(req.session.userId);
  removed.forEach(t => addHistory(store, "cleared", { id: t._id.toString(), title: t.title }));
  await writeStore(req.session.userId, store);
}, 204));

app.delete("/api/tasks/:id", requireAuth, asyncRoute(async (req) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
  if (!task) throw httpError(404, "Task not found");
  await task.deleteOne();
  const store = await readStore(req.session.userId);
  addHistory(store, "deleted", { id: task._id.toString(), title: task.title });
  await writeStore(req.session.userId, store);
}, 204));

// ─── Habits, Focus, Import, Seed ─────────────────────────────────────────────

app.post("/api/habits", requireAuth, asyncRoute(async (req) => createHabit(req.session.userId, req.body), 201));
app.patch("/api/habits/:id/today", requireAuth, asyncRoute(async (req) => toggleHabitToday(req.session.userId, req.params.id)));
app.delete("/api/habits/:id", requireAuth, asyncRoute(async (req) => { await deleteHabit(req.session.userId, req.params.id); }, 204));
app.post("/api/focus-sessions", requireAuth, asyncRoute(async (req) => createFocusSession(req.session.userId, req.body), 201));
app.post("/api/import", requireAuth, asyncRoute(async (req) => importTasks(req.session.userId, req.body.tasks)));
app.post("/api/seed", requireAuth, asyncRoute(async (req) => seedTasks(req.session.userId)));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "nebula-tasks" }));

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ error: error.message || "Something went wrong" });
});

app.listen(PORT, () => console.log(`Nebula Tasks running on http://localhost:${PORT}`));

// ─── Helper: asyncRoute ───────────────────────────────────────────────────────

function asyncRoute(handler, status = 200) {
  return async (req, res, next) => {
    try {
      const data = await handler(req);
      if (status === 204) return res.status(204).send();
      res.status(status).json(data);
    } catch (err) { next(err); }
  };
}

function mongoTaskToClient(t) {
  return {
    id:        t._id.toString(),
    title:     t.title,
    notes:     t.notes || "",
    priority:  t.priority,
    status:    t.status,
    done:      t.done,
    tags:      t.tags || [],
    project:   t.project || "Personal",
    due:       t.due || "",
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString()
  };
}

// ─── Per-user JSON store (habits, focus sessions, history) ────────────────────

const DATA_DIR = path.join(__dirname, "data");
const userFile = id => path.join(DATA_DIR, `user_${id}.json`);

async function readStore(userId) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw   = await fs.readFile(userFile(userId), "utf8");
    const store = JSON.parse(raw);
    return {
      history:       Array.isArray(store.history)       ? store.history.slice(0, 80)                      : [],
      habits:        Array.isArray(store.habits)        ? store.habits.map(normalizeHabit)               : [],
      focusSessions: Array.isArray(store.focusSessions) ? store.focusSessions.map(normalizeFocusSession) : []
    };
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const empty = { history: [], habits: [], focusSessions: [] };
    await writeStore(userId, empty);
    return empty;
  }
}

async function writeStore(userId, store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(userFile(userId), JSON.stringify({
    history:       (store.history       || []).slice(0, 80),
    habits:        (store.habits        || []).map(normalizeHabit),
    focusSessions: (store.focusSessions || []).map(normalizeFocusSession).slice(0, 160)
  }, null, 2) + "\n");
}

// ─── Habit helpers ────────────────────────────────────────────────────────────

async function createHabit(userId, body) {
  const store = await readStore(userId);
  const now   = new Date().toISOString();
  const habit = normalizeHabit({ ...body, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
  store.habits.unshift(habit);
  addHistory(store, "habit added", { id: habit.id, title: habit.title });
  await writeStore(userId, store);
  return habit;
}

async function toggleHabitToday(userId, id) {
  const store    = await readStore(userId);
  const habit    = store.habits.find(h => h.id === id);
  if (!habit) throw httpError(404, "Habit not found");
  const today    = dateKey(new Date());
  const hasToday = habit.completions.includes(today);
  habit.completions   = hasToday ? habit.completions.filter(d => d !== today) : [...habit.completions, today].sort();
  habit.updatedAt     = new Date().toISOString();
  habit.streak        = calculateStreak(habit.completions);
  habit.lastCompleted = habit.completions[habit.completions.length - 1] || "";
  addHistory(store, hasToday ? "habit unchecked" : "habit checked", { id: habit.id, title: habit.title });
  await writeStore(userId, store);
  return habit;
}

async function deleteHabit(userId, id) {
  const store = await readStore(userId);
  const habit = store.habits.find(h => h.id === id);
  if (!habit) throw httpError(404, "Habit not found");
  store.habits = store.habits.filter(h => h.id !== id);
  addHistory(store, "habit deleted", { id: habit.id, title: habit.title });
  await writeStore(userId, store);
}

async function createFocusSession(userId, body) {
  const store = await readStore(userId);
  const sess  = normalizeFocusSession({ ...body, id: crypto.randomUUID(), completedAt: new Date().toISOString() });
  store.focusSessions.unshift(sess);
  store.focusSessions = store.focusSessions.slice(0, 160);
  addHistory(store, "focus logged", { id: sess.id, title: `${sess.minutes} min focus` });
  await writeStore(userId, store);
  return sess;
}

async function importTasks(userId, tasks) {
  const incoming = Array.isArray(tasks) ? tasks : [];
  const created  = [];
  for (const raw of incoming) {
    const task = await Task.create({
      userId,
      title:    cleanText(raw.title, "Untitled task", 100),
      notes:    cleanText(raw.notes, "", 420),
      priority: cleanPriority(raw.priority),
      status:   cleanStatus(raw.status),
      done:     cleanStatus(raw.status) === "done",
      tags:     cleanTags(raw.tags),
      project:  cleanText(raw.project || raw.list, "Personal", 32),
      due:      /^\d{4}-\d{2}-\d{2}$/.test(raw.due || "") ? raw.due : ""
    });
    created.push(mongoTaskToClient(task.toObject()));
  }
  return created;
}

async function seedTasks(userId) {
  const created = [];
  for (const raw of demoTasks()) {
    const task = await Task.create({ userId, ...raw });
    created.push(mongoTaskToClient(task.toObject()));
  }
  const store = await readStore(userId);
  created.forEach(t => addHistory(store, "created", { id: t.id, title: t.title }));
  await writeStore(userId, store);
  const allTasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
  return { tasks: allTasks.map(mongoTaskToClient), history: store.history, habits: store.habits, focusSessions: store.focusSessions };
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeHabit(h) {
  const completions = Array.isArray(h.completions)
    ? [...new Set(h.completions.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort() : [];
  const now = new Date().toISOString();
  return {
    id: String(h.id || crypto.randomUUID()), title: cleanText(h.title, "Daily habit", 64),
    cadence: "daily", completions, streak: calculateStreak(completions),
    lastCompleted: completions[completions.length - 1] || "",
    createdAt: h.createdAt || now, updatedAt: h.updatedAt || now
  };
}

function normalizeFocusSession(s) {
  return {
    id: String(s.id || crypto.randomUUID()),
    minutes: Math.max(1, Math.min(240, Number(s.minutes) || 25)),
    taskId: String(s.taskId || ""),
    taskTitle: cleanText(s.taskTitle, "Focus session", 100),
    completedAt: s.completedAt || new Date().toISOString()
  };
}

// ─── Sanitizers ───────────────────────────────────────────────────────────────

function cleanText(v, fallback, max) { return (String(v || "").trim() || fallback).slice(0, max); }
function cleanTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
  return [...new Set(list.map(t => String(t).trim().replace(/^#/, "").slice(0, 24)).filter(Boolean))].slice(0, 8);
}
function cleanPriority(p) { return ["low","medium","high","urgent"].includes(p) ? p : "medium"; }
function cleanStatus(s)   { return ["backlog","active","blocked","done"].includes(s) ? s : "active"; }

// ─── Utilities ────────────────────────────────────────────────────────────────

function addHistory(store, action, task) {
  store.history.unshift({ id: crypto.randomUUID(), action, taskId: task.id, title: task.title, at: new Date().toISOString() });
  store.history = store.history.slice(0, 80);
}

function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function calculateStreak(completions) {
  const days = new Set(completions), cursor = new Date(); let streak = 0;
  while (days.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate()-1); }
  return streak;
}

function demoTasks() {
  const now = new Date(), plus = n => { const d = new Date(now); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
  return [
    { title: "Draft launch checklist", project: "Launch",  due: plus(1), priority: "urgent", status: "active",  notes: "Confirm deploy steps, rollback plan, and owner for launch day.", tags: ["release","ops"] },
    { title: "Design project cards",   project: "Product", due: plus(3), priority: "high",   status: "backlog", notes: "Make cards scannable on desktop and mobile.", tags: ["design"] },
    { title: "Review API validation",  project: "Backend", due: plus(0), priority: "medium", status: "blocked", notes: "Check edge cases before public deployment.", tags: ["api","quality"] }
  ];
}

function httpError(status, msg) { const e = new Error(msg); e.status = status; return e; }
