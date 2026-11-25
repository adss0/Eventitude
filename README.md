# Eventitude 🎟️

**A full-stack events platform. Create and publish events, let people register and ask questions, vote the best questions to the top, and find events with keyword search. Built with Vue 3 on the front and a Node.js / Express REST API with SQLite on the back.**

> 🎓 Built for the Full Stack Web Development module (2024/25). The API was written on top of the module's starter project, and is checked by a suite of 116 automated Mocha/Chai tests.

---

## Why Eventitude?

Organising an event usually means juggling a sign-up form, an email thread for questions and a spreadsheet of who's coming. Eventitude puts all of that in one place:

- 🗓️ **Organisers** publish an event once, then edit it, close it or delete it whenever they need to.
- 🙋 **Attendees** register in one click and can ask the organiser questions in public.
- 👍 **Everyone** votes on questions, so the most useful ones rise to the top.
- 🧹 **Clean content.** Event details and questions run through a profanity filter before they're saved.

---

## How it works

```
 ┌────────────────────────┐   fetch (JSON)    ┌────────────────────────┐        ┌──────────┐
 │ Vue 3 single-page app  │ ───────────────▶  │ Express REST API       │ ─────▶ │  SQLite  │
 │ Vue Router · Vite      │ ◀───────────────  │ auth · validation      │ ◀───── │ db.sqlite│
 │ localhost:5173         │  X-Authorization  │ localhost:3333         │        └──────────┘
 └────────────────────────┘   session token   └────────────────────────┘
```

1. **Sign up and log in.** Passwords are hashed with a random salt (PBKDF2). Logging in returns a session token, which the app sends with every request that needs you to be signed in.
2. **Publish an event.** Give it a name, description, location, start date, registration closing date and a maximum number of attendees. Not ready yet? Save it as a **draft** in your browser and come back to it later.
3. **Register.** Other users sign up to your event until it's full or registration closes.
4. **Ask and vote.** Attendees ask questions on the event page (questions can be drafted too), and everyone can upvote or downvote them.
5. **Search.** Find events by keyword, and filter them to *my events*, *attending*, *open*, *archive* or *all events*.

---

## Features

| | Feature |
|---|---|
| ✏️ | Create, edit and delete events |
| 💾 | Save event and question drafts locally before publishing |
| ✅ | Register for events, with capacity and closing-date limits |
| ❓ | Public Q&A on every event |
| 👍 | Upvote and downvote questions |
| 🔍 | Keyword search with status filters (my events, attending, open, archive, all) |
| 🔐 | Sign up, log in and log out with salted, hashed passwords and session tokens |
| 🧹 | Profanity filter on event details and questions |
| 📱 | Responsive layout for desktop, tablet and mobile |

---

## Tech stack

| Area | Technology |
|---|---|
| Frontend | Vue 3 · Vue Router · Vite · Font Awesome |
| Backend | Node.js · Express · Joi (validation) · leo-profanity |
| Database | SQLite |
| Testing | Mocha · Chai · chai-http |

### Project structure

```
BackEnd/
  server.js            ← Starts the API on port 3333
  database.js          ← Creates the SQLite tables
  app/
    routes/            ← URL → controller (users, events, questions)
    controllers/       ← Request handling and validation
    models/            ← SQL queries
    lib/               ← Authentication middleware
  tests/               ← Mocha test suite (a → j, run in order)

FrontEnd/vue-project/src/
  router/              ← Page routes
  services/            ← Calls to the API
  views/pages/         ← One component per page
```

---

## Getting started

**Requirements:** Node.js 18+ and npm

```bash
git clone https://github.com/adss0/Eventitude.git
cd Eventitude
```

```bash
# 1. Backend (API on http://localhost:3333)
cd BackEnd
npm install
npm run dev
```

```bash
# 2. Frontend (in a second terminal, app on http://localhost:5173)
cd FrontEnd/vue-project
npm install
npm run dev
```

Open <http://localhost:5173>, sign up, and create your first event.

> The folder names are `BackEnd` and `FrontEnd` with capital letters. On macOS and Linux the `cd` commands must match exactly.

### Running the tests

With the backend running, open another terminal in `BackEnd/`:

```bash
npm run wipe   # reset the database (the tests expect a fresh one)
npm test       # run the API test suite
```

---

## API overview

| Method | Endpoint | What it does | Sign-in needed |
|---|---|---|---|
| POST | `/users` | Create an account | |
| POST | `/login` | Log in and get a session token | |
| POST | `/logout` | Log out | ✅ |
| POST | `/events` | Create an event | ✅ |
| GET | `/event/:event_id` | Get an event's details | |
| PATCH | `/event/:event_id` | Update an event | ✅ |
| POST | `/event/:event_id` | Register for an event | ✅ |
| DELETE | `/event/:event_id` | Delete (archive) an event | ✅ |
| GET | `/search?q=&status=` | Search events | |
| POST | `/event/:event_id/question` | Ask a question | ✅ |
| DELETE | `/question/:question_id` | Delete a question | ✅ |
| POST / DELETE | `/question/:question_id/vote` | Upvote / downvote a question | ✅ |

---

## License

This project is licensed under the MIT License.
