# Pixel Interrogatorio

An immersive, neon-arcade pixel-art portfolio for **Luis Ángel Jose Da Silva (LK)**. Visitors pick a language on an arcade title screen, sit through a clickable boot sequence, knock on a door that swings open to reveal Luis, then spend coins to ask questions across five "worlds" — with 8-bit sound effects, particle bursts, flying coins, achievements, confetti and a hidden Konami code. All in Spanish or English.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 with a custom neon-arcade theme |
| Effects | Canvas particle engine + Web Audio 8-bit synth (no assets) |
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
│   │   ├── cv-luis-dasilva-en.pdf        # English CV (Spanish CV falls back to this file until cv-luis-dasilva-es.pdf is provided)
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── imgs/
│   │       ├── languages/                  # Flag images (lang_en.png, lang_es.png)
│   │       └── main_caracter/              # Character sprites (still + talking)
│   ├── src/
│   │   ├── components/
│   │   │   ├── fx/                         # Visual effects shared by every screen
│   │   │   │   ├── ArcadeBackground.tsx    # Parallax starfield, synthwave sun/grid, CRT overlay
│   │   │   │   ├── CursorFx.tsx            # Cursor glow, pixel trail and click bursts
│   │   │   │   ├── FxProvider.tsx          # Particle canvas + useFx() (burst, confetti, coins, shake)
│   │   │   │   ├── PixelCoin.tsx           # Crisp SVG pixel coin
│   │   │   │   └── TiltCard.tsx            # 3D tilt + glare card button
│   │   │   ├── interview/                  # Sub-components used only by Interview.tsx
│   │   │   │   ├── AchievementToasts.tsx   # "Achievement unlocked" toasts
│   │   │   │   ├── HudBar.tsx              # Player level/XP, coin counter, infinite switch
│   │   │   │   ├── ConversationPanel.tsx   # Character avatar + speech bubbles
│   │   │   │   └── InterviewNav.tsx        # Category and question selection grids
│   │   │   ├── DoorScene.tsx               # Night street, knocking door that opens in 3D
│   │   │   ├── Interview.tsx               # Interview state machine + coin logic
│   │   │   ├── LanguageIntroScreen.tsx     # Language picker (first screen)
│   │   │   ├── LanguageSwitcher.tsx        # Fixed top-right ES/EN toggle + sound toggle
│   │   │   ├── LoadingScreen.tsx           # Boot terminal + segmented bar (click to boost)
│   │   │   ├── Modal.tsx                   # Accessible focus-trapped modal
│   │   │   └── SuggestionPrompt.tsx        # Visitor question suggestion form
│   │   ├── data/
│   │   │   ├── dialogs.ts                  # Door-knocking lines (ES + EN)
│   │   │   └── interview.ts                # Question config, costs, and URL constants
│   │   ├── hooks/
│   │   │   ├── useKonami.ts                # ↑↑↓↓←→←→BA easter egg
│   │   │   ├── useSound.ts                 # React binding for the sound engine
│   │   │   └── useT.tsx                    # i18n context + dot-path translation hook
│   │   ├── i18n/
│   │   │   └── dict.ts                     # Full bilingual dictionary (ES + EN)
│   │   ├── lib/
│   │   │   ├── analytics.ts                # Analytics stub (ready for Plausible/Umami)
│   │   │   ├── api.ts                      # Typed fetch wrapper + API calls
│   │   │   └── sound.ts                    # Web Audio 8-bit sound effects (mute persisted)
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

Recruiters arriving with the silent deep-link `?go=interview` skip straight to the interview in Spanish (entry notice and normal tutorial included); any address without that exact parameter keeps the full Language → Loading → Door → Interview flow unchanged. Example: `https://your-domain.com/?go=interview`.

## RNF-3 — Guía de uso

Este documento documenta cuatro temas clave afectantes al uso del portfolio:

1. **Salto al contenido**: El visitante puede saltar al contenido principal de cualquier vista usando Tab y Enter, sin saltar vistas. El foco se mueve al contenido principal de la vista activa.

2. **Deep-link silencioso**: La URL `?go=interview` permite a los reclutadores saltar directamente a la entrevista en español, sin pasar por el idioma y las vistas de carga y puerta. La dirección canónica es `https://luisdasilva-site.vercel.app/`.

3. **Idioma declarado inicial**: La página declara español (`lang="es"`) como idioma desde la primera carga. El atributo de idioma se propaga cuando el visitante cambia entre español e inglés.

4. **Vista previa del enlace**: Al compartir la dirección `https://luisdasilva-site.vercel.app/`, la tarjeta de vista previa muestra título, descripción e imagen fijos en español con la dirección canónica. Las metas og: y twitter: son únicas en español y no conmutan por idioma (los rastreadores no ejecutan guiones).

