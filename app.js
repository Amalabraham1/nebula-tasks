const API_BASE = "/api";
const LEGACY_KEY = "todo-desk.tasks.v1";

const state = {
  tasks: [],
  history: [],
  habits: [],
  focusSessions: [],
  filter: "all",
  view: "dashboard",
  search: "",
  sort: "date",
  selectedProject: "all",
  calendarDate: new Date(),
  factIndex: 0,
  focus: {
    secondsLeft: 25 * 60,
    totalSeconds: 25 * 60,
    running: false,
    timerId: null
  },
  breakdownSuggestions: [],
  loading: true
};

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  syncCard: document.querySelector("#syncCard"),
  syncDot: document.querySelector("#syncDot"),
  syncTitle: document.querySelector("#syncTitle"),
  syncText: document.querySelector("#syncText"),
  viewTabs: document.querySelectorAll(".tab-button"),
  panels: document.querySelectorAll("[data-view-panel]"),
  projectCount: document.querySelector("#projectCount"),
  projectList: document.querySelector("#projectList"),
  openCount: document.querySelector("#openCount"),
  openCaption: document.querySelector("#openCaption"),
  todayCount: document.querySelector("#todayCount"),
  overdueCount: document.querySelector("#overdueCount"),
  focusScore: document.querySelector("#focusScore"),
  spaceFactText: document.querySelector("#spaceFactText"),
  spaceFactSource: document.querySelector("#spaceFactSource"),
  nextFact: document.querySelector("#nextFactButton"),
  nextSpaceEvent: document.querySelector("#nextSpaceEvent"),
  nextSpaceEventDate: document.querySelector("#nextSpaceEventDate"),
  smartPriorityList: document.querySelector("#smartPriorityList"),
  focusTimer: document.querySelector("#focusTimer"),
  focusStatus: document.querySelector("#focusStatus"),
  focusTaskSelect: document.querySelector("#focusTaskSelect"),
  startFocus: document.querySelector("#startFocusButton"),
  pauseFocus: document.querySelector("#pauseFocusButton"),
  resetFocus: document.querySelector("#resetFocusButton"),
  habitForm: document.querySelector("#habitForm"),
  habitTitle: document.querySelector("#habitTitle"),
  habitList: document.querySelector("#habitList"),
  completedToday: document.querySelector("#completedToday"),
  focusMinutes: document.querySelector("#focusMinutes"),
  habitStreaks: document.querySelector("#habitStreaks"),
  overdueRatio: document.querySelector("#overdueRatio"),
  projectBars: document.querySelector("#projectBars"),
  breakdownInput: document.querySelector("#breakdownInput"),
  breakdownButton: document.querySelector("#breakdownButton"),
  addBreakdown: document.querySelector("#addBreakdownButton"),
  breakdownList: document.querySelector("#breakdownList"),
  form: document.querySelector("#taskForm"),
  id: document.querySelector("#taskId"),
  title: document.querySelector("#taskTitle"),
  project: document.querySelector("#taskProject"),
  due: document.querySelector("#taskDue"),
  priority: document.querySelector("#taskPriority"),
  notes: document.querySelector("#taskNotes"),
  tags: document.querySelector("#taskTags"),
  submitLabel: document.querySelector("#submitButton span"),
  cancelEdit: document.querySelector("#cancelEditButton"),
  search: document.querySelector("#searchInput"),
  seed: document.querySelector("#seedButton"),
  filters: document.querySelectorAll(".filter-button"),
  sort: document.querySelector("#sortSelect"),
  clearDone: document.querySelector("#clearDoneButton"),
  taskListTitle: document.querySelector("#taskListTitle"),
  taskListSubtitle: document.querySelector("#taskListSubtitle"),
  taskList: document.querySelector("#taskListElement"),
  kanban: document.querySelector("#kanbanBoard"),
  calendarTitle: document.querySelector("#calendarTitle"),
  prevMonth: document.querySelector("#prevMonthButton"),
  nextMonth: document.querySelector("#nextMonthButton"),
  calendar: document.querySelector("#calendarGrid"),
  historySubtitle: document.querySelector("#historySubtitle"),
  historyList: document.querySelector("#historyList"),
  emptyState: document.querySelector("#emptyState"),
  starfield: document.querySelector("#starfield"),
  template: document.querySelector("#taskTemplate")
};

const filterNames = {
  all: "All tasks",
  today: "Due today",
  upcoming: "Upcoming",
  completed: "Completed"
};

const statusColumns = [
  { id: "backlog", label: "Backlog" },
  { id: "active", label: "Active" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" }
];

const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
};

const spaceFacts = [
  {
    text: "Sunlight takes about 8 minutes and 20 seconds to reach Earth.",
    source: "Solar-system scale"
  },
  {
    text: "A day on Venus is longer than a Venus year because the planet rotates so slowly.",
    source: "Planet weirdness"
  },
  {
    text: "Neutron stars can pack more mass than the Sun into a sphere roughly city-sized.",
    source: "Stellar remnants"
  },
  {
    text: "The Milky Way is roughly 100,000 light-years wide, so our galaxy is not exactly a small neighborhood.",
    source: "Galaxy scale"
  },
  {
    text: "The International Space Station circles Earth about every 90 minutes.",
    source: "Low Earth orbit"
  },
  {
    text: "Meteor showers happen when Earth passes through dust trails left behind by comets or asteroids.",
    source: "Skywatching basics"
  },
  {
    text: "A total solar eclipse only happens when the Moon fully covers the Sun from a narrow path on Earth.",
    source: "Eclipse geometry"
  }
];

