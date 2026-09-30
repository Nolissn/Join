# Join

Kanban-style task manager. Vanilla HTML, CSS and JavaScript — no build step.

## Structure

- `index.html` — entry point; stylesheet cascade in `<head>`, deferred scripts at the end
- `src/styles/colors.css` → `src/styles/standard.css` → `style.css` — load order matters
- `src/scripts/template.js` — pure markup builders
- `scripts.js` — state, data loading, rendering, events
- `assets/` — images, icons, fonts
