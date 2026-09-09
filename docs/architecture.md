# Career Counseling architecture

`frontend/` is the only deployable static frontend. `docs/` contains architecture
and deployment notes only; it is not a second frontend.

## Runtime

- Frontend: static HTML/CSS/JavaScript on GitHub Pages.
- Backend: Express API and Socket.IO server on Render.
- Database: PostgreSQL hosted by Supabase, connected through `DATABASE_URL`.
- Files: local uploads are suitable only for development. Production should use
  Supabase Storage or another object-storage provider before relying on resumes
  or profile pictures.

## Backend layout

The current API keeps route modules at `backend/routes/` for compatibility while
shared infrastructure lives under `backend/src/`. New modules should be added
under `backend/src/` and routes should remain thin controllers over services.

Database schema is `backend/schema.sql`; apply it once in the Supabase SQL editor.
