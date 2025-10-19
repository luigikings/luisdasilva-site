# Pixel Interrogatorio

> An interactive pixel-art interview experience that doubles as the online portfolio for **Luis Ángel Jose Da Silva (LK)**.

## 📁 Repository layout

The project is now split into two standalone apps that live side-by-side in this repository:

- `frontend/` – React + Vite client that renders the interactive experience.
- `backend/` – Express + SQLite API that powers analytics, admin tools and stores visitor feedback.

Each folder has its own `package.json`, lockfile and build tooling, so you can install dependencies, run scripts and deploy each half independently.

## 🚀 Getting started

Clone the repository and install dependencies for both workspaces:

```bash
git clone <repo-url>
cd luisdasilva-site

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### Running the backend locally

1. Create a `.env` file inside `backend/` (see [Environment variables](#-environment-variables)). At minimum you must provide the admin email, the bcrypt hash of the admin password and a JWT secret.
2. Start the API server from the `backend/` directory:
   ```bash
   npm run dev
   ```
3. The Express app listens on [`http://localhost:3000`](http://localhost:3000) by default.

### Running the frontend locally

1. Copy the backend URL into a Vite env variable if you are not using the default proxy (e.g. create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:3000`).
2. Start the Vite dev server from the `frontend/` directory:
   ```bash
   npm run dev
   ```
3. Visit [`http://localhost:5173`](http://localhost:5173) to explore the site. During development the Vite proxy forwards `/api` requests to the local backend automatically.

Additional frontend scripts:
- `npm run build` – type-check and build the production bundle in `frontend/dist/`.
- `npm run preview` – serve the production build locally.
- `npm run lint` – run ESLint with the project configuration.
- `npm run format` – format all files with Prettier.

Additional backend scripts:
- `npm run build` – compile the server into `backend/dist/`.
- `npm run start` – run the compiled server (use after `npm run build`).

## 🔧 Environment variables

Create a `.env` file at `backend/.env` with the following keys:

| Name | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `PORT` | Optional | `3000` | Port used by the Express API. Most hosting providers override this automatically. |
| `DATABASE_FILE` | Optional | `data/app.db` | SQLite file path. Use an absolute path or mount a persistent volume in production. |
| `ADMIN_EMAIL` | **Yes** | — | Email used to log into the admin dashboard. |
| `ADMIN_PASSWORD_HASH` | **Yes** | — | Bcrypt hash for the admin password. Generate one locally with `node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`. |
| `JWT_SECRET` | **Yes** | — | Secret used to sign admin JWT tokens. Use a long, random string (16+ characters). |
| `SUGGESTION_RATE_LIMIT_WINDOW_MINUTES` | Optional | `15` | Rate-limit window (in minutes) for `/api/suggestions`. |
| `SUGGESTION_RATE_LIMIT_MAX` | Optional | `5` | Max submissions per IP within the rate-limit window. |

Frontend-only variables live inside `frontend/.env`. The most important one is:

| Name | Default | Description |
| ---- | ------- | ----------- |
| `VITE_API_BASE_URL` | `/api` | Base URL used by the frontend to reach the API. Override it in production to point at the deployed backend (e.g. `https://api.example.com`). |

Example backend `.env`:

```env
PORT=3000
DATABASE_FILE=data/app.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2a$10$...
JWT_SECRET=use-a-long-random-string
SUGGESTION_RATE_LIMIT_WINDOW_MINUTES=15
SUGGESTION_RATE_LIMIT_MAX=5
```

## 🌍 Deployment

Deploy the apps separately and wire the frontend to the backend URL.

### 1. Deploy the API (Render, Railway, Fly.io, etc.)

1. Set the root directory to `backend/` when configuring the service.
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm run start`
4. **Environment variables:** Provide every key listed above (you may omit `VITE_API_BASE_URL` on the server).
5. **SQLite storage:** Use the default `data/app.db` or change `DATABASE_FILE` to a mounted volume path. Providers like Render and Railway offer persistent disks that keep the database between deploys.
6. **Health check:** Once the service is live, confirm it responds at `https://<your-api>/health`.

> 💡 Tip: if your platform exposes the port via an environment variable (e.g. Render's `PORT`), leave `PORT` unset in `.env` so the server picks it up automatically.

### 2. Deploy the frontend (Vercel, Netlify, GitHub Pages, etc.)

1. Set the root directory to `frontend/` when importing the project.
2. **Install command:** `npm install`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variables:** Set `VITE_API_BASE_URL=https://<your-api-host>` so the browser uses the live API.
6. **Trigger a deploy** and verify the site loads by visiting the generated URL.

If you host both services on the same domain (e.g. `example.com` for the frontend and `api.example.com` for the backend), remember to enable CORS or configure a reverse proxy as needed.

## 🛠️ Tech stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Express, better-sqlite3, Zod, JWT, bcryptjs, dotenv

## 📂 Project structure

```text
luisdasilva-site/
├── backend/
│   ├── data/             # SQLite database files (development convenience only)
│   ├── src/
│   │   ├── middleware/   # Auth guards, rate limiters and error handling
│   │   ├── routes/       # Public + admin Express routers
│   │   ├── services/     # Database access and business logic
│   │   ├── types/        # Shared backend data contracts
│   │   ├── app.ts        # Express app factory
│   │   └── index.ts      # Server entry point
│   └── package.json      # Backend scripts and dependencies
├── frontend/
│   ├── public/           # Static assets such as the downloadable CV, sitemap, robots.txt
│   ├── src/
│   │   ├── components/   # Pixel-inspired scenes (Language intro, Door, Interview, Portfolio grid, etc.)
│   │   ├── data/         # Dialog lines and portfolio entries consumed by the UI
│   │   ├── hooks/        # Custom hooks like the translation helper `useT`
│   │   ├── i18n/         # Dictionary files that power the bilingual experience
│   │   ├── lib/          # Shared frontend utilities such as the analytics tracker
│   │   ├── pages/        # Routed views including the admin dashboard
│   │   ├── services/     # API client helpers
│   │   ├── types/        # Frontend-facing API contracts
│   │   └── App.tsx       # Main application flow controller
│   └── package.json      # Frontend scripts and dependencies
└── README.md
```

## 🧠 Backend API

The Express backend located in `backend/src/` tracks question clicks, stores user-submitted suggestions and powers an authenticated admin dashboard.

### REST endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/questions` | Public list of active questions with click counters. |
| `POST` | `/api/questions/:id/click` | Increments the click counter for a question. |
| `POST` | `/api/suggestions` | Stores a visitor suggestion (with rate limiting and validation). |
| `GET` | `/api/metrics` | Returns totals (clicks, clicks per category, suggestions, top questions). |
| `POST` | `/api/auth/login` | Exchanges admin credentials for a JWT. |
| `GET` | `/api/admin/questions` | Lists every question (requires `Authorization: Bearer <token>`). |
| `GET` | `/api/admin/questions/top` | Returns the most clicked questions (configurable limit). |
| `GET` | `/api/admin/suggestions` | Lists suggestions, optionally filtered by status. |
| `POST` | `/api/admin/suggestions/:id/approve` | Approves a suggestion and publishes it as an active question. |
| `POST` | `/api/admin/suggestions/:id/reject` | Rejects a suggestion. |

SQLite files are stored in `backend/data/app.db` by default, making the project portable to services like Vercel (frontend) plus Render/Railway (backend) or any other platform that supports Node.js.

## 👨‍💻 Author & License
- **Author:** Luis Ángel Jose Da Silva (LK)
- **License:** Not specified. All rights reserved unless a license is added.
