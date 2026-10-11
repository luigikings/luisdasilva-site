# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001–007 implementadas. 007 (accesibilidad y cierre) APROBADA tras 2 vueltas del reviewer y reabierta parcialmente por T13 (canónica real); corrección ya aprobada y aplicada.
- 007 desplegada en el sitio real `https://www.luisdasilvadev.com/`; backend Render en vivo (`luisdasilva-site.onrender.com`, servicio único del proyecto "Web Luis").
- Lint front y builds front+back en verde; 7/7 lógica resolveCv.
- T9 (re-medición de la 001) parcial: protocolo pendiente explícito del dueño.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo para reclutadores; sin LinkedIn, solo correo + GitHub.
- Deep-link `?go=interview` silencioso (la guía pública sí lo documenta), ES por defecto, HUD solo en deep-link: no romper el arcade.
- CV ES pendiente → fallback EN con aviso no bloqueante; tono profesional con carisma.
- Backend (002/005/006): 201 fijo `{emailSent, error}` con `error null ⟺ emailSent true`; destinatario obligatorio con fail-fast, solo la clave degrada; detalle técnico nunca visible; degradado reutiliza presentación de éxito con literal exacto ES/EN.
- 006: ritmo compartido por IP en ambos endpoints; CORS por defecto `http://localhost:5173`, `https://www.luisdasilvadev.com`, `https://luisdasilvadev.com`; FROM ausente→defecto, inválido→fail-fast; timeout 10 s con 201 degradado; 429 en ES.
- Criterio de cierre = verificación manual + build (sin tests). Matriz visual 004 y bandeja real 006 pendientes, aceptadas por el dueño.
- 007 (2026-10-12): metas fijas en ES (los rastreadores no ejecutan guiones); og-image.png 1200x630 sin texto generada con script Node puro (el SVG no vale para rastreadores sociales).
- 007 (2026-10-12): canónica `https://www.luisdasilvadev.com/`. La inicial (`luisdasilva-site.vercel.app`) era errónea: el sitio nunca estuvo en Vercel (404 DEPLOYMENT_NOT_FOUND). Porqué: no asumir dominios; verificar con curl antes de fijar una URL canónica en una spec.
- 007: carga 3,11–3,29 s frente al límite de 3 s de la 001: aceptada por escrito. Pie RF-3 tal cual; tutorial modal es excepción a RF-12; barra rápida del reclutador `role="group"`, no un segundo `nav`.
- 007: contraste medido con script propio (195 combinaciones, 0 no-pasa); DevTools/axe y lector NVDA/VoiceOver pendientes del dueño.

## Aprendizajes y errores a evitar
- entryMode pura con split crudo (sin URLSearchParams) por `go=%69nterview`; useT ES síncrono con deep-link; suggestionOutcome pura (solo `emailSent` decide).
- Resend: instanciar en diferido; v4+ devuelve `{data, error}`, no lanza. Env con preprocess `""`=ausente.
- 006: helpers puros (`escapeEmailHtml`, `normalizeOrigins`, `isRateLimited`, `sendWithTimeout`); 413 = default Express 100kb.
- Windows: usar `npm.cmd`; en PowerShell/curl las comillas fallan → cuerpos en fichero.
- No fabricar mediciones: solo valores medidos o "pendiente". No marcar tareas [x] sin cumplir su "Hecho cuando" (T6/T7 hubo que reabrirlas).
- Enter sobre "Saltar al contenido" avanzaba la pantalla de idioma: arreglado con `frontend/src/lib/enterShortcut.ts`.
- Producción (a): en Render `EMAIL_FROM` era `Nombre <correo>` y el fail-fast de la 006 tumbaba el arranque. Tras endurecer la validación de env, revisar las variables reales del despliegue antes del push. Hoy es `noreply@luisdasilvadev.com`.
- Producción (b): en Render la variable era `CORS_ORIGIN` (singular) pero el backend lee `CORS_ORIGINS`; caía a defaults y bloqueaba el dominio real. Renombrada a `CORS_ORIGINS` con `https://luisdasilvadev.com,https://www.luisdasilvadev.com`.
- Producción (c): verificar CORS con `curl -X OPTIONS` y cabecera Origin tras cada cambio de env.
- `frontend/src/lib/api.ts` ya añade `/api`: en dev no pongas `VITE_API_URL=/api` (daría `/api/api`); usa `http://localhost:5173`. Propuesta para AGENTS.md (no aplicada): aclararlo.

## Próximos pasos (del dueño)
- Resend: verificar el dominio `luisdasilvadev.com` para que `emailSent` sea true.
- Comprobar `curl -I https://www.luisdasilvadev.com/og-image.png` (200) y validar la tarjeta de vista previa.
- Pasada manual en navegador: ES/EN, 375 px, teclado EN y contacto, movimiento reducido.
- Escucha G1–G12; hueco de ≈1 s al montar la entrevista en ES de escritorio; foco que cae a body tras activar mundo/pregunta/sugerencia.
- Lector de pantalla y DevTools/axe.
