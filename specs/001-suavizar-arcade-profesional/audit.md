# Auditoría de animaciones — Spec 001

Tabla cerrada: una fila por animación o efecto visible y audible de la experiencia.
Si durante la validación aparece una animación visible no listada, debe añadirse
como fila nueva antes de cerrar (criterio de finalización de la spec).

## Protocolo

- Medir duraciones con cronómetro según RNF-4 de la spec (1 vez por idioma,
  registrar el mayor valor; navegador actualizado, sin throttling, animaciones activas).
- Fluidez (RNF-1): observar 2 ciclos completos en escritorio y en móvil de 375 px;
  pasa con 0 congelamientos o saltos visibles.
- Entendible: hay progreso visible, pista textual o botón/acción visible en la
  misma pantalla (definición de la spec).
- Movimiento reducido: con el ajuste activado, el contenido aparece directo
  (RF-7) o la animación en curso termina en su estado final en ≤ 0,5 s (RF-8).
- Sonido: escucha manual; volumen moderado y homogéneo (RF-16).
- Validador: quien ejecuta la validación rellena `Medido`, `Pasa` y `Notas`;
  la spec solo cierra con 0 filas pendientes.

## Leyenda de columnas

`Límite` = RF aplicable. `Pasa` = sí/no por fila (todos los criterios de la fila
cumplidos). `Medido` = duración cronometrada o «n/a» (estático/condicional).

## Método y estado de esta revisión (T9)
- Sin MCP de Chrome disponible: las duraciones de esta revisión se obtienen **por
  código/cálculo** (constantes y `transition` del código citado en cada fila).
  Los valores con `≈` son estimaciones de muelles framer-motion (asentamiento).
- `Pasa: sí (código)` = el código garantiza el presupuesto (p. ej. topes
  numéricos, `clamp`, duraciones fijas). La confirmación con **cronómetro manual
  + 2 ciclos en escritorio y 375 px + escucha manual** queda para T10
  (verificación final), que dispone de navegador.
- `Mov. reducido: sí` = verificado por código: cada vista comprueba
  `prefersReducedMotion` y resuelve al estado final (`lib/reducedMotion.ts`,
  ramas `undefined` en framer-motion, limpieza del FxProvider en el siguiente
  paint). Confirmación manual del régimen de 0,5 s (RF-8): T10.
- Filas H1–H4: animaciones no listadas detectadas durante la revisión y añadidas
  como filas nuevas según el protocolo. `Modal.tsx` existe pero no se importa en
  ninguna vista: sin fila (código muerto, no visible).

## A. Selección de idioma

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| A1 | Entrada del logo (aparición) | Llegada a la portada | RF-5 | ≈0,7 s (código: spring 160/14, `LanguageIntroScreen.tsx`) | sí — logo + subtítulo visibles al asentar | sí — directo, sin `initial` | sí (código) | Spring de entrada; pendiente cronómetro T10 |
| A2 | Glitch del logo (una sola vez al entrar, ≤ 1 s) | Guiño arcade | RF-10, RF-11 | 0,9 s (código: `glitch-a/b 0.9s steps(1) 1`, `index.css`) | sí — texto base siempre opaco, copias solo laterales | sí — `prefers-reduce: animation none` | sí (código) | Decisión D aplicada; 1 vez, ≤ 1 s, base nunca oculta (RF-11) |
| A3 | Personaje flotando + sombra (bucle) | Portada viva | RF-6, RF-7 | 2,4 s/ciclo (código: `duration: 2.4 repeat: Infinity`) | sí — decorativa, no pide acción | sí — queda fija | sí (código) | Decorativa, no bloquea; pendiente 2 ciclos T10 |
| A4 | Entrada de las tarjetas de idioma | Opciones disponibles | RF-5 | ≈0,6 s/tarjeta + stagger 0,12 s (código: spring 180/15, delay 0,25/0,37) | sí — tarjetas + nombres visibles | sí — directo | sí (código) | Incluye inclinación/press de TiltCard (ver H1) |
| A5 | Cursor ▼ rebotando sobre la activa (bucle) | Cuál está seleccionada | RF-6, RF-7 | 0,8 s/ciclo (código: `duration: 0.8 repeat: Infinity`) | sí — marca la activa junto al borde cónico | sí — estático | sí (código) | Redundante con A6 a propósito (no solo color, RNF-2) |
| A6 | Borde cónico rotatorio de la activa (bucle) | Cuál está seleccionada | RF-6, RF-7 | 3 s/vuelta (código: `spin_3s_linear_infinite`) | sí — ver A5 | sí — color plano `#3a2a78` | sí (código) | Solo en la activa; `motion-reduce:animate-none` |
| A7 | Brillo pulsante del botón confirmar (bucle) | Dónde confirmar | RF-6, RF-7 | 1,8 s/ciclo + entrada con delay 0,6 s (código) | sí — botón etiquetado ES/EN | sí — botón plano | sí (código) | `boxShadow` nunca apaga el texto (RF-11) |
| A8 | Cambio de título al alternar idioma (fundido) | Idioma previsualizado | RF-5 | 0,25 s (código: `transition duration: 0.25`) | sí — el título cambia de idioma | sí — cambio instantáneo | sí (código) | `AnimatePresence mode="wait"`, blur 4 px transitorio, texto legible al asentar |

