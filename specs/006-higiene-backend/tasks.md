# Tareas 006 — Higiene y anti-spam del backend

- [x] **T1. Configuración: `CORS_ORIGINS` + `EMAIL_FROM` estricto.** RF-11, RF-12
  - Hecho cuando: arrancar sin `CORS_ORIGINS` usa los dos defaults; con lista sucia normaliza/ignora inválidas; `EMAIL_FROM` inválido no arranca (no-cero + log + puerto cerrado) y ausente/vacío arranca con el default.
- [x] **T2. Escape HTML del email + topes de tamaño.** RF-1, RF-2, RF-3, RF-4, RF-5
  - Hecho cuando: `<script>`/comillas/saltos llegan como entidades + `<br>` por inspección; texto 1001 y categoría 101 → 400 sin envío; 1000/100 exactos → 201; recorte-extremos manda (1001→≤1000 válido, solo-espacios → 400).
- [x] **T3. Rate-limit 10/min por IP compartido + 429.** RF-7, RF-8, RF-9
  - Hecho cuando: 11 POST mezclando ambos endpoints en 60 s → la 11.ª es 429 `{error}` ES sin envío; salud/OPTIONS/404 no cuentan; malformado → 400 y gigante → 413 antes que 429; 429 antes que 400 de tamaño.
- [x] **T4. CORS restringido.** RF-10, RF-11
  - Hecho cuando: preflight no permitido → 204 sin ACAO; permitido → 204 con ACAO (sin credenciales, GET/POST/OPTIONS, Content-Type); sin `Origin` o `null` → permitido sin cabeceras; subdominio debe ser exacto.
- [x] **T5. Timeout de envío 10 s con degradado.** RF-13, RF-14
  - Hecho cuando: por inspección, a ≥10000 ms responde 201 `{emailSent:false, error ES genérico}` y el envío tardío se ignora sin reintento; ningún caso da 500 y la forma 201 sigue intacta.
- [x] **T6. Límites visibles en el formulario ES/EN.** RF-6
  - Hecho cuando: contadores `x/1000` y `x/100` siempre visibles; al superar un tope hay mensaje en el idioma activo (congelado al enviar) y la pestaña de red muestra que no sale petición, en ES y en EN.
- [x] **T7. README + verificación final.** RF-15, RF-14
  - Hecho cuando: el README raíz documenta topes, ritmo, CORS, remitente y timeout; flujo navegador ES/EN → puerta → entrevista → sugerencia OK; `build` front+back y `lint` front en verde; respuestas y logs sin clave/trazas/IPs.
