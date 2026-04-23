# Pixel Interrogatorio

An immersive, pixel-art portfolio for **Luis Ángel Jose Da Silva (LK)**. Visitors step through a knocking-door intro scene, pick questions from a gamified category menu, and watch answers type out in a retro interview format — all in Spanish or English.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 with a custom pixel-art theme |
| Animations | Framer Motion 12 |
| Routing | React Router DOM 7 |
| Backend framework | Express 4 on Node.js |
| Email delivery | Resend API |
| Validation | Zod |
| Deployment (frontend) | Vercel |
| Deployment (backend) | Render / Railway / Fly.io |

---

## Project Structure

```
luisdasilva-site/
├── backend/
│   ├── src/
│   │   ├── app.ts                          # Express app factory (routes + error middleware)
│   │   ├── env.ts                          # Zod-validated environment config
│   │   ├── index.ts                        # Server entry point
│   │   └── services/
│   │       └── suggestionEmailService.ts   # Resend email helpers
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── CV Luis Angel Da Silva English.pdf
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── imgs/
│   │       ├── languages/                  # Flag images (lang_en.png, lang_es.png)
│   │       └── main_caracter/              # Character sprites (still + talking)
│   ├── src/
│   │   ├── components/
│   │   │   ├── interview/                  # Sub-components used only by Interview.tsx
│   │   │   │   ├── CoinBar.tsx             # Infinite-coins toggle + remaining display
│   │   │   │   ├── ConversationPanel.tsx   # Character avatar + speech bubbles
│   │   │   │   └── InterviewNav.tsx        # Category and question selection grids
│   │   │   ├── DoorScene.tsx               # Animated knocking-door intro
│   │   │   ├── Interview.tsx               # Interview state machine + coin logic
│   │   │   ├── LanguageIntroScreen.tsx     # Language picker (first screen)
│   │   │   ├── LanguageSwitcher.tsx        # Fixed top-right ES/EN toggle
│   │   │   ├── LoadingScreen.tsx           # Animated progress bar
│   │   │   ├── Modal.tsx                   # Accessible focus-trapped modal
│   │   │   └── SuggestionPrompt.tsx        # Visitor question suggestion form
│   │   ├── data/
│   │   │   ├── dialogs.ts                  # Door-knocking lines (ES + EN)
│   │   │   └── interview.ts                # Question config, costs, and URL constants
│   │   ├── hooks/
│   │   │   └── useT.tsx                    # i18n context + dot-path translation hook
│   │   ├── i18n/
│   │   │   └── dict.ts                     # Full bilingual dictionary (ES + EN)
│   │   ├── lib/
│   │   │   ├── analytics.ts                # Analytics stub (ready for Plausible/Umami)
│   │   │   └── api.ts                      # Typed fetch wrapper + API calls
│   │   ├── pages/
│   │   │   └── InterviewExperience.tsx     # Top-level view state machine
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .env                                    # Environment variables (see below)
└── README.md
```

---

## How It Works

The experience flows through four views managed by `InterviewExperience.tsx`:

1. **Language** — visitor picks Spanish or English
2. **Loading** — a 3.2-second progress bar with a rotating document title
3. **Door** — animated pixel door; character knocks three times before the Enter button appears
4. **Interview** — gamified Q&A with category groups, coin budgets, and character animations

When a visitor enters the interview, the backend receives a `POST /api/door-entry` notification. When a visitor submits a question suggestion, it goes to `POST /api/suggestions` which emails the owner via the Resend API.

---

## Installation

> **Prerequisites:** Node.js ≥ 18, npm ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/luigikings/luisdasilva-site.git
cd luisdasilva-site
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

### 3. Configure environment variables

Copy the example block below into a `.env` file at the **project root** (or set the variables in your host's dashboard for production):

```env
# Backend — email delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Your Name <noreply@yourdomain.com>
SUGGESTION_EMAIL_TO=your@email.com

# Backend — server
PORT=3000

# Frontend (Vite reads this at build time)
VITE_API_URL=http://localhost:3000
```

---

## Running Locally

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

The Vite dev server proxies all `/api` requests to `http://localhost:3000`, so `VITE_API_URL` only needs to point at the backend root.

---

## Building for Production

```bash
# Frontend → outputs to frontend/dist
cd frontend
npm run build

# Backend → outputs to backend/dist
cd backend
npm run build
npm run start
```

---

## Available Scripts

### Frontend (`frontend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check and bundle for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

### Backend (`backend/`)

| Script | Description |
|---|---|
| `npm run dev` | Start with `tsx --watch` (auto-restarts on change) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Optional* | Resend API key. Without it, emails are skipped but the server still starts. |
| `EMAIL_FROM` | Optional* | Sender address shown in outgoing emails. Defaults to `LuisDaSilvaDev <noreply@luisdasilvadev.com>`. |
| `SUGGESTION_EMAIL_TO` | **Required** | Recipient address for suggestion and door-entry notifications. |
| `PORT` | Optional | Backend port. Defaults to `3000`. |
| `VITE_API_URL` | **Required** | Base URL of the backend, read by the frontend at build time. |

*If `RESEND_API_KEY` is absent, the `/api/suggestions` and `/api/door-entry` endpoints still return `201` but with `emailSent: false`.

---

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |
| `POST` | `/api/suggestions` | Submit a question suggestion. Body: `{ text, category?, lang? }` |
| `POST` | `/api/door-entry` | Notify when a visitor enters the interview. Body: `{ lang? }` |

---

## Deployment

### Frontend (Vercel)

1. Import the repository and set the **root directory** to `frontend/`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-domain.com`

A `vercel.json` is already included in `frontend/` to handle SPA routing.

### Backend (Render / Railway / Fly.io)

1. Set the root to `backend/`.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Set all required environment variables in the host's dashboard.

---

## Author

**Luis Ángel Jose Da Silva (LK)**
- GitHub: [github.com/luigikings](https://github.com/luigikings)
- Portfolio: this site