## B. Carga

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| B1 | Contador % gigante y pop al completar | Progreso y fin | RF-1, RF-2 | total ≈2,5 s real (código: `PROGRESS_DURATION = 2000` × wobble medio ~0,8); pop 0,4 s | sí — número % + barra + botón comenzar | sí — 100 % directo, botón con foco | **no** (medido 3,11–3,29 s, ver «Re-medición manual (spec 007, T9)») | El cálculo por código daba ≈ 2,5 s; el cronómetro desde confirmar idioma hasta botón habilitado excede 3 s |
| B2 | Líneas de terminal apareciendo | Actividad de arranque | RF-1, RF-2 | ≈0,3 s/línea (código: fundido `opacity/x` por defecto framer) | sí — líneas acumulativas, cursor de bloque | sí — todas visibles a la vez | sí (código) | Ligadas a umbrales de progreso; nunca borran texto previo |
| B3 | Segmentos de la barra iluminándose | Progreso | RF-1, RF-2 | 0,25 s/segmento (código); boost +6 puntos ≥ 5, reflejado en el mismo frame (< 0,2 s) | sí — número y barra cambian a la vez + texto flotante `+6%` | sí — barra llena directa | sí (código) | `BOOST_POINTS = 6`; `setState` síncrono en el manejador |
| B4 | Personaje corriendo sobre la barra (bucle) | Carga en curso | RF-6, RF-7 | 0,35 s/ciclo (código: `duration: 0.35 repeat: Infinity`) | sí — corre sobre el % actual | sí — no se renderiza animación (fijo tras `done`) | sí (código) | Se detiene al completar (`done`) |
| B5 | Rotación de consejos (cada ~2 s) | Pistas de uso | RF-6 | rotación 2,2 s (código: `setInterval 2200`); fundido ≈0,3 s | sí — texto siempre legible (RF-11), alterna con pista de boost | sí — primer consejo estático | sí (código) | Al terminar muestra pista fija; blink del título con suelo 0,35 (RF-11) |
| B6 | Pulso del botón comenzar al habilitarse | Ya se puede pasar | RF-1, RF-6 | 1,1 s/ciclo (código: `duration: 1.1 repeat: Infinity`); foco automático al habilitarse | sí — botón habilitado + foco + texto comenzar | sí — botón habilitado + foco, sin pulso | sí (código) | Requiere 1 clic (RF-1); `disabled` hasta `done` |

## C. Transiciones entre vistas

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| C1 | Cortina de barras de colores | Cambio de vista | RF-5 (≤ 0,6 s) | ≈0,52 s total (código: 0,32 s + 9 × 0,022 s stagger, `InterviewExperience.tsx`) | sí — la vista nueva aparece tras la cortina | sí — sin cortina (no se monta con reducido) | sí (código) | 10 barras, `pointer-events-none`; no intercepta interacción |
| C2 | Fundido/escala de la vista | Cambio de vista | RF-5 (≤ 0,6 s) | 0,5 s total (código: salida 0,2 s + entrada 0,3 s, `mode="wait"`) | sí — vista nueva con foco/gestión propia | sí — montaje directo | sí (código) | Vista interactiva al terminar; overlays sin puntero |

