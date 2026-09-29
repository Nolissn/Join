# Join

Kanban-style task manager. Vanilla HTML, CSS and JavaScript — no build step.

## Structure

- `index.html` — entry point; stylesheet cascade in `<head>`, deferred scripts at the end
- `styles/variables.css` → `styles/standard.css` → `styles/fonts.css` → `styles.css` — load order matters
- `scripts/template.js` — pure markup builders
- `scripts.js` — state, data loading, rendering, events
- `assets/` — images, icons, fonts
