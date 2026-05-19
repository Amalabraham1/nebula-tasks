# Nebula Tasks 🌌

Nebula Tasks is a full-stack productivity command center built with Node.js, Express, and MongoDB Atlas.

It includes authentication, personalized task management, analytics, focus tracking, habits, projects, and a modern space-themed productivity dashboard.

---

## Features

- User login / signup
- Session authentication
- Protected dashboard routes
- Personalized user task storage
- MongoDB Atlas integration
- Kanban board
- Calendar due-date view
- Task history
- Smart priorities
- Focus mode
- Habit streaks
- Analytics dashboard
- Projects and tags
- Search and filters
- Notes support
- Space-themed Nebula UI
- Logout flow

---

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- express-session

Frontend:

- HTML
- CSS
- JavaScript

---

## Run Locally

Install dependencies:

```bash
npm install
```

Start app:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_connection_string
SESSION_SECRET=your_secret
PORT=3000
```

---

## Alternative Startup (Windows)

PowerShell:

```powershell
.\start-local.ps1
```

or double-click:

```text
start-local.bat
```

---

## Useful Commands

```bash
npm start
npm run check
```

---

## Project Structure

```text
Nebula Tasks
│
├── models/
│   ├── User.js
│   └── Task.js
│
├── data/
│
├── dashboard.html
├── login.html
├── logout.html
├── index.html
├── app.js
├── server.js
├── styles.css
├── package.json
├── render.yaml
└── README.md
```

---

## Deployment

### Render (Recommended)

1. Push project to GitHub
2. Create new Render Web Service
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Add environment variables:

```env
MONGODB_URI
SESSION_SECRET
```

Render will generate your live URL.

Nebula Tasks uses Express sessions and MongoDB Atlas, so Render is recommended.

---

## Future Ideas

- User avatars
- Notifications
- Drag-and-drop task movement
- Themes
- Dashboard customization
- AI productivity suggestions

---

Built as a personal full-stack learning project.