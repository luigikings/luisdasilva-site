# Plan 006 — Higiene y anti-spam del backend

## Archivos y responsabilidades

- `backend/src/services/suggestionEmailService.ts` — escape HTML puro del texto/categoría antes de componer el email (RF-1); carrera de 10 s alrededor del envío con degradado a `emailSent:false` (RF-13). Cubre RF-1, RF-13.
- `backend/src/app.ts` — topes Zod `max(1000)`/`max(100)` sobre lo ya recortado (RF-2, RF-3, RF-4, RF-5); contador de ritmo manual en memoria con ventana deslizante de 60 s compartido por IP entre ambos endpoints (RF-7); respuesta 429 JSON `{error}` en español (RF-8); orden parser → 429 → 400 (RF-9); CORS restringido a la lista configurada, sin credenciales, métodos `GET, POST, OPTIONS`, cabecera `Content-Type`, `Origin: null`/ausente permitido sin cabeceras (RF-10). Cubre RF-2–RF-5, RF-7–RF-10.
- `backend/src/env.ts` — `EMAIL_FROM` con email estricto (solo dirección desnuda; blancos = ausente → default; valor inválido → fail-fast) y `CORS_ORIGINS` (coma-separado, trim, minúsculas, sin barra final, puerto respetado; inválidas se ignoran; ausente/vacío → los dos defaults) (RF-11, RF-12). Cubre RF-11, RF-12.
- `frontend/src/components/SuggestionPrompt.tsx` + `frontend/src/i18n/dict.ts` — contadores siempre visibles `x/1000` y `x/100` bajo cada campo; al superar el tope, mensaje en el idioma activo congelado al enviar (convención spec 005) y sin petición de red (RF-6). Cubre RF-6.
- `README.md` (raíz) — documenta topes, ritmo, CORS, remitente y timeout (RF-15). Cubre RF-15.

## Lógica separada de la interfaz

Funciones puras, sin acceso directo a red, reloj ni variables de entorno:

- `escapeEmailHtml(value: string): string` — sustituye `& < > " '` por entidades y `\n` por `<br>`. Pura y testeable por inspección con casos (`<script>`, comillas, saltos).
- `normalizeOrigins(raw: string | undefined): string[]` — parsea `CORS_ORIGINS` según RF-11; con entrada ausente/vacía devuelve los dos defaults. Pura.
- Contador de ritmo: estructura `Map<ip, number[]>` con marcas de tiempo; la función de decisión recibe el reloj (`now: number`) como parámetro:
  - `isRateLimited(hits: number[], now: number): { limited: boolean; hits: number[] }` — poda marcas older than 60 s, decide con ≥10, devuelve la lista podada. Pura e inspeccionable.
- Resolución del timeout: `sendWithTimeout(send: Promise<EmailSendResult>, ms: number, signal?: ...)` — carrera entre el envío y un temporizador de 10000 ms; el temporizador y el envío se inyectan para inspeccionar la carrera sin red real. El envío huérfano se ignora, sin reintento.

## Pseudocódigo

```
escape:
  POR CADA char EN {&, <, >, ", '} → entidad; '\n' → '<br>'

rate-limit (por petición a POST /api/suggestions o /api/door-entry):
  hits = map.get(ip) ?? []
  hits = hits.filter(t => now - t < 60_000)
  SI hits.length >= 10 → 429 {error: ES} SIN envío
  SINO: hits.push(now); map.set(ip, hits); continuar
  (limpieza oportunista de IPs sin marcas para no crecer sin cota)

timeout:
  carrera(envío, temporizador(10000))
  SI gana temporizador → {emailSent:false, error: ES genérico}; ignorar resolución tardía
  SI gana envío → su resultado tal cual

orden por petición:
  parser Express (malformado→400, >límite→413) → rate-limit (429) → Zod incl. max (400) → envío con timeout (201)
```

## Interfaz (frontend)

- Bajo el textarea de pregunta, contador `x/1000` siempre visible junto al actual `x/8+`; bajo el input de categoría, `x/100` siempre visible.
- Al superar un tope: mensaje de error en el idioma activo (nuevas claves ES/EN en el diccionario, reutilizando el estilo del `validationMessage` actual), sin llamada de red; el idioma se congela al enviar como en la spec 005.
- El 429 del backend cae en el `errorMessage` genérico actual (el detalle técnico nunca llega a la vista, como en la spec 005).

