# MEMORY.md — luisdasilva-site
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- Specs 001–005 implementadas (005 cerrada con VEREDICTO: APROBADO del reviewer).
- Tanda en curso, toca C4 (higiene backend).
- Todo lo automatizable en verde: lint front, build front+back, 7/7 lógica resolveCv.

## Decisiones (y porqué)
- v1 = suavizar arcade hacia profesional directo (CV, proyectos, contacto accesibles): para reclutadores.
- Cierre 004 con matriz visual manual pendiente, aceptado por el usuario: nada fabricable sin navegador/MCP.
- Deep-link solo sin botón ni pista en interfaz (guía pública sí lo documenta): silencio para no romper el arcade.
- ES por defecto en deep-link con equivalencia completa al cambiar a EN: reclutador local primero.
- HUD persistente solo en deep-link, inexistente en flujo normal: esencial sin monedas.
- Sin LinkedIn, solo correo + GitHub: decisión explícita de contacto.
- CV ES pendiente: mientras no exista, fallback al EN con aviso no bloqueante (RF-4).
- Tono profesional con carisma (máx 1 frase con personalidad, sin jerga arcade): reclutador primero.
- Spec 002: forma fija del 201 `{emailSent, error}` con `error null ⟺ emailSent true`: contrato estable.
- Destinatario obligatorio con fail-fast; solo la clave degrada.
- Verificación manual + build como criterio de cierre (sin tests automatizados): base pequeña.
- Cierre 005 aprobado por reviewer: degradado reutiliza mismo título/presentación de éxito + literal exacto ES/EN, sin prefijos ni puntuación añadida.
- Detalle técnico (`error`) nunca visible en el formulario: evita exponer claves o información interna.
- README raíz no describía el envío de sugerencias → no requirió cambios (RF-8).
- Éxito con clave real pendiente del dueño: rama `emailSent:true` verificada por inspección del mapeo.

## Aprendizajes y errores a evitar
- entryMode pura con split crudo (sin URLSearchParams) por `go=%69nterview`: comparación exacta.
- useT inicializa ES síncrono con deep-link: evita flash EN→ES.
- suggestionOutcome pura: solo `emailSent` decide (manda sobre el detalle).
- ApiError→errorMessage: normalizar rechazo de validación, fallo servidor y red a mensaje de error actual.
- submitLang congelado (incluido título) para éxito/degradado/error/validación: el mensaje no cambia al cambiar idioma.
- Constructor Resend a nivel de módulo mata el arranque sin clave: instanciar en diferido.
- Resend v4+ devuelve `{data, error}` en vez de lanzar: inspeccionar `error`, no solo try/catch.
- Env con preprocess para `""`: vacía = ausente sin romper fail-fast del destinatario.
- npm.ps1 bloqueado por ExecutionPolicy → usar npm.cmd en este Windows.
- No fabricar mediciones en audit: solo valores medidos o "pendiente".

## Próximos pasos
- C4 higiene backend.
- Push a GitHub de 005 si el usuario lo pide.
