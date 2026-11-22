# Join

Join is a Kanban-based project management tool. Users create tasks, assign contacts, set priorities and due dates and move the tasks across a board from *To do* to *Done*.

Join was built as a group project in the web development bootcamp of the Developer Akademie (module 10). The frontend is written in vanilla HTML, CSS and JavaScript without frameworks and without a build step. Data is stored in Firebase Cloud Firestore.

> **Security notice:** Join is a frontend learning project. **Please do not use a real password when signing up.** Use test data only. All details are in [docs/SECURITY.md](docs/SECURITY.md).

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Data and storage](#data-and-storage)
- [Project structure](#project-structure)
- [Code conventions](#code-conventions)
- [Security and deliberate limitations](#security-and-deliberate-limitations)

## Features

### Sign up and log in

- Sign up with name, email, password and password confirmation
- Validation in the browser:
  - Name: starts with a capital letter, 2–16 characters, only letters, digits, spaces and `_ & + -`
  - Email: valid format, not registered yet
  - Password: at least 8 characters, uppercase and lowercase letters, a number, no spaces, both passwords match
  - Privacy policy must be accepted
- Every new user gets a tutorial task on the board that explains the first steps
- Log in with email and password, with generic error messages
- Guest log in without an account
- Show and hide the password
- Loading screen for database requests (visible after 1 second, cancelled after 10 seconds)

### Session

- Page guard: protected pages redirect to the log in page if no user is logged in, also when a page is restored from the browser cache
- Log out via the header menu removes all user data from the session
- Session timeout: automatic log out after 30 minutes of inactivity, a warning with a countdown 2 minutes before and a goodbye dialog at the end
- User data is kept in `sessionStorage` only and is removed when the tab is closed

### Summary

- Key metrics: To-do, Done, Urgent, Upcoming Deadline (earliest due date of all open tasks), Tasks in Board, Tasks in Progress, Awaiting Feedback
- Every tile links to the board
- Greeting with the name of the user; the guest greeting depends on the time of day
- On small screens the greeting is shown once as an intro animation after log in

### Board

- Four columns: To do, In progress, Await feedback, Done
- Task cards with category, title, description, subtask progress, avatars of the assigned contacts (up to 4, then "+N") and priority
- Search by title and description, with a clear button and a "No results found" message
- Drag and drop with the mouse between and within the columns, with auto scroll near the edges
- Touch sorting on mobile devices: hold a card for 0.5 seconds to grab it (with vibration where supported), then drag it
- Move menu on every card to move it to the previous or the next column
- The order of the cards in each column is saved in Firestore
- Task detail dialog: check off subtasks, edit or delete the task
- Edit form for title, description, due date, priority, assigned contacts and subtasks
- Add task dialog directly on the board
- Toast messages for moved, updated and deleted tasks and for errors
- Changes are cached in `sessionStorage` and sent to Firestore one after another in a queue

### Add Task

- Title, description, due date, priority (Urgent, Medium, Low), assigned contacts (multiple), category (Technical Task, User Story) and a subtask
- Medium is selected as the default priority
- The *Create Task* button stays disabled until the form is valid
- Custom dropdowns with keyboard support (arrow keys, Home, End, Enter, Space, Escape)
- *Clear* resets the form
- Status message after saving

### Contacts

- Contact list sorted alphabetically and grouped by the first letter
- Detail view with name, email (as `mailto` link), phone number and colored initials
- Add, edit and delete contacts in a dialog
- Separate options menu for edit and delete on mobile devices

### Further pages and layout

- Help page with a short guide
- Legal Notice and Privacy Policy, also reachable without log in
- Sidebar navigation and a header with the initials of the user and a menu (Help, Legal Notice, Privacy Policy, Log out)
- Responsive layout from desktop to small smartphones
- Hint to rotate the device when a smartphone is held in landscape mode
- Animations respect `prefers-reduced-motion`

## Tech stack

| Area | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3, Flexbox, CSS custom properties for colors |
| Logic | Vanilla JavaScript, ES modules for the Firebase files |
| Database | Firebase Cloud Firestore (Web SDK 12.19.0 via CDN) |
| Firebase Authentication | Anonymous sign-in for the connection to Firestore |
| Font | Inter, self-hosted (SIL Open Font License) |

No framework, no bundler, no package manager, no build step.

## Getting started

Join uses ES modules. Browsers do not load them from `file://`, so the project has to be opened through a local web server.

1. Download or clone the repository.
2. Start a local web server in the project folder, for example:
   - VS Code extension **Live Server**: right-click `index.html` → *Open with Live Server*
   - or in a terminal: `python3 -m http.server 8000`, then open `http://localhost:8000`
3. Sign up with test data or click **Guest Log in**.

An internet connection is required, because the Firebase SDK is loaded from the CDN and all data is stored in Firestore.

### Using your own Firebase project (optional)

1. Create a Firebase project with Cloud Firestore and enable the *Anonymous* sign-in provider in Authentication.
2. Replace the config in `src/scripts/data/joinDbConfig.js` with the config of your project.
3. Make sure the Firestore Security Rules allow reads and writes for signed-in (anonymous) users.
4. For the guest log in, create a document in the `users` collection with `name` and the `email` `guest@guestmail.com`.

## Data and storage

### Firestore

```
users/{userId}                        name, email, password
users/{userId}/tasks/{taskId}         task data
users/{userId}/contacts/{contactId}   contact data
```

Every user has an own `tasks` and an own `contacts` subcollection, so tasks and contacts are stored per user.

### Task model

| Field | Values |
| --- | --- |
| `title` | text |
| `description` | text |
| `dueDate` | `YYYY-MM-DD` |
| `priority` | `urgent`, `medium`, `low` |
| `assignedTo` | list of contacts (`id`, `name`) |
| `category` | `User Story`, `Technical Task` |
| `subtasks` | list of `{ title, done }` |
| `status` | `todo`, `inProgress`, `awaitFeedback`, `done` |
| `order` | position in the column (optional) |

### Contact model

| Field | Values |
| --- | --- |
| `name` | text |
| `email` | text |
| `phone` | text |
| `color` | color class of the initials avatar |

### sessionStorage

`sessionStorage` is used as a cache for faster rendering. Firestore stays the source of the data.

- Logged-in user (`id`, `name`, `email`, guest flag)
- Cached tasks and contacts
- Time of the last activity for the session timeout

All entries are removed at log out and when another user logs in. `localStorage` is not used.

## Project structure

```
Join/
├── index.html              Log in page (entry point)
├── style.css               Base styles of the log in and sign up pages
├── scripts.js              Shared helpers: link buttons, password toggle, loading screen
├── docs/
│   └── SECURITY.md         Security notice, known vulnerabilities, full-stack approach
├── assets/
│   ├── fonts/              Inter variable font and license
│   ├── icons/              SVG icons
│   └── images/
└── src/
    ├── statics/            Pages: summary, board, addTask, contacts, help,
    │                       legalNotice, privacyPolicy, signUpPage
    ├── styles/             One stylesheet per page or component
    └── scripts/
        ├── data/           Firebase config and APIs, models, storage, current user
        ├── templates/      Functions that return HTML
        └── *.js            Logic of the pages
```

### JavaScript files

| File | Purpose |
| --- | --- |
| `data/joinDbConfig.js` | Firebase initialization (Firestore, anonymous sign-in) |
| `data/joinDbApi.js` | Task API: save, load, update, delete, tutorial task |
| `data/usersDbApi.js` | User API: register, find by email |
| `data/contactsDbApi.js` | Contact API: load, save, delete |
| `data/taskModel.js`, `data/usersModel.js`, `data/contactModel.js` | Data models |
| `data/tutorialTask.js` | Tutorial task for new users |
| `data/currentUser.js` | Logged-in user and session data |
| `data/taskStorage.js` | Task cache and queue for Firestore writes |
| `data/contactStorage.js` | Contact cache and Firestore writes |
| `login.js` | Log in and guest log in |
| `authentication.js` | Sign up and validation |
| `pageGuard.js` | Redirect to the log in page if no user is logged in |
| `sessionTimeout.js` | Inactivity timeout with warning |
| `layout.js` | Sidebar, header, header menu, toast messages, escaping of user input |
| `summary.js` | Key metrics and greeting |
| `board.js` | Board rendering, search, move menu |
| `boardDragDrop.js` | Mouse drag and drop with auto scroll |
| `boardTouchSort.js` | Touch sorting on mobile devices |
| `boardTaskDetail.js` | Task detail dialog |
| `boardTaskEdit.js` | Task edit form |
| `addTask.js` | Add task form and custom dropdowns |
| `contact.js` | Contacts page |
| `templates/layoutTemplates.js` | HTML of sidebar, header and session timeout |
| `templates/boardTemplates.js` | HTML of board, cards, dialogs and add task form |

### Stylesheet order

Every page loads `colors.css` → `fonts.css` → `standard.css` first, then its own stylesheets. `colors.css` contains all color variables, `standard.css` imports `rotateHint.css`.

## Code conventions

- No code comments; every function is documented with JSDoc
- Functions have at most 14 lines (HTML templates excluded)
- Functions and variables in English and camelCase
- No inline CSS: styling is done with predefined classes that JavaScript adds or removes (the drag position while a card is dragged on touch devices is set in an own style sheet for the id of the dragged card)
- No inline event handlers: events are registered with `addEventListener`
- Layout mainly with Flexbox
- CSS custom properties only for colors (`colors.css`)

## Security and deliberate limitations

Join is a frontend project. A backend and a real authentication are deliberately not part of it:

- The browser accesses Firestore directly. Anyone can read or change all data via the browser console.
- Passwords are stored in plain text and checked in the browser.
- Log in and page guard run only in the browser.

Implemented in the frontend:

- Page guard and log out that clears the session
- Only `id`, `name` and `email` of the user in `sessionStorage`
- Escaping of user input on all pages (XSS protection)
- Generic log in error messages
- Session timeout after inactivity

[docs/SECURITY.md](docs/SECURITY.md) lists all known vulnerabilities, how they would be solved in a full-stack project and the open frontend tasks.

Further deliberate decisions:

- No frameworks and no build tools; the focus is on vanilla HTML, CSS and JavaScript
- No `localStorage` for personal data
- Join is not intended for real or business use
