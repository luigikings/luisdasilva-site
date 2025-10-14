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
4. **Start the Vite dev server**.
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser to explore the experience.

Additional scripts:
- `npm run build` – compile the production-ready bundle in `dist/`.
- `npm run preview` – serve the production build locally.
- `npm run lint` – run ESLint with the project configuration.
- `npm run format` – format all files with Prettier.
- `npm run server` – launch the Express API with live TypeScript execution.
- `npm run build:server` – compile the backend into `dist/server`.

## 🛠️ Tech Stack
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for the retro-inspired styling layer
- [Framer Motion](https://www.framer.com/motion/) for smooth transitions and animated scenes
- Lightweight, hand-rolled i18n layer with localStorage persistence

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

The project now ships with an opinionated Express + SQLite backend located in `src/server/`. It tracks question clicks, stores user-submitted suggestions, and powers an authenticated admin dashboard.

### 1. Configure environment variables

Copy `.env.example` into `.env` and fill in the admin credentials:

```bash
cp .env.example .env
# Generate a bcrypt hash for your password (replace `your-password`)
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
# Update ADMIN_PASSWORD_HASH and JWT_SECRET with secure values
```

### 2. Run the API locally

```bash
npm install
npm run server
```

The server boots on `http://localhost:3000` by default. A shared health check lives at `/health`.

### 3. REST endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/questions` | Public list of active questions with click counters. |
| `POST` | `/api/questions/:id/click` | Increments the click counter for a question. |
| `POST` | `/api/suggestions` | Stores a visitor suggestion (with rate limiting and validation). |
| `GET` | `/api/metrics` | Returns totals (clicks, clicks per categoría, suggestions, top questions). |
| `POST` | `/api/auth/login` | Exchanges admin credentials for a JWT. |
| `GET` | `/api/admin/questions` | Lists every question (requires `Authorization: Bearer <token>`). |
| `GET` | `/api/admin/questions/top` | Returns the most clicked questions (configurable limit). |
| `GET` | `/api/admin/suggestions` | Lists suggestions, optionally filtered by status. |
| `POST` | `/api/admin/suggestions/:id/approve` | Approves a suggestion and publishes it as an active question. |
| `POST` | `/api/admin/suggestions/:id/reject` | Rejects a suggestion. |

SQLite files are stored in `data/app.db` by default, making the project portable to services like Vercel, Render, or Railway.

## 👨‍💻 Author & License
- **Author:** Luis Ángel Jose Da Silva (LK)
- **License:** Not specified. All rights reserved unless a license is added.
