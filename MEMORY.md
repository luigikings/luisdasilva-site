# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001, 002 y 003 implementadas (003 cerrada 2026-10-11, VEREDICTO con manual pendiente aceptado por el usuario).
- Tanda C1→C7 en curso, toca C2 (atajos de reclutador).
- Todo lo automatizable en verde: lint front, build front+back, 7/7 lógica resolveCv.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo (CV, proyectos, contacto accesibles): para reclutadores.
- Cierre 003 con verificación manual en navegador pendiente (ES/EN + 375 px), aceptado por el usuario: nada fabricable sin MCP en este entorno.
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
- resolveCv con `lang:unknown` para indeterminados (sirve EN + aviso EN): no forzar idioma activo.
- Aviso EN forzado vía `dict.en` cuando el CV servido es el inglés: coherencia idioma-aviso.
- Botones con window.open vs `<a>`: a valorar accesibilidad/lector en 375 px (pendiente manual).
- Constructor Resend a nivel de módulo mata el arranque sin clave: instanciar en diferido.
- Resend v4+ devuelve `{data, error}` en vez de lanzar: inspeccionar `error`, no solo try/catch.
- Env con preprocess para `""`: vacía = ausente (clave) sin romper fail-fast del destinatario.
- Body-parser SyntaxError necesita rama propia a 400: si no, escala a 500.
- npm.ps1 bloqueado por ExecutionPolicy → usar npm.cmd en este Windows.
- No fabricar mediciones en audit: solo valores medidos o "pendiente".

## Próximos pasos
- C2 atajos de reclutador (evitar la puerta sin romperla).
- Push a GitHub de 003 si el usuario lo pide; RF-6 con clave real queda pendiente del dueño.