## Datos y compatibilidad

- Contrato intacto: los 201 mantienen la forma `{emailSent, error}` de la spec 002 y los 400 la convención actual; únicos códigos nuevos: 429 (ritmo, JSON `{error}` ES) y 413 (cuerpo gigante, del parser).
- Sin migraciones ni almacenamiento: el contador vive solo en memoria volátil de 60 s, sin logs de IP (sin PII persistente, RNF-4).
- `CORS_ORIGINS` es configuración por entorno, no cambio de despliegue; `EMAIL_FROM` ahora solo acepta dirección desnuda (un `Nombre <mail>` que hoy pasaba, tras el cambio no arranca: documentado en README).

## Decisiones técnicas

- Rate-limit manual en memoria frente a dependencia `express-rate-limit`: se descarta la dependencia por el principio de stack mínimo (constitución) y porque 10/min/IP con ventana deslizante son ~15 líneas con reloj inyectable.
- Ventana deslizante exacta frente a ventana fija: la fija permite el doble de ráfaga en el borde (20 peticiones en dos ventanas contiguas); la deslizante cumple "10 por minuto" de forma exacta.
- Contador compartido entre endpoints frente a uno por endpoint: decisión de usuario; un atacante no puede alternar endpoints para duplicar el ritmo.
- Escape manual con reemplazos frente a librería de sanitizado: el email es HTML generado por nosotros (no HTML arbitrario de usuario que conservar), así que escapar 5 caracteres + `<br>` basta; sin dependencias nuevas.
- CORS restrictivo con permitidos explícitos frente a reflejar el `Origin`: reflejarlo equivale a CORS abierto; la lista cerrada con defaults protege sin romper dev ni Vercel.
- `EMAIL_FROM` email estricto con fail-fast frente a fallback silencioso al default: un remitente mal configurado en producción quemaría envíos sin avisar; fallar en arranque lo hace visible (coherente con el destinatario).
- Timeout con carrera de 10 s frente a `AbortController` sobre el SDK: el SDK de Resend no expone señal de cancelación fiable; la carrera degrada sin colgar la petición y el huérfano se ignora.

## Estrategia de verificación (comando según AGENTS.md: sin script de tests → manual + build)

- `curl` por rama contra backend local:
  - escape: sugerencia con `<script>`/`<b>`/saltos → 201; inspección del HTML generado (entidades + `<br>`); con clave real, caso en bandeja del dueño si se da.
  - topes: texto 1001 y categoría 101 → 400; 1000/100 exactos → 201; 1001-con-espacios que recorta a ≤1000 → 201; solo-espacios → 400.
  - ritmo: 11 POST mezclando ambos endpoints en 60 s → la 11.ª es 429 `{error}` ES sin envío; `GET /health` OK en medio.
  - CORS: preflight desde no permitido → 204 sin cabeceras ACAO; desde permitido → 204 con ACAO; sin `Origin` → normal sin cabeceras.
  - FROM: arrancar con remitente inválido → salida no-cero + log + puerto cerrado; sin remitente → arranca con default.
  - timeout: inspección de la carrera (temporizador 10000 ms, ≥10000 cuenta como superado); en vivo solo con envío lento real si se da.
  - RNF-2: buscar clave/trazas/IPs en respuestas y logs → nada.
- Cierre: flujo navegador ES/EN → puerta → entrevista → sugerencia; formulario ES/EN con contadores visibles y sin petición al superar topes (pestaña de red); `npm run build` en frontend y backend + `npm run lint` en frontend, todo en verde.

## Cobertura RF por parte

| Parte | RF |
|---|---|
| escape puro (servicio) | RF-1, RF-2 |
| topes Zod + inclusivos | RF-3, RF-4, RF-5 |
| contador + 429 + precedencia | RF-7, RF-8, RF-9 |
| CORS restringido | RF-10, RF-11 |
| env FROM + CORS_ORIGINS | RF-11, RF-12 |
| timeout con carrera | RF-13 |
| contrato intacto | RF-14 (todas las partes) |
| formulario visible ES/EN | RF-6 |
| README | RF-15 |
