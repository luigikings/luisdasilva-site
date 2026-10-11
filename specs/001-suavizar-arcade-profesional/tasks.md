# Tasks 001 — Suavizar arcade hacia profesional

Orden de dependencia (cada tarea 20–30 min). Verificación global: manual ES/EN
+ 375 px con cronómetro (RNF-4) y build/lint en verde.

- [x] **T1. Acortar la carga a ≤ 3 s con boost inmediato.** RF-1, RF-2
  - Hecho cuando: cronómetro confirma carga completa ≤ 3 s sin tocar nada y cada clic/tecla suma ≥ 5 puntos visibles en < 0,2 s; el botón de comenzar queda habilitado y con foco.
- [x] **T2. Puerta acotada con textos acordados.** RF-3, RF-4, RF-20
  - Hecho cuando: el botón de entrar aparece ≤ 8 s sin interacción, cada mensaje tarda ≤ 3 s, el botón sale tras el 1.er mensaje sin ocultarse después, y los 4 mensajes son los textos acordados ES/EN que pasan la checklist (sin mayúsculas sostenidas, sin ??/!!, sin vocales alargadas).
- [x] **T3. Transiciones ≤ 0,6 s y apertura ≤ 2 s.** RF-5, RF-6
  - Hecho cuando: cada cambio de vista completa cortina + fundido en ≤ 0,6 s con la vista nueva respondiendo al primer intento, y el clic en entrar muestra la entrevista en ≤ 2 s (doble clic = una sola apertura).
- [x] **T4. Destellos, glitch y neón suavizados.** RF-9, RF-10, RF-11
  - Hecho cuando: máximo 1 destello por cambio de vista de ≤ 300 ms y velos ≤ 35 % sin bucles; el glitch ocurre 1 vez al entrar (≤ 1 s); ningún parpadeo oculta texto en 2 ciclos observados.
- [x] **T5. Movimiento reducido total.** RF-7, RF-8
  - Hecho cuando: con el ajuste activado, las 4 vistas muestran contenido directo sin animación; activarlo a mitad deja el estado final en ≤ 0,5 s; el flujo y los textos son idénticos.
- [x] **T6. Entrevista sin fricción esencial + celebraciones + tutorial.** RF-12, RF-13, RF-17, RF-18, RF-19
  - Hecho cuando: CV, proyectos, GitHub y contacto se abren con 0 monedas en ≤ 2 interacciones sin exigir modo infinito; el texto largo se completa con clic/Enter; los 6 hitos avisan ≤ 4 s sin bloquear; celebraciones/sacudidas terminan ≤ 2,5 s sin repetirse; el tutorial cierra con botón etiquetado o Escape devolviendo el foco.
- [x] **T7. Sonido opcional, visible y moderado.** RF-15, RF-16
  - Hecho cuando: los 11 eventos suenan con equivalente visual, el interruptor se ve en las 4 vistas y conserva su estado al recargar, y la escucha confirma volumen homogéneo con golpes/escritura suavizados.
- [x] **T8. Teclado completo y equivalencia ES/EN.** RF-14, RF-21
  - Hecho cuando: las 11 acciones de RF-21 se completan solo con teclado con foco visible, y el recorrido ES y EN muestra los mismos elementos con igual significado y nada sin traducir.
- [x] **T9. Rellenar la auditoría (tablas A–G).** RNF-1, RNF-2, RF-16
  - Hecho cuando: todas las filas de `audit.md` tienen duración medida, veredicto y notas en escritorio + 375 px, con 0 filas pendientes y 0 tirones (2 ciclos por animación); lo no listado se añadió como fila.
- [x] **T10. Verificación final y build en verde.** Todos los RF, RNF-4
  - Hecho cuando: recorrido ES/EN → puerta → entrevista → sugerencia OK en escritorio + 375 px, `npm run lint` y `npm run build` en verde en frontend y backend, y la spec puede marcarse implementada.
  - T10 (2026-10-10, sin navegador disponible): lo automatizable en verde — lint front sin avisos; build front (`tsc && vite build`) y back (`tsc`) OK; `tsc` garantiza ES/EN estructural (22 preguntas + 6 logros tipados en ambos idiomas); checklist RF-20 programático OK (8 textos puerta); backend vivo: `POST /api/suggestions` válida → 201, inválida → 400; front sirve 200. Pendiente para el validador (con protocolo RNF-4): cronómetro ES/EN en escritorio + 375 px, 2 ciclos/animación, escucha G1–G12, recorrido solo-teclado y movimiento reducido. Servidores dev dejados en marcha para la validación manual: front http://localhost:5173 (proxea /api) + back http://localhost:3000 (con `SUGGESTION_EMAIL_TO`/`RESEND_API_KEY` ficticios solo en memoria).