const spaceEvents = [
  {
    date: "2026-05-19",
    title: "Earthshine nights",
    type: "moon",
    detail: "Good timing for Da Vinci glow on the crescent Moon."
  },
  {
    date: "2026-05-31",
    title: "Micro Blue Moon",
    type: "moon",
    detail: "The second Full Moon of May 2026."
  },
  {
    date: "2026-06-15",
    title: "Super New Moon",
    type: "moon",
    detail: "Dark-sky window around the New Moon."
  },
  {
    date: "2026-06-15",
    title: "Mercury greatest elongation east",
    type: "planet",
    detail: "Mercury appears farthest from the Sun in the evening sky."
  },
  {
    date: "2026-06-21",
    title: "June Solstice",
    type: "season",
    detail: "Longest day in the Northern Hemisphere."
  },
  {
    date: "2026-06-29",
    title: "Micro Strawberry Moon",
    type: "moon",
    detail: "June Full Moon."
  },
  {
    date: "2026-07-06",
    title: "Earth at aphelion",
    type: "orbit",
    detail: "Earth reaches its farthest point from the Sun."
  },
  {
    date: "2026-07-14",
    title: "New Moon",
    type: "moon",
    detail: "Darker skies around New Moon."
  },
  {
    date: "2026-07-29",
    title: "Buck Moon",
    type: "moon",
    detail: "July Full Moon."
  },
  {
    date: "2026-08-02",
    title: "Mercury greatest elongation west",
    type: "planet",
    detail: "Mercury appears farthest from the Sun in the morning sky."
  },
  {
    date: "2026-08-12",
    title: "Total solar eclipse",
    type: "eclipse",
    detail: "Visible in Greenland, Iceland, Spain, Russia, and a small area of Portugal."
  },
  {
    date: "2026-08-12",
    title: "Perseid meteors",
    type: "meteor",
    detail: "Perseids peak near New Moon, excellent for dark skies."
  },
  {
    date: "2026-08-15",
    title: "Venus greatest elongation east",
    type: "planet",
    detail: "Venus shines brightly after sunset."
  },
  {
    date: "2026-08-28",
    title: "Partial lunar eclipse",
    type: "eclipse",
    detail: "Visible from the nighttime side of Earth, including the Americas, Europe, and Africa."
  },
  {
    date: "2026-08-28",
    title: "Sturgeon Moon",
    type: "moon",
    detail: "August Full Moon."
  },
  {
    date: "2026-09-11",
    title: "New Moon",
    type: "moon",
    detail: "Darker skies around New Moon."
  },
  {
    date: "2026-09-23",
    title: "September Equinox",
    type: "season",
    detail: "Astronomical fall begins in the Northern Hemisphere."
  },
  {
    date: "2026-09-26",
    title: "Harvest Moon",
    type: "moon",
    detail: "Full Moon closest to the September equinox."
  },
  {
    date: "2026-10-21",
    title: "Orionid meteors",
    type: "meteor",
    detail: "Halley's Comet dust returns as the Orionids."
  },
  {
    date: "2026-11-05",
    title: "Southern Taurids",
    type: "meteor",
    detail: "A modest shower known for occasional bright fireballs."
  },
  {
    date: "2026-12-14",
    title: "Geminid meteors",
    type: "meteor",
    detail: "One of the strongest meteor showers of the year."
  },
  {
    date: "2026-12-21",
    title: "December Solstice",
    type: "season",
    detail: "Shortest day in the Northern Hemisphere."
  },
  {
    date: "2026-12-22",
    title: "Ursid meteors",
    type: "meteor",
    detail: "Late-December meteor shower near the solstice."
  }
];

els.todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric"
}).format(new Date());


async function init() {
  initSpaceTimeEffects();
  bindEvents();
  initSettings();
  await migrateLegacyTasks();
  await refresh();
}