## D. Puerta

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| D1 | Entrada de la escena (fachada + puerta) | Llegada a la puerta | RF-5 | 0,7 s (código: `duration: 0.7 easeOut`) | sí — escena completa visible | sí — directa | sí (código) | Caja de diálogo entra en 0,4 s aparte |
| D2 | Parpadeo del cartel de neón (bucle) | Ambiente, local abierto | RF-6, RF-7, RF-11 | 3,2 s/ciclo (código); opacidad mínima 0,3, nunca 0 | sí — cartel siempre legible palabra por palabra | sí — opacidad fija 1 | sí (código) | Texto nunca oculto |
| D3 | Golpes: sacudida + anillo + «TOC» | Alguien llama | RF-6, RF-16, RF-18 | sacudida 0,42 s + anillo 0,5 s + pop spring ≈0,5 s (retirado a 0,9 s); secuencia: pausa 1,4 s + golpes a 0/280/560 ms + diálogo a 1,1 s → ≈2,5 s hasta diálogo | sí — sacudida + etiqueta «TOC» + sonido | sí — sin golpes: salto directo a diálogo | sí (código) | Sonido suavizado (C): ruido 0,07 s + grave sine (ver G6) |
| D4 | Escritura de los 4 mensajes (uno por uno) | Diálogo de bienvenida | RF-4 (≤ 3 s c/u), RF-20 | ≤ 3 s c/u garantizado (código: `charInterval = min(35, 3000/len)`) | sí — diálogo visible + avance automático + pista ▼ | sí — texto completo instantáneo | sí (código) | Textos acordados ES/EN; pendiente cronómetro por mensaje T10 |
| D5 | Avance automático entre mensajes | La escena continúa sola | RF-4 | 5 s entre mensajes (código: `later(setMessageIndex, 5000)`) | sí — sin interacción exigida | sí — avance igual, texto completo | sí (código) | El botón de entrar nunca se oculta una vez visible |
| D6 | Pulso del botón de entrar | Ya se puede entrar | RF-3 (≤ 8 s), RF-6 | pulso 1,4 s/ciclo; aparece 0,6 s tras el 1.er mensaje → acumulado ≈1,4 + 1,1 + ≤3 + 0,6 ≈ 6,1 s ≤ 8 s | sí — botón etiquetado + foco automático | sí — visible desde el inicio del diálogo | sí (código) | Pendiente cronómetro escena→botón ES/EN T10 |
| D7 | Apertura 3D + zoom + ráfaga + destello | La puerta se abre | RF-6 (≤ 2 s), RF-9, RF-18 | 1,4 s total (código: giro 0,9 s + zoom 1,4 s + `onEnter` a 1400 ms; flash 0,12 s + fundido 0,18 s ≈ 0,3 s, velo 0,35) | sí — puerta girando + luz + Luis visible | sí — paso inmediato a entrevista | sí (código) | 1 destello ≤ 300 ms, velo ≤ 35 % (clamp `MAX_FLASH_ALPHA`); doble clic = 1 apertura |
| D8 | Luz bajo la puerta (bucle) | Hay alguien dentro | RF-6, RF-7 | 2 s/ciclo + brillo interior 1,2 s/ciclo (código) | sí — decorativa | sí — fija | sí (código) | Decorativa |

