# Career Counseling Platform

A full-stack web application connecting students with mentors for career guidance. Features real-time chat, job search, career quizzes, and YouTube video recommendations.

**Live:** [h4rsh-vishwakarma.github.io/career-counseling](https://h4rsh-vishwakarma.github.io/career-counseling/frontend/index.html) | **Backend:** [career-counseling-backend.onrender.com](https://career-counseling-backend.onrender.com)

---

## Features

| Feature | Status | Notes |
|---|---|---|
| Student & Mentor Registration | ✅ Working | Resume upload (PDF/DOC), role-based routing |
| Login / JWT Auth | ✅ Working | Token stored in localStorage, rate-limited |
| Student Mentorship | ✅ Working | Browse sessions, request mentorship |
| Mentor Dashboard | ✅ Working | Create/delete sessions, accept/reject requests |
| Job Search | ✅ Working | JSearch API via RapidAPI, save applications to DB |
| Career Quizzes | ✅ Working | OpenTDB questions, scores saved to DB |
| Real-time Chat | ✅ Working | Socket.io, online presence tracking |
| YouTube Recommendations | ✅ Working | Proxied through backend (key not exposed) |
| Profile / Dashboard | ✅ Working | Upload profile pic, resume, track progress |
| Edit Profile | ✅ Working | Update name, email, skills, education |

---

## Tech Stack

**Frontend** — Static HTML/CSS/JS hosted on GitHub Pages  
**Backend** — Node.js + Express.js hosted on Render  
**Database** — MySQL hosted on Railway  
**Real-time** — Socket.io  
**Auth** — JWT (jsonwebtoken) + bcryptjs  
**File uploads** — Multer  

**Key packages:** `express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `multer`, `socket.io`, `express-rate-limit`, `dotenv`, `axios`

---

## Project Structure

```
career-counseling/
├── frontend/               # Static site (GitHub Pages)
│   ├── css/
│   │   ├── global.css      # Design system (variables, components)
│   │   └── *.css           # Page-specific overrides
│   ├── js/
│   │   ├── nav.js          # Hamburger toggle + role-based nav
│   │   ├── login.js        # Auth flow
│   │   ├── register.js     # Registration with file upload
│   │   ├── dashboard.js    # Profile, progress, chart
│   │   ├── jobs.js         # Job search + save application
│   │   ├── chat.js         # Socket.io chat client
│   │   ├── youtube.js      # Video recommendations
│   │   ├── mentorship-student.js
│   │   └── mentorship-mentor.js
│   └── *.html              # 13 pages
└── backend/                # Express API (Render)
    ├── routes/
    │   ├── auth.js         # POST /api/auth/register, /login
    │   ├── user.js         # GET/PUT /api/user/profile
    │   ├── mentorship.js   # Sessions + requests CRUD
    │   ├── jobs.js         # POST /api/jobs/apply, GET /applied
    │   ├── jobAPI.js       # GET /api/jobs (JSearch proxy)
    │   ├── quiz.js         # POST /api/quiz/save-score, GET /my-scores
    │   ├── chatRoutes.js   # GET /api/chat/history
    │   └── youtube.js      # GET /api/youtube/search (YT proxy)
    ├── models/db.js        # MySQL connection pool
    ├── middleware/authMiddleware.js
    ├── schema.sql          # Full database schema
    └── server.js           # Entry point
```

---

## API Reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register (multipart/form-data with optional resume) |
| POST | `/login` | — | Login, returns JWT token |

### User — `/api/user`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile` | JWT | Get current user's profile |
| PUT | `/profile` | JWT | Update name, email, skills, education |
| POST | `/upload-profile-pic` | JWT | Upload profile picture |
| POST | `/upload-resume` | JWT | Upload resume file |

### Mentorship — `/api/mentorship`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/available-sessions` | JWT | List all mentorship sessions |
| POST | `/create-session` | JWT (mentor) | Create a session |
| DELETE | `/delete/:id` | JWT (mentor) | Delete a session |
| POST | `/request` | JWT (student) | Request to join a session |
| GET | `/requests` | JWT (mentor) | List incoming requests |
| PUT | `/requests/:id` | JWT (mentor) | Accept or reject a request |

### Jobs — `/api/jobs`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Search jobs via JSearch API |
| POST | `/apply` | JWT | Save a job application |
| GET | `/applied` | JWT | List user's saved applications |

### Quiz — `/api/quiz`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/save-score` | JWT | Save quiz score |
| GET | `/my-scores` | JWT | Get last 10 scores |

### YouTube — `/api/youtube`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search?query=...` | — | Proxy YouTube Data API v3 search |

### Chat — `/api/chat`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/history` | JWT | Fetch message history |

---

## Environment Variables

Create `backend/.env` (never commit this file):

```env
# Database (Railway MySQL)
DB_HOST=your-railway-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
DB_PORT=3306

# Auth
JWT_SECRET=your-long-random-secret

# APIs
JSEARCH_API_KEY=your-rapidapi-jsearch-key
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
```

---

## Local Development

```bash
# Clone
git clone https://github.com/h4rsh-vishwakarma/career-counseling.git
cd career-counseling

# Backend
cd backend
npm install
cp .env.example .env      # fill in your credentials
npm run dev               # nodemon on port 5000

# Frontend
# Open frontend/ with VS Code Live Server, or any static server
# e.g. npx serve frontend
```

---

## Database Setup

Run `backend/schema.sql` once on your MySQL instance:

```bash
mysql -h your-host -u your-user -p your-database < backend/schema.sql
```

Creates tables: `users`, `mentorship_sessions`, `mentorship_requests`, `mentorship_participants`, `quizzes`, `quiz_submissions`, `messages`, `job_applications`

---

## Deployment

**Backend (Render)**
1. Connect your GitHub repo to Render
2. Set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables as Render environment variables

**Frontend (GitHub Pages)**
1. Go to repo Settings → Pages
2. Source: `master` branch, `/frontend` folder (or root if configured)
3. The site deploys automatically on push

**CORS** — `server.js` is locked to `https://h4rsh-vishwakarma.github.io`. Update `allowedOrigin` if your Pages URL differs.

---

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens expire (configurable via `JWT_SECRET`)
- Auth routes rate-limited: 20 requests per 15 minutes
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- `.env` excluded from git via `.gitignore`
- YouTube and JSearch API keys proxied through backend — never exposed to frontend
- File uploads restricted to `images/*` (profile pic) and `.pdf/.doc/.docx` (resume)

---

## Contact

**Harsh Vishwakarma**  
Email: eng.harshvishwakarma1737@gmail.com  
LinkedIn: [linkedin.com/in/harsh-vishwakarma-1141a128b](http://www.linkedin.com/in/harsh-vishwakarma-1141a128b)
