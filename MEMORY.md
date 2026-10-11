# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001–006 implementadas (006 cerrada con VEREDICTO: APROBADO del reviewer).
- Tanda en curso, toca C7 accesibilidad + cierre 001.
- Todo lo automatizable en verde: lint front, build front+back, 7/7 lógica resolveCv.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo: para reclutadores.
- Cierre 004 con matriz visual manual pendiente, aceptado por el usuario: nada fabricable sin navegador/MCP.
- Deep-link silencioso (sin botón/pista; guía pública sí lo documenta) + ES por defecto con equivalencia EN + HUD solo en deep-link: no romper arcade.
- Sin LinkedIn, solo correo + GitHub: decisión explícita de contacto.
- CV ES pendiente → fallback EN con aviso no bloqueante; tono profesional con carisma (1 frase, sin jerga).
- Spec 002: 201 forma fija `{emailSent, error}` con `error null ⟺ emailSent true`: contrato estable.
- Destinatario obligatorio con fail-fast; solo la clave degrada. Detalle técnico nunca visible en formulario.
- Verificación manual + build como criterio de cierre (sin tests): base pequeña.
- Cierre 005 aprobado: degradado reutiliza título/presentación de éxito + literal exacto ES/EN.
- 006 aprobado: ritmo compartido por IP (ambos endpoints); defaults CORS localhost:5173 + vercel.app; FROM ausente→defecto, inválido→fail-fast; timeout 10s con 201 degradado; 429 en ES; README documentado.
- 006: bandeja real con clave y pasada navegador completas pendientes no bloqueantes del dueño: requieren clave/bandeja real.

## Aprendizajes y errores a evitar
- entryMode pura con split crudo (sin URLSearchParams) por `go=%69nterview`: comparación exacta.
- useT ES síncrono con deep-link (evita flash) + submitLang congelado: mensaje no cambia al cambiar idioma.
- suggestionOutcome pura (solo `emailSent` decide) + ApiError→errorMessage normalizado.
- Resend: instanciar en diferido (módulo mata arranque sin clave); v4+ devuelve `{data, error}`, no lanza.
- Env con preprocess `""`=ausente sin romper fail-fast; npm.cmd en este Windows (npm.ps1 bloqueado).
- 006: `escapeEmailHtml`/`normalizeOrigins`/`isRateLimited`/`sendWithTimeout` puras; escape tras trim y `<br>` al final; Zod trim-antes-max.
- 006: rate-limit con split crudo (sin `new URL`); PowerShell/curl comillas → cuerpos en fichero; 413 = default Express 100kb.
- No fabricar mediciones en audit: solo valores medidos o "pendiente".

## Próximos pasos
- C7 accesibilidad + cierre 001.
- Push a GitHub de 006 si el usuario lo pide.
