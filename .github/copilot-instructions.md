# Copilot Instructions for BuildStoreNET

## Overview
BuildStoreNET is a simple marketplace web application with a clear separation between frontend and backend. The project is designed for educational purposes and uses a minimal stack for rapid prototyping.

## Architecture
- **Frontend** (`frontend/`): Static HTML pages (`index.html`, `add.html`, `auth.html`, `dashboard.html`, `listings.html`) styled with CSS (`css/styles.css`). Images are stored in `img/`. No frontend framework is used; vanilla JS is embedded in HTML files.
- **Backend** (`backend/server.js`): Node.js/Express server providing a REST API for listings. The backend is minimal and may require manual extension for new features.
- **Entry Point**: The main page is `index.html` in the root directory, which loads styles and scripts from `frontend/`.

## Data Flow
- Listings are fetched from the backend via REST API (`/api/listings`).
- Search queries are sent as GET parameters (e.g., `/api/listings?q=cement`).
- Frontend JS updates the DOM with received data.

## Developer Workflows
- **Start Backend**: Run `node backend/server.js` from the project root.
- **Edit Frontend**: Modify HTML/CSS/JS in `frontend/`. No build step required.
- **Debug**: Use browser dev tools for frontend; console logs for backend.
- **No Automated Tests**: Manual testing only.

## Project Conventions
- **Mobile-first CSS**: All styles in `styles.css` start with mobile defaults, then use media queries for desktop.
- **Class Naming**: BEM-like, but not strict. E.g., `.search-bar`, `.category`, `.btn.secondary`.
- **No Frameworks**: Pure HTML/CSS/JS. Avoid React, Vue, etc.
- **API Endpoints**: All backend endpoints are under `/api/`.
- **Static Assets**: Use relative paths for images and CSS.

## Integration Points
- **Frontend/Backend**: Communicate via fetch API to `http://localhost:4000/api/...`.
- **No Database**: Listings are likely stored in-memory or in a simple file (check `server.js`).

## Examples
- To add a new page, create an HTML file in `frontend/` and link it from `index.html` or navigation.
- To add a new API endpoint, extend `backend/server.js` and update frontend fetch calls.
- To style a new component, add CSS to `frontend/css/styles.css` using mobile-first approach.

## Key Files
- `index.html`: Main entry point and homepage.
- `frontend/css/styles.css`: All global and component styles.
- `backend/server.js`: REST API logic.

## Notes
- No build tools, package managers, or test runners are present.
- Keep all code readable and simple for educational clarity.
- Document new features and endpoints in comments within relevant files.

---
_Last updated: 2025-10-06_
