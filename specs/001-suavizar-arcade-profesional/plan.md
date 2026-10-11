# Plan 001 — Suavizar arcade hacia profesional

Parte de la spec aprobada `spec.md` (+ inventario `audit.md`). Sin nuevas
dependencias, sin BBDD, sin cambios de backend ni de despliegue.

## 1. Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| Pantalla de carga (vista + duración base) | Duración total ≤ 3 s, boost ≥ 5 puntos reflejado en < 0,2 s, botón de comenzar habilitado y con foco | RF-1, RF-2 |
| Pantalla de puerta (secuencia + apertura) | Botón de entrar ≤ 8 s, cada mensaje ≤ 3 s, botón tras el 1.er mensaje, apertura completa ≤ 2 s, textos acordados | RF-3, RF-4, RF-6, RF-20 |
| Diccionario ES/EN + líneas de puerta | Sustituir los 4 mensajes por los textos acordados (mismas claves, ambos idiomas) | RF-14, RF-20 |
| Transiciones entre vistas (cortina + fundido) | Duración total ≤ 0,6 s y vista nueva interactiva al terminar | RF-5 |
| Utilidad de destello/velo a pantalla completa | Máximo 1 por cambio de vista, ≤ 300 ms, opacidad ≤ 35 %, nunca en bucle | RF-9 |
| Logo de idioma (glitch) + cartel de neón | Glitch 1 vez al entrar ≤ 1 s; neón sin ocultar texto | RF-10, RF-11 |
| Entrevista: selección de pregunta (exención) | CV, proyectos, GitHub y contacto nunca bloqueados por monedas ni exigen modo infinito | RF-13 |
| Entrevista: conversación (salto de texto) | Clic en la caja o Enter muestra el texto completo | RF-12 |
| Entrevista: avisos de logro + celebraciones + sacudidas | Avisos ≤ 4 s o 1 clic sin bloquear; efectos ≤ 2,5 s sin repetición ni bloqueo | RF-17, RF-18 |
| Entrevista: tutorial de entrada | Aparición actual + cierre evidente (botón con etiqueta + Escape, 1 interacción, devuelve el foco) | RF-19 |
| Interruptor de sonido + motor de efectos | Visible en todas las vistas, conserva estado al recargar, volumen moderado y homogéneo, golpes/escritura suavizados | RF-15, RF-16 |
| Todas las vistas (revisión movimiento reducido) | Con el ajuste activado: contenido directo; si se activa a mitad: estado final ≤ 0,5 s | RF-7, RF-8 |
| Todas las vistas (revisión teclado y bilingüe) | Todas las acciones de RF-21 solo con teclado y foco visible; equivalencia ES/EN de RF-14 | RF-14, RF-21 |
| `audit.md` (tablas A–G) | Registrar medido/veredicto por fila; añadir filas si aparece algo no listado | RNF-1, RNF-2, RF-16 |

Sin cambios: sistema de monedas (presupuestos, modo infinito, Konami),
orden del flujo, backend, emails, despliegue.

## 2. Lógica separada de la interfaz

- **Regla de exención de monedas** (pura, testeable a mano): función que decide
  si una pregunta exige monedas a partir de (pregunta, ya respondida, modo
  infinito). Las 4 preguntas esenciales devuelven «siempre accesible».
- **Presupuesto temporal de la puerta** (puro): función que reparte los 8 s
  entre pausa inicial, golpes, escritura del 1.er mensaje y margen del botón.
- **Finalización con movimiento reducido** (puro): dado el estado de una
  animación (tipeo a medias, transición, celebración), devuelve su estado final
  inmediato. La UI solo lo aplica.
- La UI solo pinta: temporizadores, lienzos de partículas, sonidos y estilos
  quedan fuera de las decisiones (reciben los valores como parámetros).

## 3. Algoritmos (pseudocódigo)

**Exención de monedas (RF-13):**
```
ESENCIALES = {cv, projects, github, contact}
puede_preguntar(pregunta, monedas_grupo, coste, infinita, respondida):
  SI pregunta EN ESENCIALES O respondida O coste == 0 O infinita:
    RETORNAR {bloqueada: falso, cobrar: falso}
  SI monedas_grupo < coste:
    RETORNAR {bloqueada: verdadero, mostrar: aviso + pista_modo_infinito}
  RETORNAR {bloqueada: falso, cobrar: verdadero}
```

