# Deployment checklist

## Supabase

1. Create a project in the Singapore (or nearest) region.
2. Run `backend/schema.sql` in the SQL Editor.
3. Copy the pooled PostgreSQL connection string into Render as `DATABASE_URL`.

## Render

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Required variables: `DATABASE_URL`, `JWT_SECRET` (32+ characters),
  `CORS_ORIGINS`, and any API keys used by optional integrations.

## GitHub Pages

Deploy only `frontend/`. Its API configuration automatically selects localhost
for local development and the Render backend for the production Pages host.
