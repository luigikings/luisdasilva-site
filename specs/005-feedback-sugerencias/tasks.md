# Tasks 005 — Feedback honesto de sugerencias

- [x] **T1. Decisión pura + tipos alineados con el contrato.** RF-1, RF-2, RF-3, RF-5
  - Hecho cuando: la llamada de envío expone `{emailSent, error}` y la función pura devuelve `success` con `emailSent:true`, `degraded` con `emailSent:false` (200 o 201, detalle nulo/vacío/ausente incluido) y `error` sin cuerpo, con cuerpo no interpretable o sin `emailSent`; el detalle `error` nunca sale hacia la vista.
- [x] **T2. Formulario honesto con degradado reutilizando el éxito.** RF-1, RF-2, RF-4, RF-5, RF-6, RF-7
  - Hecho cuando: con `success` se ve título y mensaje de éxito actuales; con `degraded` se ve la misma presentación con el cuerpo exacto ES "Recibida, pero el aviso no se envió" / EN "Received, but the notification was not sent"; con `error` se ve el mensaje de error actual; con <8 caracteres se ve validación actual sin envío; cada mensaje queda congelado en el idioma del envío (respaldo EN) y ningún detalle técnico es visible.
- [x] **T3. Verificación manual + documentación y cierre.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8
  - Hecho cuando: rama degradada verificada sin clave en ES/EN con 201 `emailSent:false` en red; rama éxito por inspección (+ dueño con clave real si disponible); fallos, validación, idioma y lectura de la documentación raíz comprobados según el plan; `npm run lint` y `npm run build` de frontend y backend en verde y recorrido ES/EN → puerta → entrevista → sugerencia OK.
