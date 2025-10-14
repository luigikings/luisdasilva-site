# Pixel Interrogatorio

> An interactive pixel-art interview experience that doubles as the online portfolio for **Luis Ángel Jose Da Silva (LK)**.

## 🚀 Getting Started

1. **Install Node.js 18+** (or use the version specified in your tooling).
2. **Clone the repository** and move into the project folder.
   ```bash
   git clone <repo-url>
   cd luisdasilva-site
   ```
3. **Install dependencies**.
   ```bash
   npm install
   ```
4. **Create a `.env` file** with the server credentials (see [Environment variables](#-environment-variables)). At minimum you must provide the admin email, the bcrypt hash of the admin password, and a JWT secret.
5. **Start the development servers** in two terminals:
   ```bash
   # Terminal 1 – API
   npm run server

   # Terminal 2 – Vite frontend
   npm run dev
   ```
6. Open [http://localhost:5173](http://localhost:5173) in your browser. The frontend proxies `/api` to the local API by default.

Additional scripts:
- `npm run build` – compile the production-ready bundle in `dist/`.
- `npm run preview` – serve the production build locally.
- `npm run lint` – run ESLint with the project configuration.
- `npm run format` – format all files with Prettier.
- `npm run build:server` – compile the backend into `dist/server`.

## 🔧 Environment variables

Create a `.env` file at the project root with the following keys:

| Name | Required | Default | Description |
| ---- | -------- | ------- | ----------- |
| `PORT` | Optional | `3000` | Port used by the Express API. Most hosting providers override this automatically. |
| `DATABASE_FILE` | Optional | `data/app.db` | SQLite file path. Use an absolute path or mount a persistent volume in production. |
| `ADMIN_EMAIL` | **Yes** | — | Email used to log into the admin dashboard. |
| `ADMIN_PASSWORD_HASH` | **Yes** | — | Bcrypt hash for the admin password. Generate one locally with `node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`. |
| `JWT_SECRET` | **Yes** | — | Secret used to sign admin JWT tokens. Use a long, random string (16+ characters). |
| `SUGGESTION_RATE_LIMIT_WINDOW_MINUTES` | Optional | `15` | Rate-limit window (in minutes) for `/api/suggestions`. |
| `SUGGESTION_RATE_LIMIT_MAX` | Optional | `5` | Max submissions per IP within the rate-limit window. |
| `VITE_API_BASE_URL` | Optional | `/api` | Frontend-only var. Override it in production to point at the deployed API (e.g. `https://api.example.com`). |

Example `.env`:

```env
PORT=3000
DATABASE_FILE=data/app.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2a$10$...
JWT_SECRET=use-a-long-random-string
SUGGESTION_RATE_LIMIT_WINDOW_MINUTES=15
SUGGESTION_RATE_LIMIT_MAX=5
```

For local development, the frontend automatically points to `http://localhost:3000` via the `/api` proxy. When deploying, remember to set `VITE_API_BASE_URL` so the client can reach your hosted API.

## 🌍 Deployment

The project is split into a static React frontend and an Express + SQLite API. Deploy them separately and connect the frontend to the API URL.

### 1. Deploy the API (Render, Railway, Fly.io, etc.)

1. **Build command:** `npm install && npm run build:server`
2. **Start command:** `node dist/server/index.js`
3. **Environment variables:** Provide every key listed above (you may omit `VITE_API_BASE_URL` on the server).
4. **SQLite storage:** Use the default `data/app.db` or change `DATABASE_FILE` to a mounted volume path. Providers like Render and Railway offer persistent disks that keep the database between deploys.
5. **Health check:** Once the service is live, confirm it responds at `https://<your-api>/health`.

> 💡 Tip: if your platform exposes the port via an environment variable (e.g. Render's `PORT`), leave `PORT` unset in `.env` so the server picks it up automatically.

### 2. Deploy the frontend (Vercel, Netlify, GitHub Pages, etc.)

1. **Connect the repository** and select the root directory.
2. **Install command:** `npm install`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variables:** Set `VITE_API_BASE_URL=https://<your-api-host>` so the browser uses the live API.
6. **Trigger a deploy** and verify the site loads by visiting the generated URL.

If you host both services on the same domain (e.g. `example.com` for the frontend and `api.example.com` for the backend), remember to enable CORS or configure a reverse proxy as needed.

## 🛠️ Tech Stack
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for the retro-inspired styling layer
- [Framer Motion](https://www.framer.com/motion/) for smooth transitions and animated scenes
- Lightweight, hand-rolled i18n layer with localStorage persistence
- [Express](https://expressjs.com/) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for the analytics and admin API

## 📂 Project Structure
```text
luisdasilva-site/
├── public/             # Static assets such as the downloadable CV, sitemap, and robots.txt
├── src/
│   ├── components/     # Pixel-inspired scenes (Language intro, Door, Interview, Portfolio grid, etc.)
│   ├── data/           # Dialog lines and portfolio entries consumed by the UI
│   ├── hooks/          # Custom hooks like the translation helper `useT`
│   ├── i18n/           # Dictionary files that power the bilingual experience
│   ├── lib/            # Shared utilities such as the analytics tracker
│   ├── pages/          # Routed views including the admin dashboard
│   ├── server/         # Express API source code
│   ├── App.tsx         # Main application flow controller
│   └── index.css       # Tailwind directives and global styles
├── index.html          # Document head metadata and root mounting point
└── vite.config.ts      # Vite + React configuration
```

## 💡 How It Works
- Visitors choose their language, triggering the localized copy defined in [`src/i18n/dict.ts`](src/i18n/dict.ts).
- A playful loading screen and animated door scene (via [`DoorScene`](src/components/DoorScene.tsx)) set the tone before entering the interview.
- The interview flow renders grouped questions, dynamic typing effects, and shareable actions (e.g., open GitHub or download the CV) inside [`Interview`](src/components/Interview.tsx).
- Portfolio items and extra dialog content are driven by easily editable data modules in [`src/data`](src/data).
- Animations respect the user’s motion preferences thanks to `prefers-reduced-motion` checks across components.

## 🧠 Backend API

The Express backend located in `src/server/` tracks question clicks, stores user-submitted suggestions, and powers an authenticated admin dashboard.

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

SQLite files are stored in `data/app.db` by default, making the project portable to services like Vercel (frontend) plus Render/Railway (backend) or any other platform that supports Node.js.

## 👨‍💻 Author & License
- **Author:** Luis Ángel Jose Da Silva (LK)
- **License:** Not specified. All rights reserved unless a license is added.