## E. Entrevista

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| E1 | Escritura línea jugador + respuesta | Conversación en curso | RF-12, RF-16 | jugador 28 ms/car + pausa 280 ms + respuesta 24 ms/car + 180 ms (código, `Interview.tsx`); textos típicos (20–400 car) → ≈0,6–10 s con salto inmediato | sí — burbujas clicables + pista «saltar ▸▸» + cursor | sí — texto completo instantáneo | sí (código) | Salto con clic/Enter/Espacio (RF-12); blips suaves cada 3 car |
| E2 | Alternancia del avatar al hablar | Quién habla | RF-6, RF-7 | alternancia 160 ms; balanceo 0,44 s/ciclo hablando, 2,6 s/ciclo en reposo; ecualizador 0,6–0,8 s/barra | sí — marco + etiqueta + ecualizador solo al hablar | sí — imagen fija frontal | sí (código) | No bloquea; badge LIVE con blink de suelo 0,35 |
| E3 | Moneda voladora + textos flotantes (−1, ✕) | Coste o error de monedas | RF-6, RF-18 | vuelo ≈0,75 s (código: `speed 0.022` ≈ 45 frames) + estallido; flotante 1,1 s (anim 0,8 s); retardo 380 ms antes de conversar | sí — contador HUD + flotante + ráfaga en destino | sí — `onArrive` inmediato, sin vuelo | sí (código) | Esenciales (CV/proyectos/GitHub/contacto) nunca vuelan: bursts directos |
| E4 | Aviso sin monedas (sacudida + velo rojo) | Sin saldo en ese mundo | RF-18, RF-11 | sacudida 0,42 s + flash 0,3 s + flotante 1,1 s; aviso en tarjeta 2,2 s; toast 3,4 s; resaltado interruptor 2,4 s | sí — aviso textual + pista modo infinito, todo accionable | sí — aviso estático, sin sacudida/flash | sí (código) | 1 sacudida, efecto ≤ 2,5 s; no bloquea |
| E5 | Avisos de logro + confeti grande | Hito alcanzado | RF-17 (≤ 4 s), RF-18 | autodismiss 3,4 s ≤ 4 s (código); entrada spring ≈0,5 s; brillo 0,9 s; confeti disparo único ≈2,5 s (ver E7) | sí — título + cuerpo + cierre ✕ + clic descarta | sí — mismo texto y tiempos, sin desliz/brillo | sí (código) | Lista cerrada de 6 hitos; máx 3 visibles, sin apilado ilegible; 1 clic descarta |
| E6 | Tutorial de entrada (aparición + iconos) | Cómo se juega | RF-19, RF-7 | overlay 0,3 s (delay 0,5) + tarjeta spring ≈0,6 s (delay 0,6) + pasos stagger 0,8/0,95/1,1 + iconos 1,6 s/ciclo + shimmer 3 s | sí — título + 3 pasos + botón de cierre etiquetado + Escape | sí — contenido directo, mismo texto | sí (código) | Cierre 1 interacción, devuelve foco a `#interview-main`; foco inicial al botón cerrar |
| E7 | Lluvia de monedas / confeti (infinito, Konami) | Celebración especial | RF-17, RF-18 (≤ 2,5 s) | ≈2,5 s en pantalla (código: `CELEBRATION_LIFE = 150` frames ≈ 2,5 s a 60 fps), disparo único | sí — aviso de logro acompañante + HUD ∞ | sí — nada en vuelo (limpieza en siguiente paint) | sí (código) | Sin repetición; Konami dispara ambas a la vez, 1 sola vez |
| E8 | Transiciones de tarjetas (mundos/preguntas) | Navegación | RF-5 | entrada spring ≈0,5 s (stagger 0,07/0,05 por índice); salida 0,2 s; emoji 3 s/ciclo; aviso tarjeta 0,4 s | sí — títulos de sección + migas (volver, mundo activo) | sí — montaje directo | sí (código) | Hover/inclinación: ver H1; monedas con transición 0,3 s |

## F. Globales

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| F1 | Fondo (estrellas, sol, rejilla, CRT) | Ambiente arcade | RF-6, RF-7 | deriva continua (0,05–0,4 px/frame); fugaces ≈1 s (60 frames, máx 2); rejilla 1,6 s/ciclo; scan 7 s; shimmer 4 s (código) | sí — decorativo permanente, contenido siempre encima (z-0) | sí — 1 frame estático (opacidad 0,8), sin rejilla/scan animados | sí (código) | Decorativo permanente; densidad por área (móvil ligero) |
| F2 | Cursor (brillo, estela, clics) | Posición e interacción | RF-6, RF-7 | spring 260/28 (≈0,3 s de retardo); estela ≈0,47 s (28 frames); clic ≈0,57 s (34 frames) | sí — sigue al puntero, solo `pointer: fine` | sí — desactivado por completo | sí (código) | Solo ratón; en táctil no existe (sin información solo-cursor) |
| F3 | Destellos de pantalla completa | Cambio de estado | RF-9 (1 × ≤ 300 ms) | ≈0,3 s (código: visible 120 ms + fundido 0,18 s); velo ≤ 0,35 (`clampFlashColor`); gap mínimo 500 ms | sí — acompañan a un cambio de vista/estado ya visible | sí — nunca se disparan | sí (código) | Nunca en bucle; punto único de control en `FxProvider` |
| F4 | Sacudida de pantalla | Golpe o error | RF-18 (≤ 2,5 s) | 0,42 s (código: `fx-shake 0.42s`, 1 vez, clase retirada al terminar) | sí — siempre con aviso textual/sonoro parejo | sí — nunca se dispara | sí (código) | Sin repetición; no mueve el tutorial (portal a `body`) |

