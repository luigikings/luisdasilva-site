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

## 👨‍💻 Author & License
- **Author:** Luis Ángel Jose Da Silva (LK)
- **License:** Not specified. All rights reserved unless a license is added.
