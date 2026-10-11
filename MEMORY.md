# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001–007 implementadas. 007 (accesibilidad y cierre) cerrada con VEREDICTO: APROBADO tras 2 vueltas del reviewer.
- Lint front y builds front+back en verde; 7/7 lógica resolveCv.
- T9 (re-medición de la 001) queda parcial: protocolo pendiente explícito del dueño.
- Cambios de 006 y 007 sin commit ni push aún.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo para reclutadores; sin LinkedIn, solo correo + GitHub.
- Deep-link `?go=interview` silencioso (sin botón/pista; la guía pública sí lo documenta), ES por defecto, HUD solo en deep-link: no romper el arcade.
- CV ES pendiente → fallback EN con aviso no bloqueante; tono profesional con carisma.
- Backend (002/005/006): 201 de forma fija `{emailSent, error}` con `error null ⟺ emailSent true`; destinatario obligatorio con fail-fast, solo la clave degrada; detalle técnico nunca visible; degradado reutiliza presentación de éxito con literal exacto ES/EN.
- 006: ritmo compartido por IP en ambos endpoints; CORS por defecto localhost:5173 + vercel.app; FROM ausente→defecto, inválido→fail-fast; timeout 10 s con 201 degradado; 429 en ES.
- Criterio de cierre = verificación manual + build (sin tests): base pequeña. Matriz visual 004 y bandeja real 006 pendientes, aceptadas por el dueño.
- 007 (2026-10-12): metas fijas en ES y canónica `https://luisdasilva-site.vercel.app/`, porque los rastreadores no ejecutan guiones.
- 007: og-image.png 1200x630 sin texto (145 243 bytes) generada con script Node puro sin deps; el SVG no vale para rastreadores sociales.
- 007: carga 3,11–3,29 s frente al límite de 3 s de la 001: aceptada por escrito como incumplimiento menor.
- 007: pie RF-3 aceptado tal cual; tutorial modal es excepción a RF-12.
- 007: contraste medido con script propio (195 combinaciones, 0 no-pasa); DevTools/axe pendiente del dueño. Lector NVDA/VoiceOver pendiente.
- 007: la barra rápida del reclutador es `role="group"`, no un segundo `nav`.

## Aprendizajes y errores a evitar
- entryMode pura con split crudo (sin URLSearchParams) por `go=%69nterview`: comparación exacta.
- useT ES síncrono con deep-link (evita flash) + submitLang congelado.
- suggestionOutcome pura (solo `emailSent` decide) + ApiError→errorMessage normalizado.
- Resend: instanciar en diferido; v4+ devuelve `{data, error}`, no lanza. Env con preprocess `""`=ausente.
- 006: helpers puros (`escapeEmailHtml`, `normalizeOrigins`, `isRateLimited`, `sendWithTimeout`); rate-limit con split crudo; 413 = default Express 100kb.
- Windows: usar `npm.cmd` (npm.ps1 bloqueado); en PowerShell/curl las comillas fallan → cuerpos en fichero.
- No fabricar mediciones en audit: solo valores medidos o "pendiente".
- Enter sobre "Saltar al contenido" avanzaba la pantalla de idioma (atajo global de Enter). Arreglado con `frontend/src/lib/enterShortcut.ts` (`canEnterShortcutAct`).
- No marcar tareas [x] sin cumplir su "Hecho cuando": T6/T7 se marcaron con SVG relativo y hubo que reabrirlas.
- `frontend/src/lib/api.ts` ya añade `/api`: en dev no pongas `VITE_API_URL=/api` (daría `/api/api`); sin `VITE_API_URL` la página queda en blanco. Usa `http://localhost:5173`.
- Propuesta para AGENTS.md (no aplicada): aclarar lo anterior, pues AGENTS.md dice que en dev Vite proxea /api.

## Próximos pasos (del dueño)
- Commit de la 007 y push si quiere (también la 006).
- Desplegar y comprobar `curl -I https://luisdasilva-site.vercel.app/og-image.png` (200) y validar la tarjeta de vista previa.
- Pasada manual en su navegador: ES/EN, 375 px, teclado EN y contacto, movimiento reducido.
- Escucha G1–G12; hueco de ≈1 s al montar la entrevista en ES de escritorio.
- Foco que cae a body tras activar mundo/pregunta/sugerencia.
- Lector de pantalla y DevTools/axe.