The interview answers the questions recruiters actually ask, in Spanish and English: who Luis is (recent DAW graduate, full stack profile — React, TypeScript and TailwindCSS on the frontend, Node.js on the backend, MySQL/MariaDB/MongoDB for data, Git/Docker/Linux as tools), three projects with verifiable links that open in a new tab ([AgencyMac](https://github.com/luigikings/AgencyMac) — marketing agency site in TypeScript, .NET and Tailwind; [MetalRenova](https://github.com/luigikings/ChatarreroMetalRenova) — scrapyard site in Astro; [Magnar WarGames](https://www.magnarwargames.com/) — live demo only, no code link), what he is learning lately (interface animation and applied accessibility, both applied in this portfolio), and how to reach him: [luigidasilv@gmail.com](mailto:luigidasilv@gmail.com) as a `mailto:` link with the address always visible and copyable, plus a button opening [github.com/luigikings](https://github.com/luigikings) in a new tab. The CV downloads per language (`cv-luis-dasilva-en.pdf` / `cv-luis-dasilva-es.pdf`): while the Spanish file does not exist yet, Spanish visitors get the English file with a non-blocking notice instead of an error.

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
EMAIL_FROM=noreply@yourdomain.com
SUGGESTION_EMAIL_TO=your@email.com

# Backend — server
PORT=3000
CORS_ORIGINS=http://localhost:5173,https://luisdasilva-site.vercel.app

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
| `EMAIL_FROM` | Optional* | Sender address shown in outgoing emails. Bare address only (e.g. `noreply@yourdomain.com`); `Name <mail>` or multiple addresses are invalid and fail startup. Defaults to `LuisDaSilvaDev <noreply@luisdasilvadev.com>` when absent or blank. |
| `SUGGESTION_EMAIL_TO` | **Required** | Recipient address for suggestion and door-entry notifications. |
| `CORS_ORIGINS` | Optional | Comma-separated list of allowed browser origins. Defaults to `http://localhost:5173` and `https://luisdasilva-site.vercel.app` when absent or empty. |
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

## Backend limits (anti-spam)

The backend protects the owner's inbox and email-send budget with these guards. The `201` response shape (`{emailSent, error}`) is unchanged; the only new statuses are `429` (rate) and `413` (oversized body).

- **Size caps** — suggestion `text` is trimmed and must be 8–1000 chars; `category` is optional, trimmed, max 100 chars. Over the cap → `400` with no send attempt; exactly 1000/100 is valid (inclusive). The form shows live `x/1000` and `x/100` counters and blocks the request client-side with a message in the active language.
- **Rate limit** — max 10 `POST` requests per minute per IP, shared across both `/api/suggestions` and `/api/door-entry` (sliding 60 s window, in-memory only, never logged). The 11th request gets `429` JSON `{error}` in Spanish with no send attempt. Health checks, preflights, unknown routes and malformed/oversized bodies don't count. Order per request: body parser (`400` malformed / `413` oversized) → rate limit (`429`) → size validation (`400`).
- **CORS** — only origins in `CORS_ORIGINS` get CORS headers (no credentials; methods `GET, POST, OPTIONS`; header `Content-Type`). Requests without `Origin` or with `Origin: null` (curl, server-to-server) are allowed without CORS headers; disallowed origins get the same status but no CORS headers. Each list entry is trimmed, lowercased, stripped of trailing slash, port respected; empty/invalid entries are ignored and subdomains must match exactly.
- **Sender** — `EMAIL_FROM` accepts only a bare address (`Name <mail>` or lists are invalid and fail startup with a non-zero exit). Absent or blank → built-in default sender.
- **Send timeout** — an email attempt reaching 10 s degrades to `201` with `emailSent: false` and a generic Spanish message; a late provider response is ignored, with no retries. No send failure ever produces `500`.

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

**Luis Ángel Jose Da Silva (LK)** — recent Web Application Development (DAW) graduate, full stack developer (React, TypeScript, TailwindCSS · Node.js · MySQL/MariaDB/MongoDB · Git/Docker/Linux).
- Contact: [luigidasilv@gmail.com](mailto:luigidasilv@gmail.com)
- GitHub: [github.com/luigikings](https://github.com/luigikings)
- Featured projects: [AgencyMac](https://github.com/luigikings/AgencyMac) · [MetalRenova](https://github.com/luigikings/ChatarreroMetalRenova) · [Magnar WarGames (live demo)](https://www.magnarwargames.com/)
- CV: `frontend/public/cv-luis-dasilva-en.pdf` (Spanish `cv-luis-dasilva-es.pdf` falls back to the English file with a notice until provided)
- Portfolio: this site
