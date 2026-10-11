# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Spec 001 implementada por código (Estado: implementada, cierre 2026-10-11); verificación manual con navegador pendiente (protocolo T10/audit.md).
- Todo lo automatizable en verde: lint front, build front+back, tsc, endpoints.

## Decisiones (y por qué)
- v1 = suavizar arcade hacia profesional directo (CV, proyectos, contacto accesibles): para reclutadores.
- Cierre 001 aceptado por el usuario con manual pendiente para otro día (reviewer dio 2× CAMBIOS NECESARIOS solo por manual, sin defectos de código).
- A+B+C+D: puerta suave, velo ≤35%, sonido moderado, glitch solo al entrar: identidad sin fricción.
- Tutorial con apariencia actual + cierre evidente (botón con etiqueta + Escape, 1 interacción): no rediseñar.
- Festejos ≤2,5s sin repetición ni bloqueo: diversión acotada.
- Sin BBDD, solo email vía Resend (sugerencias + door-entry): suficiente para v1.
- Código en inglés, UI ES/EN: mantener bilingüe actual.
- Sin SEO obligatorio (llegan vía GitHub/enlace directo): no aplicar skill seo-tecnico por defecto.
- Mantener stack y deploy Vercel+Render/Railway salvo aprobación: evitar migración innecesaria.

## Aprendizajes y errores a evitar
- No fabricar mediciones en audit: solo valores medidos con cronómetro o "pendiente".
- Hallazgo: backend muere sin RESEND_API_KEY contradiciendo AGENTS.md → futura spec/bugfix.
- PowerShell ExecutionPolicy obliga a usar cmd /c para npm en este entorno.
- Sin tests automatizados, verificación manual + build/lint: base pequeña, sin regresiones críticas aún.

## Próximos pasos
- Pasada manual pendiente: cronómetro RNF-4, 2 ciclos escritorio+375px, escucha G1-G12, pasada solo-teclado.
- Fix Resend: arrancar sin clave con emailSent:false (o corregir AGENTS.md).
- Siguiente spec a definir por el usuario.