function bindEvents() {
  document.addEventListener("pointermove", event => {
    const x = Math.round((event.clientX / window.innerWidth) * 100);
    const y = Math.round((event.clientY / window.innerHeight) * 100);
    document.body.style.setProperty("--pointer-x", `${x}%`);
    document.body.style.setProperty("--pointer-y", `${y}%`);
  });

  document.addEventListener("pointermove", event => {
    const card = event.target.closest?.(".task-card, .metric-card, .calendar-day");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    card.style.setProperty("--card-x", `${x}%`);
    card.style.setProperty("--card-y", `${y}%`);
  });

  els.viewTabs.forEach(button => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      els.viewTabs.forEach(tab => tab.classList.toggle("active", tab === button));
      els.panels.forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === state.view));
      render();
    });
  });

  els.filters.forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      els.filters.forEach(filter => filter.classList.toggle("active", filter === button));
      render();
    });
  });

  els.search.addEventListener("input", event => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  els.sort.addEventListener("change", event => {
    state.sort = event.target.value;
    render();
  });

  els.nextFact.addEventListener("click", () => {
    state.factIndex = (state.factIndex + 1) % spaceFacts.length;
    renderSpaceBriefing();
  });

  els.prevMonth.addEventListener("click", () => {
    state.calendarDate = new Date(
      state.calendarDate.getFullYear(),
      state.calendarDate.getMonth() - 1,
      1
    );
    render();
  });

  els.nextMonth.addEventListener("click", () => {
    state.calendarDate = new Date(
      state.calendarDate.getFullYear(),
      state.calendarDate.getMonth() + 1,
      1
    );
    render();
  });

  els.startFocus.addEventListener("click", startFocusTimer);
  els.pauseFocus.addEventListener("click", pauseFocusTimer);
  els.resetFocus.addEventListener("click", resetFocusTimer);

  els.habitForm.addEventListener("submit", async event => {
    event.preventDefault();
    const title = els.habitTitle.value.trim();
    if (!title) {
      els.habitTitle.focus();
      return;
    }

    await api("/habits", { method: "POST", body: { title } });
    els.habitForm.reset();
    await refresh();
  });

  els.breakdownButton.addEventListener("click", () => {
    state.breakdownSuggestions = suggestBreakdown(els.breakdownInput.value);
    renderBreakdown();
  });

  els.addBreakdown.addEventListener("click", async () => {
    const project = normalizeProject(els.project.value || "Breakdown");
    for (const suggestion of state.breakdownSuggestions) {
      await api("/tasks", {
        method: "POST",
        body: {
          title: suggestion,
          project,
          due: "",
          priority: "medium",
          notes: `Generated from: ${els.breakdownInput.value.trim()}`,
          tags: ["breakdown"]
        }
      });
    }
    state.breakdownSuggestions = [];
    els.breakdownInput.value = "";
    renderBreakdown();
    await refresh();
  });

  els.form.addEventListener("submit", async event => {
    event.preventDefault();
    const payload = formPayload();
    if (!payload.title) {
      els.title.focus();
      return;
    }

    if (els.id.value) {
      await api(`/tasks/${els.id.value}`, { method: "PUT", body: payload });
    } else {
      await api("/tasks", { method: "POST", body: payload });
    }

    resetForm();
    await refresh();
  });

  els.cancelEdit.addEventListener("click", resetForm);

  els.clearDone.addEventListener("click", async () => {
    await api("/tasks/completed", { method: "DELETE" });
    await refresh();
  });

  els.seed.addEventListener("click", async () => {
    await api("/seed", { method: "POST" });
    await refresh();
  });
}

function initSpaceTimeEffects() {
  const canvas = els.starfield;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const stars = [];
  const starCount = 150;
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    while (stars.length < starCount) {
      stars.push(makeStar());
    }
  }

  function makeStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.7 + 0.25,
      speed: Math.random() * 0.32 + 0.08,
      pulse: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.78 ? "255, 201, 107" : Math.random() > 0.52 ? "72, 215, 182" : "190, 215, 255"
    };
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = "lighter";

    for (const star of stars) {
      star.y += star.speed;
      star.x += Math.sin(star.y * 0.006) * 0.05;
      star.pulse += 0.025;

      if (star.y > height + 8) {
        star.y = -8;
        star.x = Math.random() * width;
      }

      const alpha = 0.34 + Math.sin(star.pulse) * 0.22;
      context.beginPath();
      context.fillStyle = `rgba(${star.tint}, ${alpha})`;
      context.shadowColor = `rgba(${star.tint}, 0.55)`;
      context.shadowBlur = 8;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
    animationFrame = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));
  resize();
  draw();
}

async function migrateLegacyTasks() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;

  try {
    const tasks = JSON.parse(legacy);
    if (Array.isArray(tasks) && tasks.length) {
      await api("/import", {
        method: "POST",
        body: {
          tasks: tasks.map(task => ({
            title: task.title,
            project: task.list || "Personal",
            due: task.due || "",
            priority: task.priority === "normal" ? "medium" : task.priority,
            status: task.done ? "done" : "active",
            done: Boolean(task.done),
            notes: "",
            tags: [],
            createdAt: task.createdAt
          }))
        }
      });
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }
}

