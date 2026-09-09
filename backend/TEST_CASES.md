# Career Counseling test case design

The API test suite covers 20 contract-level cases plus real Express route integration tests. The integration suite loads `app.js`, exercises the production route handlers with Supertest, and mocks only the PostgreSQL pool so CI remains deterministic without production credentials. A test PostgreSQL/Supabase schema can replace the pool mock for end-to-end database verification.

| Area | Cases |
|---|---|
| Auth | registration success, duplicate email, invalid registration, login success, wrong password, missing JWT, invalid JWT, JWT claims, student role denial, mentor role access |
| Profile | profile retrieval, profile update, empty update, unauthorized profile access |
| Mentorship | session creation, unauthorized creation, request creation, invalid request payload, accept request, reject request |
| Jobs | save application, duplicate application, retrieve applications, invalid job payload |
| Quiz/API | save score, invalid score payload, 404 handling, API error response |
