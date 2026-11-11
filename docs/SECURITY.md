## Security Notice

Join is a **frontend learning project** (HTML, CSS, JavaScript), not a full-stack application. Data security is not the focus of this project, but we are aware of the following vulnerabilities.

> **Please do not use a real password when signing up.** Use test data only.

### Known vulnerabilities
- The browser accesses the Firebase database directly. Anyone can read or modify all data via the browser console.
- User passwords are stored in plain text and compared in the browser.
- The login and page guard run only in the browser and can be bypassed by editing `sessionStorage`.
- The Firebase config in `joinDbConfig.js` is public by design. It identifies the project and is not a secret.

### What we do in the frontend
- Page guard and logout that clears the session
- Only `id`, `name` and `email` stored in `sessionStorage`
- User input escaped before rendering on the board (XSS protection)
- Generic login error messages

### How we would fix it in a full-stack project
- **Authentication:** Firebase Authentication or a custom server. Passwords hashed server-side (Argon2id/bcrypt), never stored in plain text.
- **Authorization:** Firestore Security Rules or server-side checks on every request. The browser never accesses the database directly.
- **Sessions:** `HttpOnly`, `Secure`, `SameSite` cookies, invalidated on the server at logout.
- **API responses:** only the fields the client needs, never passwords or hashes.
- **Additional protection:** server-side validation, login rate limiting, CSRF protection, HTTPS and security headers (CSP, HSTS).

### Open frontend tasks
- Move `makeTextSafe` to a shared file and use it on all pages
- Escape `data-task-id` in board templates
- Replace remaining inline event handlers (`onclick`, `onload`, `onmousedown`) with `addEventListener`
- Add a Content Security Policy once inline handlers are removed
- Remove `ApiTests.js` from the release version
