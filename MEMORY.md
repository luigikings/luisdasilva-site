# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001–004 implementadas (004 cerrada 2026-10-11, manual pendiente aceptado por el usuario).
- Tanda C1→C7 en curso, toca C3 (feedback honesto de sugerencias).
- Todo lo automatizable en verde: lint front, build front+back, 7/7 lógica resolveCv.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo (CV, proyectos, contacto accesibles): para reclutadores.
- Cierre 004 con matriz visual manual pendiente (con/sin ?go=interview × ES/EN × escritorio/375px), aceptado por el usuario: nada fabricable sin navegador/MCP en este entorno.
- Deep-link solo sin botón ni pista en interfaz (guía pública sí lo documenta): silencio para no romper el arcade.
- ES por defecto en deep-link con equivalencia completa al cambiar a EN: reclutador local primero, sin textos mezclados.
- HUD persistente solo en deep-link (CV/GitHub/contacto a 1 interacción), inexistente en flujo normal: esencial sin monedas.
- Magnar WarGames solo con demo verificada, sin enlace de código: no afirmar nada sobre su repo.
- Sin LinkedIn (ni mención ni enlace), solo correo + GitHub: decisión explícita de contacto.
- CV ES pendiente: mientras no exista, fallback al EN con aviso no bloqueante (RF-4).
- Tono profesional con carisma (máx 1 frase con personalidad, sin jerga arcade): reclutador primero.
- Spec 002: forma fija del 201 `{emailSent, error}` con `error null ⟺ emailSent true`: contrato estable.
- Destinatario (SUGGESTION_EMAIL_TO) obligatorio con fail-fast; solo la clave degrada.
- Verificación manual + build como criterio de cierre (sin tests automatizados): base pequeña.
- `ok:true` conservado por compatibilidad con el front actual.
- A+B+C+D: puerta suave, velo ≤35%, sonido moderado, glitch solo al entrar: identidad sin fricción.
- Tutorial con apariencia actual + cierre evidente (etiqueta + Escape, 1 interacción): no rediseñar.
- Festejos ≤2,5s sin repetición ni bloqueo: diversión acotada.
- Sin BBDD, solo email vía Resend (sugerencias + door-entry): suficiente para v1.
- Código en inglés, UI ES/EN; sin SEO obligatorio (llegan por enlace directo); stack y deploy intactos salvo aprobación.

## Aprendizajes y errores a evitar
- entryMode pura con split crudo (sin URLSearchParams) por `go=%69nterview`: comparación exacta, sin normalizar.
- useT inicializa ES síncrono con deep-link (sin efecto post-montaje): evita flash EN→ES.
- T4/T5 de 004 cubiertas por reutilización (RF-13 de 001 + tutorial/aviso intactos): sin delta.
- resolveCv con `lang:unknown` para indeterminados (sirve EN + aviso EN): no forzar idioma activo.
- Aviso EN forzado vía `dict.en` cuando el CV servido es el inglés: coherencia idioma-aviso.
- Constructor Resend a nivel de módulo mata el arranque sin clave: instanciar en diferido.
- Resend v4+ devuelve `{data, error}` en vez de lanzar: inspeccionar `error`, no solo try/catch.
- Env con preprocess para `""`: vacía = ausente (clave) sin romper fail-fast del destinatario.
- Body-parser SyntaxError necesita rama propia a 400: si no, escala a 500.
- npm.ps1 bloqueado por ExecutionPolicy → usar npm.cmd en este Windows.
- No fabricar mediciones en audit: solo valores medidos o "pendiente".

## Próximos pasos
- C3 feedback honesto de sugerencias.
- Push a GitHub de 004 si el usuario lo pide; matriz visual pendiente en pasada con navegador.