async function refresh() {
  setSync("loading", "Syncing", "Reading backend storage");
  try {
    const data = await api("/tasks");
    state.tasks = data.tasks;
    state.history = data.history;
    state.habits = data.habits || [];
    state.focusSessions = data.focusSessions || [];
    state.loading = false;
    setSync("online", "Backend connected", "Tasks saved in data/tasks.json");
    render();
  } catch (error) {
    state.loading = false;
    setSync("offline", "Backend unavailable", "Run npm install, then npm start");
    render();
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

function formPayload() {
  return {
    title: els.title.value.trim(),
    project: normalizeProject(els.project.value),
    due: els.due.value,
    priority: els.priority.value,
    notes: els.notes.value.trim(),
    tags: parseTags(els.tags.value)
  };
}

function resetForm() {
  els.form.reset();
  els.id.value = "";
  els.priority.value = "medium";
  els.submitLabel.textContent = "Add task";
  els.cancelEdit.hidden = true;
}

function parseTags(value) {
  return value
    .split(",")
    .map(tag => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeProject(value) {
  return value.trim() || "Personal";
}

function setSync(mode, title, text) {
  els.syncCard.dataset.mode = mode;
  els.syncDot.dataset.mode = mode;
  els.syncTitle.textContent = title;
  els.syncText.textContent = text;
}

function visibleTasks() {
  return state.tasks
    .filter(matchesProject)
    .filter(matchesFilter)
    .filter(matchesSearch)
    .sort(sortTasks);
}

function matchesProject(task) {
  return state.selectedProject === "all" || task.project === state.selectedProject;
}

function matchesFilter(task) {
  if (state.filter === "today") return isToday(task) && !task.done;
  if (state.filter === "upcoming") return isUpcoming(task);
  if (state.filter === "completed") return task.done;
  return true;
}

function matchesSearch(task) {
  if (!state.search) return true;
  return [
    task.title,
    task.project,
    task.priority,
    task.notes,
    ...(task.tags || [])
  ].join(" ").toLowerCase().includes(state.search);
}

function sortTasks(a, b) {
  if (state.sort === "priority") {
    return priorityRank[b.priority] - priorityRank[a.priority] || dateRank(a) - dateRank(b);
  }

  if (state.sort === "created") {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  if (state.sort === "updated") {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  }

  return dateRank(a) - dateRank(b) || priorityRank[b.priority] - priorityRank[a.priority];
}

function dateRank(task) {
  return task.due ? new Date(`${task.due}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(task) {
  return task.due === todayKey();
}

function isUpcoming(task) {
  return task.due && task.due > todayKey() && !task.done;
}

function isOverdue(task) {
  return task.due && task.due < todayKey() && !task.done;
}

function render() {
  const tasks = visibleTasks();
  renderStats();
  renderProjects();
  renderDashboard(tasks);
  renderKanban(tasks);
  renderCalendar();
  renderHistory();
  renderSpaceBriefing();
  renderSmartPriorities();
  renderFocusConsole();
  renderHabits();
  renderAnalytics();
  renderBreakdown();
  els.emptyState.hidden = state.loading || tasks.length > 0 || state.view === "calendar";
}

function renderStats() {
  const total = state.tasks.length;
  const open = state.tasks.filter(task => !task.done);
  const completed = total - open.length;
  const focus = total ? Math.round((completed / total) * 100) : 0;

  els.openCount.textContent = open.length;
  els.todayCount.textContent = state.tasks.filter(task => isToday(task) && !task.done).length;
  els.overdueCount.textContent = state.tasks.filter(isOverdue).length;
  els.focusScore.textContent = `${focus}%`;
  els.openCaption.textContent = `${state.tasks.filter(task => task.status === "active").length} active now`;
}

function renderProjects() {
  const projects = [...new Set(state.tasks.map(task => task.project))].sort();
  els.projectCount.textContent = projects.length;
  els.projectList.replaceChildren();

  const allButton = projectButton("all", "All work", state.tasks.length);
  els.projectList.append(allButton);

  projects.forEach(project => {
    const count = state.tasks.filter(task => task.project === project).length;
    els.projectList.append(projectButton(project, project, count));
  });
}

function projectButton(project, label, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "project-button";
  button.classList.toggle("active", state.selectedProject === project);
  button.innerHTML = `<span>${escapeHtml(label)}</span><strong>${count}</strong>`;
  button.addEventListener("click", () => {
    state.selectedProject = project;
    render();
  });
  return button;
}

function renderDashboard(tasks) {
  els.taskListTitle.textContent = filterNames[state.filter];
  els.taskListSubtitle.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  els.taskList.replaceChildren(...tasks.map(task => taskCard(task)));
}

/* ── Kanban drag-and-drop state ──────────────────────── */
const _dnd = {
  draggedId: null,
  draggedEl: null,
  sourceZone: null
};

function renderKanban(tasks) {
  els.kanban.replaceChildren();
  statusColumns.forEach(column => {
    const columnTasks = tasks.filter(task => task.status === column.id);
    const section = document.createElement("section");
    section.className = "kanban-column";
    section.dataset.columnId = column.id;
    section.innerHTML = `
      <div class="kanban-head">
        <h3>${column.label}</h3>
        <strong class="kanban-col-count">${columnTasks.length}</strong>
      </div>
      <div class="kanban-items" data-drop-column="${column.id}"></div>
    `;
    const items = section.querySelector(".kanban-items");
    columnTasks.forEach(task => items.append(taskCard(task, true)));
    _bindDropZone(items);
    els.kanban.append(section);
  });
}

/* Bind dragover / dragleave / drop to a kanban-items zone */
function _bindDropZone(zone) {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    zone.classList.add("dnd-zone-active");

    /* Reposition the placeholder ghost */
    const after = _dragAfterElement(zone, e.clientY);
    let ghost = zone.querySelector(".dnd-placeholder");
    if (!ghost) {
      ghost = document.createElement("div");
      ghost.className = "dnd-placeholder";
    }
    if (after) zone.insertBefore(ghost, after);
    else zone.appendChild(ghost);
  });

  zone.addEventListener("dragleave", e => {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove("dnd-zone-active");
      zone.querySelector(".dnd-placeholder")?.remove();
    }
  });

  zone.addEventListener("drop", async e => {
    e.preventDefault();
    zone.classList.remove("dnd-zone-active");
    zone.querySelector(".dnd-placeholder")?.remove();

    const taskId = e.dataTransfer.getData("text/plain");
    const newStatus = zone.dataset.dropColumn;
    if (!taskId || !newStatus) return;

    /* Optimistic move: insert card visually before the API call */
    if (_dnd.draggedEl) {
      _dnd.draggedEl.classList.remove("dnd-dragging");
      const after = _dragAfterElement(zone, e.clientY);
      if (after) zone.insertBefore(_dnd.draggedEl, after);
      else zone.appendChild(_dnd.draggedEl);
      _refreshColumnCounts();
    }

    /* Reuse the existing status update path — identical to the status <select> */
    try {
      await api(`/tasks/${taskId}/status`, { method: "PATCH", body: { status: newStatus } });
    } finally {
      await refresh();   // full re-render to keep everything in sync
    }
  });
}

/* Return the element a dragged card should be inserted before, or null */
function _dragAfterElement(zone, pointerY) {
  const candidates = [...zone.querySelectorAll(".task-card:not(.dnd-dragging)")];
  return candidates.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = pointerY - (box.top + box.height / 2);
    if (offset < 0 && offset > closest.offset) return { offset, el: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).el ?? null;
}

/* Recount cards in each column header after an optimistic move */
function _refreshColumnCounts() {
  els.kanban.querySelectorAll(".kanban-column").forEach(col => {
    const n = col.querySelectorAll(".kanban-items .task-card").length;
    const badge = col.querySelector(".kanban-col-count");
    if (badge) badge.textContent = n;
  });
}

function renderCalendar() {
  const today = new Date();
  const visibleDate = state.calendarDate;
  const start = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const end = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0);
  const firstDay = start.getDay();
  const days = [];

  els.calendarTitle.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(visibleDate);

  for (let i = 0; i < firstDay; i += 1) days.push(null);
  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), day));
  }

  els.calendar.replaceChildren();
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(label => {
    const dayName = document.createElement("div");
    dayName.className = "calendar-weekday";
    dayName.textContent = label;
    els.calendar.append(dayName);
  });

  days.forEach(date => {
    const cell = document.createElement("article");
    cell.className = "calendar-day";
    if (!date) {
      cell.classList.add("muted");
      els.calendar.append(cell);
      return;
    }

    const key = toDateKey(date);
    const dueTasks = state.tasks.filter(task => task.due === key);
    const dayEvents = spaceEvents.filter(event => event.date === key);
    cell.classList.toggle("today", key === todayKey());
    cell.classList.toggle("has-space-event", dayEvents.length > 0);
    cell.innerHTML = `
      <strong>${date.getDate()}</strong>
      <div class="calendar-dots"></div>
      <div class="calendar-events"></div>
    `;
    const dots = cell.querySelector(".calendar-dots");
    const events = cell.querySelector(".calendar-events");

    dueTasks.slice(0, 4).forEach(task => {
      const dot = document.createElement("span");
      dot.className = `calendar-dot priority-${task.priority}`;
      dot.title = task.title;
      dots.append(dot);
    });
    dayEvents.slice(0, 2).forEach(event => {
      const eventChip = document.createElement("span");
      eventChip.className = `space-event-chip ${event.type}`;
      eventChip.textContent = event.title;
      eventChip.title = event.detail;
      events.append(eventChip);
    });
    if (dueTasks.length > 4) {
      const more = document.createElement("small");
      more.textContent = `+${dueTasks.length - 4}`;
      dots.append(more);
    }
    if (dayEvents.length > 2) {
      const moreEvents = document.createElement("small");
      moreEvents.textContent = `+${dayEvents.length - 2} events`;
      events.append(moreEvents);
    }
    els.calendar.append(cell);
  });
}

function renderSpaceBriefing() {
  const fact = spaceFacts[state.factIndex];
  const upcoming = spaceEvents.find(event => event.date >= todayKey()) || spaceEvents[0];

  els.spaceFactText.textContent = fact.text;
  els.spaceFactSource.textContent = fact.source;
  els.nextSpaceEvent.textContent = upcoming.title;
  els.nextSpaceEventDate.textContent = `${formatEventDate(upcoming.date)} - ${upcoming.detail}`;
}

function renderSmartPriorities() {
  const tasks = state.tasks
    .filter(task => !task.done)
    .map(task => ({ task, score: smartScore(task) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  els.smartPriorityList.replaceChildren();

  if (!tasks.length) {
    els.smartPriorityList.append(emptyPanelText("No open tasks. Clean orbit."));
    return;
  }

  tasks.forEach(({ task, score }, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "smart-item";
    item.innerHTML = `
      <strong>${index + 1}</strong>
      <span>${escapeHtml(task.title)}</span>
      <small>${smartReason(task)} · ${score} pts</small>
    `;
    item.addEventListener("click", () => editTask(task));
    els.smartPriorityList.append(item);
  });
}

function smartScore(task) {
  let score = priorityRank[task.priority] * 12;
  if (task.status === "blocked") score += 18;
  if (isOverdue(task)) score += 38;
  if (isToday(task)) score += 32;
  if (task.due && task.due > todayKey()) {
    const daysAway = Math.ceil((dateRank(task) - Date.now()) / 86400000);
    if (daysAway <= 3) score += 18;
    if (daysAway <= 7) score += 8;
  }
  if (task.notes) score += 4;
  return Math.max(1, score);
}

function smartReason(task) {
  if (isOverdue(task)) return "overdue";
  if (isToday(task)) return "due today";
  if (task.status === "blocked") return "blocked";
  if (task.priority === "urgent") return "urgent";
  return task.due ? formatDue(task) : task.priority;
}

function renderFocusConsole() {
  const openTasks = state.tasks.filter(task => !task.done);
  const selected = els.focusTaskSelect.value;
  els.focusTaskSelect.replaceChildren();

  const general = document.createElement("option");
  general.value = "";
  general.textContent = "General focus";
  els.focusTaskSelect.append(general);

  openTasks.forEach(task => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.title;
    els.focusTaskSelect.append(option);
  });

  if ([...els.focusTaskSelect.options].some(option => option.value === selected)) {
    els.focusTaskSelect.value = selected;
  }

  els.focusTimer.textContent = formatTimer(state.focus.secondsLeft);
  els.startFocus.disabled = state.focus.running;
  els.pauseFocus.disabled = !state.focus.running;
  els.focusStatus.textContent = state.focus.running
    ? "Focus sprint in progress."
    : "Pick a task, start a sprint.";
}

function startFocusTimer() {
  if (state.focus.running) return;

  state.focus.running = true;
  state.focus.timerId = window.setInterval(async () => {
    state.focus.secondsLeft -= 1;
    els.focusTimer.textContent = formatTimer(state.focus.secondsLeft);

    if (state.focus.secondsLeft <= 0) {
      await completeFocusSession();
    }
  }, 1000);
  renderFocusConsole();
}

function pauseFocusTimer() {
  window.clearInterval(state.focus.timerId);
  state.focus.running = false;
  state.focus.timerId = null;
  renderFocusConsole();
}

function resetFocusTimer() {
  pauseFocusTimer();
  state.focus.secondsLeft = state.focus.totalSeconds;
  renderFocusConsole();
}

async function completeFocusSession() {
  const selectedTask = state.tasks.find(task => task.id === els.focusTaskSelect.value);
  pauseFocusTimer();
  state.focus.secondsLeft = state.focus.totalSeconds;
  await api("/focus-sessions", {
    method: "POST",
    body: {
      minutes: Math.round(state.focus.totalSeconds / 60),
      taskId: selectedTask?.id || "",
      taskTitle: selectedTask?.title || "General focus"
    }
  });
  await refresh();
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function renderHabits() {
  els.habitList.replaceChildren();

  if (!state.habits.length) {
    els.habitList.append(emptyPanelText("Add one daily habit to start a streak."));
    return;
  }

  state.habits.forEach(habit => {
    const doneToday = habit.completions?.includes(todayKey());
    const item = document.createElement("article");
    item.className = "habit-item";
    item.classList.toggle("done", doneToday);
    item.innerHTML = `
      <button class="complete-button habit-check" type="button" aria-label="Toggle ${escapeHtml(habit.title)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m5 12 4 4 10-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div>
        <strong>${escapeHtml(habit.title)}</strong>
        <span>${habit.streak} day streak</span>
      </div>
      <button class="icon-button habit-delete" type="button" aria-label="Delete ${escapeHtml(habit.title)}">×</button>
    `;
    item.querySelector(".habit-check").addEventListener("click", async () => {
      await api(`/habits/${habit.id}/today`, { method: "PATCH" });
      await refresh();
    });
    item.querySelector(".habit-delete").addEventListener("click", async () => {
      await api(`/habits/${habit.id}`, { method: "DELETE" });
      await refresh();
    });
    els.habitList.append(item);
  });
}

function renderAnalytics() {
  const completedToday = state.history.filter(event => (
    event.action === "completed" && event.at?.slice(0, 10) === todayKey()
  )).length;
  const focusMinutes = state.focusSessions
    .filter(session => session.completedAt?.slice(0, 10) === todayKey())
    .reduce((sum, session) => sum + session.minutes, 0);
  const totalStreak = state.habits.reduce((sum, habit) => sum + (habit.streak || 0), 0);
  const open = state.tasks.filter(task => !task.done).length;
  const overdue = state.tasks.filter(isOverdue).length;
  const risk = open ? Math.round((overdue / open) * 100) : 0;

  els.completedToday.textContent = completedToday;
  els.focusMinutes.textContent = focusMinutes;
  els.habitStreaks.textContent = totalStreak;
  els.overdueRatio.textContent = `${risk}%`;

  renderProjectBars();
}

function renderProjectBars() {
  els.projectBars.replaceChildren();
  const projects = [...new Set(state.tasks.map(task => task.project))].slice(0, 5);

  if (!projects.length) {
    els.projectBars.append(emptyPanelText("No project data yet."));
    return;
  }

  const max = Math.max(...projects.map(project => (
    state.tasks.filter(task => task.project === project).length
  )));

  projects.forEach(project => {
    const count = state.tasks.filter(task => task.project === project).length;
    const row = document.createElement("div");
    row.className = "project-bar";
    row.innerHTML = `
      <span>${escapeHtml(project)}</span>
      <i style="width: ${Math.max(8, (count / max) * 100)}%"></i>
      <strong>${count}</strong>
    `;
    els.projectBars.append(row);
  });
}

function renderBreakdown() {
  els.breakdownList.replaceChildren();
  els.addBreakdown.disabled = state.breakdownSuggestions.length === 0;

  if (!state.breakdownSuggestions.length) {
    els.breakdownList.append(emptyPanelText("Describe a mission and I will split it into usable steps."));
    return;
  }

  state.breakdownSuggestions.forEach(suggestion => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    els.breakdownList.append(item);
  });
}

function suggestBreakdown(rawGoal) {
  const goal = rawGoal.trim();
  if (!goal) return [];

  const lower = goal.toLowerCase();
  const steps = [];

  steps.push(`Define the outcome for: ${goal}`);
  if (/(publish|deploy|launch|site|app|website)/.test(lower)) {
    steps.push("Confirm the final pages, features, and user flow");
    steps.push("Run a local QA pass on desktop and mobile");
    steps.push("Prepare deployment settings and environment notes");
  } else if (/(study|exam|learn|course)/.test(lower)) {
    steps.push("List the topics and rank them by confidence");
    steps.push("Schedule two focused review blocks");
    steps.push("Do one practice test and review mistakes");
  } else if (/(design|brand|ui|frontend)/.test(lower)) {
    steps.push("Collect references and decide the visual direction");
    steps.push("Build the first polished version");
    steps.push("Check contrast, spacing, and mobile layout");
  } else {
    steps.push("Break the work into research, build, review, and finish phases");
    steps.push("Identify the first 25-minute action");
    steps.push("Decide what done looks like");
  }

  steps.push("Ship the smallest complete version");
  return [...new Set(steps)].slice(0, 6);
}

function emptyPanelText(text) {
  const item = document.createElement("p");
  item.className = "panel-empty";
  item.textContent = text;
  return item;
}

function renderHistory() {
  els.historySubtitle.textContent = `${state.history.length} recent events`;
  els.historyList.replaceChildren();
  state.history.slice(0, 12).forEach(event => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span>${escapeHtml(event.action)}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <time>${relativeTime(event.at)}</time>
    `;
    els.historyList.append(item);
  });
}

function taskCard(task, compact = false) {
  const card = els.template.content.firstElementChild.cloneNode(true);
  card.classList.add(`priority-${task.priority}`);
  card.classList.toggle("done", task.done);
  card.classList.toggle("compact", compact);

  /* ── Drag support for kanban cards ── */
  if (compact) {
    card.draggable = true;
    card.dataset.taskId = task.id;

    card.addEventListener("dragstart", e => {
      _dnd.draggedId = task.id;
      _dnd.draggedEl = card;
      _dnd.sourceZone = card.closest(".kanban-items");
      e.dataTransfer.setData("text/plain", String(task.id));
      e.dataTransfer.effectAllowed = "move";
      /* Short delay so the browser snapshot captures the normal card */
      requestAnimationFrame(() => card.classList.add("dnd-dragging"));
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dnd-dragging");
      document.querySelectorAll(".dnd-zone-active").forEach(z => z.classList.remove("dnd-zone-active"));
      document.querySelectorAll(".dnd-placeholder").forEach(p => p.remove());
      _dnd.draggedId = null;
      _dnd.draggedEl = null;
      _dnd.sourceZone = null;
    });
  }

  card.querySelector("h4").textContent = task.title;
  card.querySelector(".priority-pill").textContent = task.priority;
  card.querySelector(".priority-pill").classList.add(task.priority);

  const notes = card.querySelector(".task-notes");
  notes.textContent = task.notes || "No notes yet";
  notes.hidden = compact && !task.notes;

  const meta = card.querySelector(".task-meta");
  meta.append(metaPill(formatDue(task), dueClass(task)));
  meta.append(metaPill(task.project));
  meta.append(statusSelect(task));

  const tags = card.querySelector(".tag-list");
  (task.tags || []).forEach(tag => tags.append(metaPill(`#${tag}`, "tag-pill")));

  card.querySelector(".complete-button").setAttribute("aria-pressed", String(task.done));
  card.querySelector(".complete-button").addEventListener("click", () => toggleTask(task));
  card.querySelector(".edit-button").addEventListener("click", () => editTask(task));
  card.querySelector(".delete-button").addEventListener("click", () => removeTask(task.id));

  return card;
}

function metaPill(text, className = "") {
  const pill = document.createElement("span");
  pill.className = className;
  pill.textContent = text;
  return pill;
}

function statusSelect(task) {
  const select = document.createElement("select");
  select.className = "status-select";
  select.setAttribute("aria-label", `Status for ${task.title}`);
  statusColumns.forEach(column => {
    const option = document.createElement("option");
    option.value = column.id;
    option.textContent = column.label;
    select.append(option);
  });
  select.value = task.status;
  select.addEventListener("change", async () => {
    await api(`/tasks/${task.id}/status`, { method: "PATCH", body: { status: select.value } });
    await refresh();
  });
  return select;
}

function dueClass(task) {
  if (isOverdue(task)) return "overdue";
  if (isToday(task) && !task.done) return "today";
  return "";
}

function formatDue(task) {
  if (!task.due) return "No date";
  const date = new Date(`${task.due}T00:00:00`);
  const label = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  if (isToday(task)) return `Today, ${label}`;
  if (isOverdue(task)) return `Overdue, ${label}`;
  return label;
}

function editTask(task) {
  els.id.value = task.id;
  els.title.value = task.title;
  els.project.value = task.project;
  els.due.value = task.due || "";
  els.priority.value = task.priority;
  els.notes.value = task.notes || "";
  els.tags.value = (task.tags || []).join(", ");
  els.submitLabel.textContent = "Save task";
  els.cancelEdit.hidden = false;
  els.title.focus();
}

async function toggleTask(task) {
  await api(`/tasks/${task.id}/status`, {
    method: "PATCH",
    body: { status: task.done ? "active" : "done" }
  });
  await refresh();
}

async function removeTask(id) {
  await api(`/tasks/${id}`, { method: "DELETE" });
  await refresh();
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function formatEventDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ══════════════════════════════════════════════════════
   SETTINGS PANEL
   — Local-only, no backend. Persisted via localStorage.
══════════════════════════════════════════════════════ */

const SETTINGS_KEY = "nebula-tasks.settings.v1";

const DEFAULT_SETTINGS = {
  displayName:  "",
  dailyGoal:    5,
  focusLength:  25,
  theme:        "nebula",
  toasts:       true,
  starfield:    true
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings(settings) {
  // Focus timer length — only update if timer is not running
  if (!state.focus.running) {
    const secs = Math.max(300, Math.min(7200, (settings.focusLength || 25) * 60));
    state.focus.totalSeconds = secs;
    state.focus.secondsLeft  = secs;
    if (els.focusTimer) els.focusTimer.textContent = formatTimer(secs);
  }

  // Starfield visibility
  const canvas = document.querySelector("#starfield");
  if (canvas) canvas.style.opacity = settings.starfield ? "1" : "0";

  // Store toast preference on window for toggleTask to read
  window._nebulaToastsEnabled = settings.toasts !== false;
}

function populateSettingsForm(settings) {
  const get = id => document.getElementById(id);

  if (get("settingDisplayName")) get("settingDisplayName").value = settings.displayName || "";
  if (get("settingDailyGoal"))   get("settingDailyGoal").value   = settings.dailyGoal  ?? 5;
  if (get("settingFocusLength")) get("settingFocusLength").value  = settings.focusLength ?? 25;
  if (get("settingToasts"))      get("settingToasts").checked     = settings.toasts !== false;
  if (get("settingStarfield"))   get("settingStarfield").checked  = settings.starfield !== false;

  // Theme radio
  const themeRadio = document.querySelector(`input[name="settingTheme"][value="${settings.theme || "nebula"}"]`);
  if (themeRadio) themeRadio.checked = true;
}

function readSettingsForm() {
  const get = id => document.getElementById(id);
  const themeRadio = document.querySelector('input[name="settingTheme"]:checked');

  return {
    displayName:  (get("settingDisplayName")?.value || "").trim(),
    dailyGoal:    Math.max(1, Math.min(50, parseInt(get("settingDailyGoal")?.value, 10) || 5)),
    focusLength:  Math.max(5, Math.min(120, parseInt(get("settingFocusLength")?.value, 10) || 25)),
    theme:        themeRadio?.value || "nebula",
    toasts:       get("settingToasts")?.checked ?? true,
    starfield:    get("settingStarfield")?.checked ?? true
  };
}

function openSettings() {
  const drawer = document.getElementById("settingsDrawer");
  const backdrop = document.getElementById("settingsBackdrop");

  if (!drawer) {
    console.log("Settings drawer not found");
    return;
  }

  populateSettingsForm(loadSettings());

  drawer.hidden = false;

  requestAnimationFrame(() => {
    drawer.classList.add("settings-open");

    if (backdrop) {
      backdrop.classList.add("settings-backdrop-visible");
    }
  });

  document.getElementById("settingsClose")?.focus();

  drawer._escHandler = (e) => {
    if (e.key === "Escape") closeSettings();
  };

  document.addEventListener("keydown", drawer._escHandler);
}

function closeSettings() {
  const drawer   = document.getElementById("settingsDrawer");
  const backdrop = document.getElementById("settingsBackdrop");
  if (!drawer) return;

  drawer.classList.remove("settings-open");
  backdrop.classList.remove("settings-backdrop-visible");

  drawer.addEventListener("transitionend", () => {
    drawer.hidden = true;
  }, { once: true });

  if (drawer._escHandler) document.removeEventListener("keydown", drawer._escHandler);
}

function initSettings() {
  const settings = loadSettings();
  applySettings(settings);

  document.getElementById("settingsButton")?.addEventListener("click", openSettings);
  document.getElementById("settingsClose")?.addEventListener("click", closeSettings);
  document.getElementById("settingsBackdrop")?.addEventListener("click", closeSettings);

  document.getElementById("settingsSave")?.addEventListener("click", () => {
    const settings = readSettingsForm();
    saveSettings(settings);
    applySettings(settings);

    // Update sidebar greeting if display name changed
    if (settings.displayName) {
      const welcome = document.getElementById("profileWelcome");
      const avatar  = document.getElementById("profileAvatar");
      if (welcome) welcome.textContent = `Welcome back, ${settings.displayName} 👋`;
      if (avatar)  avatar.textContent  = settings.displayName.charAt(0).toUpperCase();
    }

    // Show saved confirmation
    const note = document.getElementById("settingsSaveNote");
    if (note) {
      note.hidden = false;
      clearTimeout(note._timer);
      note._timer = setTimeout(() => { note.hidden = true; }, 2500);
    }
  });
}

// Patch showToast to respect the toasts preference
const _originalShowToast = typeof showToast === "function" ? showToast : null;
function showToast(title, message) {
  if (window._nebulaToastsEnabled === false) return;
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "nebula-toast";
  toast.innerHTML = `<span class="toast-title">${title}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-hiding");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2800);
}

init();