**Presupuesto de la puerta (RF-3 + RF-4, total ≤ 8 s):**
```
pausa_inicial ≤ 1,5 s → golpes ≤ 1,5 s → escribir mensaje_0 (≤ 3 s)
AL terminar mensaje_0: mostrar botón_entrar (límite acumulado ≤ 8 s)
mensajes 1..3: escribir (≤ 3 s c/u) + avance automático, SIN ocultar el botón
```

**Apertura (RF-6):**
```
AL clic en entrar (ignorar doble clic: una sola vez):
  reproducir apertura; EN ≤ 2 s mostrar entrevista
```

## 4. Cómo se pinta en la UI

- Carga más corta con el mismo aspecto (barra, terminal, personaje, consejos);
  el boost se nota al instante en número y barra.
- Puerta con los textos acordados, mismo decorado; el botón de entrar aparece
  tras el primer mensaje y los demás siguen solos; la apertura mantiene el
  efecto 3D pero completa el paso en ≤ 2 s.
- Transiciones y destellos idénticos en estilo, solo más breves y tenues
  (velo ≤ 35 %); glitch solo al entrar; neón parpadeando sin apagar el texto.
- Entrevista igual en aspecto; tutorial con botón de cierre con texto visible;
  avisos y celebraciones más breves; interruptor de sonido siempre visible.
- Con movimiento reducido: mismas pantallas y textos, sin animación.

## 5. Datos: formato y compatibilidad

- Solo cambian valores de texto (4 mensajes de puerta ES/EN, mismas claves):
  formato idéntico, sin migración, sin cambios de backend.
- Los costes de monedas en datos NO cambian (la exención vive en la regla
  lógica): partidas y presupuestos existentes siguen válidos.
- La preferencia de silencio sigue siendo ajuste local del navegador
  (no sale del navegador, RNF-3); sin PII nueva.

## 6. Decisiones técnicas (con alternativa descartada)

- **D1. Exención por lista cerrada en la lógica de selección (RF-13).**
  Descartado: poner coste 0 en los datos. Por qué: no se toca el formato de
  datos guardados y la excepción queda explícita y reversible.
- **D2. Reajustar tiempos de la secuencia de puerta existente (RF-3/RF-4).**
  Descartado: reescribir la máquina de la escena. Por qué: el comportamiento
  (golpes, tipeo, autoavance) se conserva; solo cambian duraciones y textos.
- **D3. Supresión de animación por vista ante movimiento reducido (RF-7/RF-8).**
  Descartado: anulación global por CSS. Por qué: el anulado global rompe
  layouts que dependen del estado final animado; por vista se garantiza el
  estado final correcto (y el régimen de 0,5 s a mitad de animación).
- **D4. Ganancia global moderada en el motor de sonido + suavizado puntual
  de golpes y escritura (RF-16).** Descartado: remezclar efecto por efecto.
  Por qué: un solo punto de control garantiza homogeneidad; el retoque puntual
  solo donde la spec exige suavizado.
- **D5. Sin tests automatizados (AGENTS.md/MEMORY.md: no hay script test).**
  Descartado: montar infraestructura de tests para esta spec. Por qué: base
  pequeña y criterios visuales/temporales que exigen observación humana;
  la estrategia es verificación manual protocolizada + build/lint.

## 7. Estrategia de verificación (comando de AGENTS.md)

No hay script de tests: verificación manual + build/lint.

- Recorrido completo ES y EN, en escritorio y móvil 375 px, con cronómetro
  según RNF-4 (1 medida por idioma, registrar la mayor).
- Rellenar `audit.md` (tablas A–G): 0 filas pendientes al cerrar.
- Escucha manual de G1–G11 + persistencia de silencio (G12).
- Recorrido solo-teclado (RF-21) y con movimiento reducido (RF-7/RF-8).
- `npm run lint`, `npm run build` en `frontend/` y `npm run build` en
  `backend/` en verde; flujo ES/EN → puerta → entrevista → sugerencia OK.

## 8. Cobertura RF por parte del plan

- Carga (§1 fila 1): RF-1, RF-2. Puerta (§1 fila 2) + textos (§1 fila 3):
  RF-3, RF-4, RF-6, RF-14, RF-20. Transiciones: RF-5.
- Destellos (§1 fila 5): RF-9. Glitch/neón: RF-10, RF-11.
- Exención (§1 fila 7 + algoritmo): RF-13. Salto de texto: RF-12.
- Avisos/celebraciones: RF-17, RF-18. Tutorial: RF-19.
- Sonido: RF-15, RF-16. Movimiento reducido: RF-7, RF-8.
- Teclado/bilingüe: RF-14, RF-21. Auditoría: RNF-1, RNF-2, RNF-4, RF-16.