## G. Sonidos (escucha manual, RF-15 + RF-16)

Motor: `MASTER_VOLUME = 0.1` (`lib/sound.ts`); volúmenes por efecto 0,08–0,6
sobre el máster; duraciones calculadas de las secuencias de tonos. Escucha de
auricular/altavoz + homogeneidad percibida: pendiente T10.

| ID | Evento | Equivalente visual | Volumen moderado | Pasa | Notas |
|----|--------|-------------------|------------------|------|-------|
| G1 | Pasar el cursor | Brillo del botón | sí (código: 0,04 s, vol 0,18) | sí (código) | `hover`: 880 Hz 0,04 s; el más corto y bajo |
| G2 | Elegir / confirmar | Cambio visual | sí (código: ≈0,15 s, vol 0,5) | sí (código) | `select` 2 notas; `back` espejo descendente |
| G3 | Comenzar / entrar | Cambio de vista | sí (código: ≈0,36 s, vol 0,5 ×4 notas) | sí (código) | `start` 4 notas ascendentes; entrar añade `door` (G7) |
| G4 | Volver | Cambio de vista | sí (código: ≈0,15 s, vol 0,4) | sí (código) | `back`, espejo de G2 un semitono bajo |
| G5 | Escritura de texto | Texto visible | sí (código: 0,025 s triangle vol 0,08, el más bajo) | sí (código) | Suavizado (C); cada 2–3 caracteres |
| G6 | Golpes de puerta | Sacudida + pops | sí (código: ruido 0,07 s vol 0,45 + sine 110→60 Hz 0,09 s) | sí (código) | Suavizado (C): filtro 400 Hz, sin chasquido agudo |
| G7 | Apertura de puerta | Puerta abriéndose | sí (código: ruido 0,5 s + slide 180→520 Hz 0,5 s) | sí (código) | El más largo (0,5 s) pero envolvente, vol ≤ 0,5 |
| G8 | Moneda | Moneda voladora + contador | sí (código: ≈0,4 s, vol 0,55 ×2 notas) | sí (código) | Clásico 2 notas (988/1319 Hz) |
| G9 | Error (sin monedas) | Aviso visible | sí (código: ≈0,38 s, vol ≤ 0,5, graves 80–220 Hz) | sí (código) | Grave descendente, sin estridencia |
| G10 | Logro | Aviso visible | sí (código: ≈0,86 s, triangle + cola suave) | sí (código) | 4 notas + cola; el de mayor rango dinámico, vol máx 0,6 en triangle (suave) |
| G11 | Celebración (encendido/confeti) | Confeti/monedas visibles | sí (código: `powerUp` ≈0,33 s, vol 0,45) | sí (código) | Visual ≤ 2,5 s (E7); sonoro breve |
| G12 | Interruptor silencio + persistencia | Icono de estado | n/a | sí (código) | Visible en las 4 vistas (botón fijo `LanguageSwitcher`, banderas ocultas solo en idioma); `localStorage lk-arcade-muted`; al reactivar emite `select` de confirmación |

## H. Filas nuevas detectadas en esta revisión

