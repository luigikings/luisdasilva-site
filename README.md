![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Build](https://img.shields.io/badge/CI-Local%20Scripts-lightgrey?logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-TBD-lightgrey)

# Pixel Interrogatorio – Interactive Portfolio Platform
> An immersive, pixel-art interview experience showcasing Luis Ángel Jose Da Silva (LK) and collecting audience engagement metrics.

## 🚀 Features
- Conversational pixel-art walkthrough that guides visitors through LK's story, projects, and personality.
- Real-time question tracking with analytics for clicks, popularity, and user-generated suggestions.
- Admin dashboard with JWT-secured login to approve or reject community suggestions.
- Built-in rate limiting and validation to keep feedback high-quality and spam-free.
- Fully typed full-stack codebase with shared contracts between client and server.

## 🧠 Tech Stack
- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) + ![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white) + ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white) on the frontend.
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white) and Framer Motion for visuals and interactions.
- ![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white) API backed by ![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white) and ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white).
- PostgreSQL persistence with automatic schema bootstrapping.
- Zod-powered validation, JWT auth, bcrypt hashing, and rate limiting middleware.

## 🗂️ Project Structure
```text
luisdasilva-site/
├── frontend/
│   ├── public/            # Static assets (CV, sitemap, robots.txt, etc.)
│   ├── src/
│   │   ├── components/    # Pixel-art scenes and UI blocks
│   │   ├── data/          # Narrative copy and portfolio data
│   │   ├── hooks/         # Custom hooks including translation helpers
│   │   ├── i18n/          # Dictionaries powering the bilingual experience
│   │   ├── lib/           # Client utilities (analytics tracker, helpers)
│   │   ├── pages/         # Routed views and admin dashboard
│   │   ├── services/      # API client functions
│   │   └── types/         # Shared frontend contracts
│   └── package.json       # Frontend scripts and dependencies
├── backend/
│   ├── src/
│   │   ├── middleware/    # Authentication, rate limiting, error handling
│   │   ├── routes/        # Public, auth, and admin Express routers
│   │   ├── services/      # Business logic & database access layers
│   │   ├── types/         # Backend DTOs and schema helpers
│   │   ├── utils/         # Validation schemas and helper utilities
│   │   ├── app.ts         # Express app factory
│   │   ├── db.ts          # PostgreSQL pool + migrations
│   │   ├── env.ts         # Environment configuration & validation
│   │   └── index.ts       # Server entrypoint
│   └── package.json       # Backend scripts and dependencies
└── README.md              # Project documentation (this file)
```

## ⚙️ Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/luisdasilva-site.git
   cd luisdasilva-site
   ```
2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```
4. **Seed the database schema (PostgreSQL)**
   ```bash
   cd backend
   # ensure backend/.env exists with the variables described below
   npm run migrate
   cd ..
   ```

> **Prerequisites:** Node.js ≥ 18, npm ≥ 9, and access to a PostgreSQL database.

## 🔑 Environment Variables
Create `.env` files in both workspaces. Examples below use placeholder values—replace them with secrets for your environment.

### Backend (`backend/.env`)
```env
DATABASE_URL=postgres://user:password@localhost:5432/pixel_interrogatorio
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2a$10$...
JWT_SECRET=use-a-long-random-string
PORT=3000
SUGGESTION_RATE_LIMIT_WINDOW_MINUTES=15
SUGGESTION_RATE_LIMIT_MAX=5
```
- `DATABASE_URL` *(required)* – PostgreSQL connection string.
- `ADMIN_EMAIL` *(required)* – Username for the admin dashboard.
- `ADMIN_PASSWORD_HASH` *(required)* – Bcrypt hash matching the admin password.
- `JWT_SECRET` *(required)* – Random string (≥ 16 chars) used to sign tokens.
- `PORT` *(optional)* – API port override; defaults to `3000` locally.
- `SUGGESTION_RATE_LIMIT_WINDOW_MINUTES` *(optional)* – Window size for rate limiting.
- `SUGGESTION_RATE_LIMIT_MAX` *(optional)* – Max submissions allowed per window.

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
- `VITE_API_BASE_URL` – URL pointing to the running backend (proxied via `/api` in dev).

## 🧪 Usage
Run the API and client in separate terminals after configuring environment variables.

```bash
# Terminal 1 – backend
cd backend
npm run dev

# Terminal 2 – frontend
cd frontend
npm run dev
```

- The backend starts on `http://localhost:3000` and exposes REST endpoints under `/api`.
- The frontend Vite dev server runs on `http://localhost:5173` and proxies API calls to the backend during development.
- To build for production:
  ```bash
  # Frontend
  cd frontend
  npm run build

  # Backend
  cd backend
  npm run build
  npm run start
  ```

## 🛠️ Deployment
### Deploy the API (Render / Railway / Fly.io)
1. Set the project root to `backend/` when configuring the service.
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm run start`
4. Provide all backend environment variables and, if required by your host, leave `PORT` unset so the platform-injected value is used automatically.
5. Ensure your PostgreSQL instance is reachable from the hosting provider and rerun `npm run migrate` after deploys if schema changes.

### Deploy the Frontend (Vercel / Netlify / GitHub Pages)
1. Import the repo and select the `frontend/` directory.
2. **Install command:** `npm install`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Set `VITE_API_BASE_URL=https://<your-api-domain>/api`.
6. Trigger a deploy and verify API calls succeed from the hosted URL.

> Tip: If both services share a domain, configure CORS or a reverse proxy accordingly.

## 📊 API Endpoints
Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/questions` | Retrieve active questions displayed on the site. |
| `POST` | `/questions/:id/click` | Increment the click counter for a question. |
| `POST` | `/questions/track` | Track usage of a question without incrementing clicks. |
| `POST` | `/suggestions` | Submit a new question suggestion (rate-limited). |
| `POST` | `/analytics/events` | Track a custom analytics event (e.g., section viewed). |
| `GET` | `/metrics` | Aggregate stats for clicks, categories, and suggestions. |
| `POST` | `/auth/login` | Authenticate admin credentials and receive a JWT. |
| `GET` | `/admin/questions` | List all questions (requires `Authorization: Bearer <token>`). |
| `GET` | `/admin/questions/top` | Fetch top questions by click count (optional `limit` query). |
| `GET` | `/admin/suggestions` | List suggestions filtered by status (pending/approved/rejected). |
| `POST` | `/admin/suggestions/:id/approve` | Approve a suggestion and publish it as a question. |
| `POST` | `/admin/suggestions/:id/reject` | Reject a suggestion without deleting it. |
| `DELETE` | `/admin/suggestions/:id` | Permanently remove a suggestion. |

### Example: Admin login and listing questions
```bash
# Authenticate and store the JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"super-secure"}'
```
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```
```bash
# Use the token to access admin-only routes
curl http://localhost:3000/api/admin/questions \
  -H "Authorization: Bearer <token>"
```

## 🧑‍💻 Author
- **Luis Ángel Jose Da Silva (LK)**
- [GitHub](https://github.com/luisdasilvadev)
- [LinkedIn](https://www.linkedin.com/in/luisdasilvadev/)

## 🌟 Contributing
Contributions and feature ideas are welcome! Please fork the repository, open an issue to discuss significant changes, and submit a pull request with a clear description and test coverage when applicable.

## 📄 License
License to be determined. Until a license is added, all rights remain reserved by the author.
