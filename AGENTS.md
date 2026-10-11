# AGENTS.md — luisdasilva-site (Pixel Interrogatorio)
Portfolio personal de Luis Ángel Jose Da Silva para aplicar a puestos. Objetivo v1: suavizar el arcade actual para que sea más profesional y directo para reclutadores.

## Stack y estructura
- Frontend: React 18 + Vite + TypeScript 5.5 strict + Tailwind 3 + Framer Motion 12 + React Router 7. Backend: Express 4 + Zod + Resend + tsx.
- `frontend/src/`: `components/` (fx/, interview/, DoorScene, Interview...), `pages/InterviewExperience.tsx` (máquina Language→Loading→Door→Interview), `i18n/dict.ts`, `data/`, `hooks/`, `lib/`.
- `backend/src/`: `app.ts` (factory Express), `env.ts` (Zod), `index.ts`, `services/suggestionEmailService.ts`.
- Deploy: frontend Vercel (`frontend/`), backend Render/Railway/Fly (`backend/`). `frontend/public/` tiene CVs, robots.txt, sitemap.xml, imgs/.

## Comandos
- Arrancar: `cd backend && npm run dev` (3000) + `cd frontend && npm run dev` (5173, proxea /api a 3000).
- Tests: pendiente (no hay script test). Verificación manual + build.
- Lint / build: `cd frontend && npm run lint` / `npm run format`; build front `npm run build` (tsc && vite build); build back `npm run build` + `npm run start`.

## Convenciones
- Código y comentarios en inglés, interfaz bilingüe ES/EN. TS strict, ESLint + Prettier.

## Reglas de dominio / trampas conocidas
- `VITE_API_URL` se lee en build-time; en dev Vite proxea `/api` a localhost:3000.
- Sin `RESEND_API_KEY` el backend arranca igual y responde 201 con `emailSent:false`. `SUGGESTION_EMAIL_TO` es requerido.
- Flujo en `InterviewExperience.tsx`: sin atajos, respetar orden Language→Loading→Door→Interview.

## SDD
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.
- Funcionalidades nuevas: flujo SDD (agente coordinator o comandos /sdd-*). Cambios pequeños: /feature.
- El usuario aprueba la spec y el plan con tareas. Lo demás avanza solo y se para si algo falla o falta una decisión.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Actualízalo al cerrar cada spec, o antes si aparece una decisión importante o un error a evitar: estado actual, decisiones (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md`.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites
- ✅ Siempre: verificación manual del flujo + build en verde; actualizar `MEMORY.md` al cerrar cada spec.
- ⚠️ Pregunta antes: dependencias nuevas, cambios en el formato de los datos guardados, añadir BBDD o cambiar deploy.
- 🚫 Nunca: subir claves, tokens o archivos .env; endurecer fricción arcade (puerta/monedas/boot) sin spec aprobada.

## Verificación
- Arrancar back+front, probar ES/EN → puerta → entrevista → sugerencia; `npm run build` en frontend y backend sin errores.