| ID | Animación | Qué comunica | Límite | Medido | Entendible | Mov. reducido | Pasa | Notas |
|----|-----------|--------------|--------|--------|------------|---------------|------|-------|
| H1 | Inclinación 3D + brillo al pasar el puntero (TiltCard) | La tarjeta es pulsable | RF-6, RF-7 | spring 220/18 (≈0,4 s asentamiento) + brillo 0,3 s (código, `TiltCard.tsx`) | sí — solo realza tarjetas ya etiquetadas | sí — botón plano, sin tilt ni brillo | sí (código) | Solo ratón; decorativa |
| H2 | Modal de sugerencia (apertura + éxito/error) | Dónde proponer / resultado del envío | RF-6, RF-17 | overlay 0,25 s + tarjeta spring ≈0,5 s; éxito pop ≈0,3 s; error sacudida `x [0,-6,6,0]` ≈0,3 s; envío OK con ráfaga | sí — título + campos + botones + foco al campo + mensaje de estado | sí — directo, mismo flujo y foco | sí (código) | Foco entra/sale del diálogo (RF-21); Escape cierra |
| H3 | Micro-animaciones del HUD (nivel, moneda, interruptor ∞) | Progreso y saldo | RF-6, RF-17, RF-18 | nivel spring ≈0,4 s; bump moneda 0,35 s; pulso interruptor 0,7 s ×3 = 2,1 s; giro moneda 1,6 s/ciclo; shimmer XP 3 s/ciclo | sí — números + etiquetas siempre visibles | sí — cambios directos, sin bump/pulso/giro | sí (código) | Pulso ≤ 2,5 s y acotado a 3 repeticiones; giro/shimmer decorativos con `motion-reduce:animate-none` |
| H4 | Pastilla de idioma + entrada del HUD superior | Idioma activo / controles fijos | RF-5, RF-6 | entrada 0,5 s; pastilla spring 420/30 (≈0,3 s) | sí — banderas + altavoz etiquetados | sí — montaje directo | sí (código) | El botón de sonido nunca se oculta (ver G12) |

## Estado tras T10 (verificación automatizada, sin navegador)

- Fecha: 2026-10-10. Sin navegador de escritorio conectado: no se pudo
  ejecutar el protocolo con cronómetro (RNF-4), los 2 ciclos por animación
  (RNF-1), la escucha G1–G12 ni el recorrido solo-teclado.
- Lo automatizable, en verde: `npm run lint` (frontend) sin avisos;
  `npm run build` en frontend (`tsc && vite build`) y backend (`tsc`) sin
  errores; `tsc` en verde implica equivalencia estructural ES/EN
  (`Record<QuestionKey,…>` con las 22 preguntas y `Record<AchievementKey,…>`
  con los 6 logros en ambos idiomas); checklist RF-20 programático OK sobre
  los 8 textos de puerta; `POST /api/suggestions` válida → 201 e inválida →
  400 (validación Zod); `GET /` del frontend → 200.
- Las filas conservan `Pasa: sí (código)`. La confirmación manual con
  cronómetro en escritorio + 375 px queda pendiente para el validador
  (protocolo en el informe de T10). Ninguna fila queda en estado distinto al
  declarado: 0 filas inventadas, 0 mediciones fabricadas.

## Re-medición manual (spec 007, T9) — 2026-10-12

Qué es: medición real con el navegador integrado de la app (Chromium), `performance.now()` en la página y un bucle de `requestAnimationFrame` para huecos de fotograma. Entorno: build de producción servido con `vite preview` (puerto 5173) + backend local (3000) con destino de pruebas `.invalid` y sin clave de Resend; sin throttling de CPU/red; animaciones activas; Windows 11. Instante de interacción = `keydown/click` capturado en la página; instante de fin = primer fotograma en que cambia el DOM. Resolución ≈ 14 ms (1 fotograma). Una pasada completa por idioma (RNF-4: el mayor valor), más una pasada ES en 375 px. Solo hay valores medidos; lo que no se pudo medir figura como PENDIENTE.

### 10a. Umbrales con cronómetro (RF-1, RF-3, RF-4, RF-5, RF-6, RF-12, RF-17)

