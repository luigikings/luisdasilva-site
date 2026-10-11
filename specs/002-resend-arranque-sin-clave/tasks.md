# Tareas 002 — Arranque sin clave de email

- [x] **T1. Reordenar el servicio de email: arranque sin clave y resultado normalizado.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-9, RF-11
  - Hecho cuando: el backend arranca sin clave con destinatario válido y sigue en pie; sugerencia y aviso válidos responden 201 `{emailSent:false, error no vacío}`; rechazo del proveedor responde 201 `false` con su mensaje (genérico si viene vacío); interrupción responde 201 `false` sin 500; éxito responde 201 `{emailSent:true, error:null}`; la clave no aparece en ninguna respuesta.
- [x] **T2. Fijar el contrato HTTP en ambos endpoints (201/400 y forma de respuesta).** RF-7, RF-8, RF-9
  - Hecho cuando: `POST /api/suggestions` válida → 201 con forma fija; texto corto o JSON malformado → 400 sin envío; `POST /api/door-entry` sin cuerpo → 201; idioma inválido → 400 sin envío; cada 201 cumple `{emailSent: boolean, error: string|null}` con `null` si y solo si `true`, conservando `ok:true`.
- [x] **T3. Verificación final: precedencia del destinatario, concurrencia, builds y flujo navegador.** RF-10, RF-11
  - Hecho cuando: sin destinatario el arranque falla en validación (prevalece sobre RF-1); dos envíos a la vez responden 201 independientes; `npm run lint` (frontend) y `npm run build` (frontend y backend) en verde; flujo ES/EN → puerta → entrevista → sugerencia completa sin bloqueos con 201 degradados visibles en red.
