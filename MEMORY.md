# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Spec 001 y spec 002 implementadas (cierre 002: 2026-10-11, VEREDICTO APROBADO del reviewer).
- Todo lo automatizable en verde: lint front, build front+back, tsc, endpoints.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo (CV, proyectos, contacto accesibles): para reclutadores.
- Spec 002: forma fija del 201 `{emailSent, error}` con `error null ⟺ emailSent true`: contrato estable para el front.
- Destinatario (SUGGESTION_EMAIL_TO) sigue obligatorio con fail-fast intacto: solo la clave degrada, no la config de entrega.
- Verificación manual + build como criterio de cierre (sin tests automatizados): base pequeña, sin regresiones críticas aún.
- RF-6 / RF-5-en-vivo / flujo-navegador quedan como pasos pendientes del dueño (necesitan clave real y navegador).
- `ok:true` conservado en respuestas por compatibilidad con el front actual.
- A+B+C+D: puerta suave, velo ≤35%, sonido moderado, glitch solo al entrar: identidad sin fricción.
- Tutorial con apariencia actual + cierre evidente (botón con etiqueta + Escape, 1 interacción): no rediseñar.
- Festejos ≤2,5s sin repetición ni bloqueo: diversión acotada.
- Sin BBDD, solo email vía Resend (sugerencias + door-entry): suficiente para v1.
- Código en inglés, UI ES/EN: mantener bilingüe actual.
- Sin SEO obligatorio (llegan vía GitHub/enlace directo): no aplicar skill seo-tecnico por defecto.
- Mantener stack y deploy Vercel+Render/Railway salvo aprobación: evitar migración innecesaria.

## Aprendizajes y errores a evitar
- Constructor Resend a nivel de módulo mata el arranque sin clave: instanciar en diferido / modo degradado.
- Resend v4+ devuelve `{data, error}` en vez de lanzar ante rechazo: hay que inspeccionar `error`, no solo try/catch.
- Env con preprocess para `""`: cadena vacía debe tratarse como ausente (clave) sin romper fail-fast del destinatario.
- Body-parser SyntaxError necesita rama propia a 400: si no, el JSON malformado escala a 500.
- npm.ps1 bloqueado por ExecutionPolicy → usar npm.cmd (o cmd /c) en este entorno Windows.
- No fabricar mediciones en audit: solo valores medidos con cronómetro o "pendiente".

## Próximos pasos
- Pasada RF-6 con clave real (sugerencias + avisos → `emailSent:true, error:null`).
- Push/deploy si toca; siguiente spec a definir por el usuario.