| Umbral | Inicio → fin (RNF-4) | Límite | ES (desktop) | EN (desktop) | ES 375 px | Peor caso | Veredicto |
|--------|----------------------|--------|--------------|--------------|-----------|-----------|-----------|
| RF-1 carga | confirmar idioma → «Comenzar» habilitado y con foco | ≤ 3 s | 3,17 s (foco en botón: sí) | 3,11 s (foco en botón: sí) | 3,29 s | 3,29 s | **NO PASA** (excede 0,11–0,29 s). Desde que monta la vista de carga: 2,71 s ES / 2,65 s EN; el resto es la salida de la vista de idioma (≈ 0,46 s). Servidor de desarrollo: 3,28 s ES |
| RF-3 puerta | aparición de la escena → botón «Abrir la puerta» visible | ≤ 8 s | 4,04 s (2.ª pasada ES: 4,05 s) | 4,09 s | 4,06 s | 4,09 s | pasa |
| RF-4 mensaje 1 | inicio → texto completo | ≤ 3 s | 0,667 s | 0,701 s | 0,667 s | 0,701 s | pasa |
| RF-4 mensaje 2 | idem | ≤ 3 s | 0,861 s | 0,806 s | 0,840 s | 0,861 s | pasa |
| RF-4 mensaje 3 | idem | ≤ 3 s | 1,375 s | 1,194 s | 1,361 s | 1,375 s | pasa |
| RF-4 mensaje 4 | idem | ≤ 3 s | 1,514 s | 2,000 s | 1,500 s | 2,000 s | pasa |
| RF-6 apertura | clic en entrar → entrevista visible e interactiva | ≤ 2 s | 1,63 s (título a 1,41 s) | 1,65 s (título a 1,43 s) | 1,64 s (título a 1,41 s) | 1,65 s | pasa |
| RF-17 aviso | aparición → desaparición del DOM (primera pregunta) | ≤ 4 s | 3,85 s | 3,88 s | 3,88 s | 3,88 s | pasa (margen 0,12 s) |
| RF-12 saltar texto | clic/Enter → texto completo | inmediato | Enter: 5 ms | clic: 1 ms | — | 5 ms | pasa |
| RF-17 cierre por tecla | Escape → aviso retirado | 1 interacción | 0,48 s (1 tecla) | — | — | 0,48 s | pasa |
| RF-5 idioma → carga | confirmar → vista de carga montada y anterior retirada | ≤ 0,6 s | 0,46 s | 0,46 s | 0,47 s | 0,47 s | pasa (hasta montaje; no incluye animaciones internas de la vista nueva) |
| RF-5 carga → puerta | clic en comenzar → vista anterior retirada | ≤ 0,6 s | 0,22 s | 0,23 s | 0,24 s | 0,24 s | parcial: vista anterior retirada y nueva montada; la cota «ninguna animación finita en curso» fue 0,93 s (EN), que incluye la entrada propia de la escena (D1, 0,7 s). La cortina no se aisló: **PENDIENTE** de veredicto estricto |
| RF-5 puerta → entrevista | (ver RF-6) | ≤ 0,6 s | — | — | — | — | cubierto por RF-6 (1,65 s ≤ 2 s); la parte de cortina sola queda **PENDIENTE** |

Sin medir (PENDIENTE): RF-2 (impulso ≥ 5 puntos en < 0,2 s; la prueba con evento sintético fue inconcluyente: salto 0 → 15 % en 12 ms no distingue impulso de progreso natural), RF-8 (movimiento reducido ≤ 0,5 s; las herramientas del panel no permiten emular `prefers-reduced-motion`), RF-18 (celebraciones y sacudida ≤ 2,5 s, una por una) y duraciones individuales de cada fila A–H.

### 10b. Fluidez (hueco de fotograma > 500 ms = congelamiento)

| Pasada | Huecos > 100 ms | Congelamientos > 500 ms | Tareas largas (> 50 ms) | Desbordamiento horizontal | Veredicto |
|--------|-----------------|-------------------------|-------------------------|---------------------------|-----------|
| EN desktop, idioma → aviso de primera pregunta | 0 | 0 | 0 | — | pasa |
| ES 375 px, idioma → aviso de primera pregunta | 0 (tras el arranque de la página) | 0 | 0 | 0 (ancho de documento 375) | pasa |
| ES desktop, 1.ª pasada (con consultas de árbol de accesibilidad) | 2 | 2 de ≈ 1,0 s: montaje de la entrevista (+1,25 s tras entrar) y primer montaje de la lista de preguntas | 0 | — | **NO PASA** (observado) |
| ES desktop, pasada de teclado | 3 | 2 de ≈ 1,0 s: montaje de la entrevista (+1,26 s tras entrar) y tras enviar la sugerencia | 0 | — | **NO PASA** (observado) |
| ES desktop con servidor de desarrollo | 1 | 1 de 1,03 s en el montaje de la entrevista | 0 | — | (referencia, no oficial) |

