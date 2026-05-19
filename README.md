# Nebula Tasks

Nebula Tasks is a full-stack productivity command center. It has a polished dashboard, kanban board, calendar due-date view, task history, smart priorities, focus mode, habit streaks, analytics, rule-based task breakdown, projects, tags, priorities, notes, search, filters, and backend JSON storage.

## Run Locally

On Windows, easiest:

```powershell
.\start-local.ps1
```

Or double-click:

```text
start-local.bat
```

Normal Node/npm setup:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

The backend stores tasks in:

```text
data/tasks.json
```

That file also stores habits, focus sessions, and task history.

If you only have Node available and cannot run `npm install`, this app still starts with a built-in fallback server:

```bash
node server.js
```

Normal deployments should still run `npm install` so the Express server is used.

## Useful Commands

```bash
npm run check
npm start
```

## Deploy

### Render

1. Push this folder to a GitHub repository.
2. Create a new Render Web Service.
3. Use `npm install` as the build command.
4. Use `npm start` as the start command.
5. Render will provide an HTTPS URL.

The included `render.yaml` can also be used as a blueprint.

### Railway

1. Create a new Railway project from your GitHub repo.
2. Railway should detect Node.js automatically.
3. Set the start command to `npm start` if it asks.

### Vercel

This project is better suited to Render or Railway because it uses a long-running Express server and writes to a JSON file. Vercel can host the static frontend, but serverless storage needs a hosted database instead of `data/tasks.json`.