Lectura: en escritorio y en español el hueco de ≈ 1,0 s se repitió en 3 de 3 pasadas al montar la entrevista, sin tareas largas de JavaScript (apunta a pintado/composición, no a código), y no apareció en EN escritorio ni en ES 375 px. La causa no está determinada: puede depender de la máquina o del panel. Requiere repetición por el dueño en su navegador (ES, escritorio, DevTools > Rendimiento). Los huecos de 2,24 s y 0,30 s en 375 px ocurrieron antes de la primera interacción, con el panel todavía oculto (rAF pausado), y no cuentan.

Dos ciclos «por animación» (RNF-1): NO se observaron visualmente las ≈ 40 filas A–H de dos ciclos cada una. Lo registrado arriba es el monitor de huecos durante 3 pasadas completas de escritorio (EN, ES, ES teclado) y 1 de 375 px, no la observación fila por fila: **PENDIENTE** para el dueño.

### 10c. Escucha de sonidos G1–G12

**PENDIENTE (dueño).** El entorno no tiene salida de audio ni forma de escuchar; no se estima nada. Solo se verificó por tecla que el interruptor de silencio (G12) cambia de etiqueta («Silenciar» y «Activar sonido»), alterna `aria-pressed` y persiste en `localStorage` (`lk-arcade-muted` 1 y 0), con foco visible. Filas G1–G11: escucha con volumen moderado y homogéneo sin hacer.

### 10d. Recorrido solo-teclado (ES, escritorio, build de producción)

| # | Acción | Resultado | Foco visible | Veredicto |
|---|--------|-----------|--------------|-----------|
| 1 | Elegir idioma (← →) | ArrowLeft preselecciona EN (título «Choose your language»), `lang` sigue en `es` hasta confirmar | tarjetas: contorno 2 px | pasa |
| 2 | Confirmar idioma (Enter) | pasa a carga; `lang` = `en` | sí | pasa |
| 3 | Comenzar (Enter) | el botón recibe el foco al habilitarse; Enter pasa a la puerta | 2 px + anillo | pasa |
| 4 | Entrar (Enter) | el botón recibe el foco automático; Enter abre la puerta; el foco pasa al tutorial («¡Vamos!») | 2 px | pasa |
| 5 | Elegir mundo y pregunta (Tab/Enter) | funcionan; Tab recorre mundos y preguntas con foco visible | 2 px en todos | pasa, con salvedad: al activar el mundo o la pregunta el foco cae a `body` (tarjeta desmontada) hasta el siguiente Tab |
| 6 | Saltar texto (Enter) | texto completo en 5 ms (la tecla es global, foco en `body`) | n/a | pasa |
| 7 | Cerrar avisos (Escape) | 1 tecla retira el aviso (0,48 s); el aviso de modo infinito no bloquea | sí | pasa |
| 8 | Cerrar tutorial (Enter en «¡Vamos!») | cierra; el foco vuelve a `#main` | sí | pasa |
| 9 | Activar modo infinito (Enter) | `aria-pressed` pasa a `true`, aparece aviso textual sin bloquear | 2 px | pasa |
| 10 | Silenciar (Enter ×2) | etiqueta y estado cambian, persiste | 2 px | pasa |
| 11 | Enviar sugerencia (Tab, escribir, Tab ×3, Enter) | éxito degradado «¡GRACIAS! Recibida, pero el aviso no se envió» (sin clave); Tab llega a OK; Enter cierra y el foco vuelve al botón de origen | sí; tras enviar el foco cae a `body` hasta el siguiente Tab | pasa, con salvedad |

Hallazgo bloqueante en el salto al contenido (RF-2 de la 007, T2): en la pantalla de idioma, Tab revela «Saltar al contenido» (contorno 2 px + anillo, correcto), pero **Enter sobre ese enlace también confirma el idioma y avanza a la carga** (reproducido 2 de 2; el atajo de Enter de la pantalla de idioma recibe el evento del enlace). Contradice «sin saltar vistas» de RF-2. Pendiente de corregir en el código antes de cerrar la 007.

Cobertura de contextos de foco (RF-4): idioma, carga, puerta, entrevista, aviso, tutorial y sugerencia vistos con teclado: contorno `solid` de 2–3 px en todos los elementos recorridos (`:focus-visible` verdadero). Contacto (enlaces/redes del pie y mundo «Contacto y portfolio») no recorrido en esta pasada: **PENDIENTE**. Teclado completo en EN: **PENDIENTE** (solo se verificó ←, Enter y `lang`).
