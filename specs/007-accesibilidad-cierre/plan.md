# Plan 007 — Accesibilidad y cierre

Spec aprobada: `specs/007-accesibilidad-cierre/spec.md`.

## Archivos y responsabilidades

- `frontend/index.html` — idioma inicial declarado ES y juego único de metas fijas ES con dirección canónica e imagen referenciada. Cubre RF-1 (inicial), RF-8, RF-9.
- `frontend/public/og-image.png` (nueva) — imagen de vista previa 1200x630 sin texto, solo logo/neón, <500 KB. Cubre RF-7.
- Vista raíz y máquina de vistas (`InterviewExperience` y vistas idioma/carga/puerta/entrevista) — salto global a `#main` sin saltar vistas, destino único y regiones con nombre por vista. Cubre RF-2, RF-3, RF-12.
  - T11 (corrección tras T9): el atajo de Enter de la pantalla de idioma no debe actuar cuando el evento proviene del enlace de salto (ni de otro control con su propia activación); el salto solo mueve el foco a `#main`. Los botones de idioma y el atajo de confirmar conservan Enter/Espacio. Cubre RF-2, RF-12. Se ejecuta antes de T10.
- Hoja de estilos global — indicador de foco mínimo 2 px con contraste AA, visible con movimiento reducido y en los 8 contextos; ajustes de color solo si la checklist falla. Cubre RF-2 (visible), RF-4, RF-6 (ajuste).
- Diccionario bilingüe — literales de la insignia de mundo completado ES/EN. Cubre RF-5.
- Componentes de entrevista, avisos y tutorial — insignia desde diccionario, avisos que se descartan solos o con 1 interacción y foco sin captura. Cubre RF-5, RF-11, RF-12.
- `specs/001-suavizar-arcade-profesional/audit.md` — registro de la re-medición 10a–10d con valores medidos y veredictos, sin estimaciones. Cubre RF-10a, RF-10b, RF-10c, RF-10d.
- `README.md` (raíz) — documenta salto al contenido, deep-link, idioma declarado inicial y vista previa, solo si falta alguno. Cubre RNF-3.
- Checklist de contraste (anexa al cierre de la spec) — filas por combinación texto/fondo con valor a 2 decimales y veredicto, más exentos listados. Cubre RF-6 y parte de RNF-1.

## Lógica separada de la interfaz

- La medida de contraste es lectura de pares color/fondo con herramienta externa; la interfaz solo aplica los valores de color resultantes. Sin lógica de negocio nueva.
- El descarte de avisos usa temporizador y cierre por interacción ya existentes; no se añade estado global nuevo.
- El idioma declarado sigue al idioma elegido ya existente; la novedad es propagarlo al atributo observable de la página.

## Decisiones

- D-1: metas fijas ES únicas en la página estática frente a conmutar metas por idioma con guion. Se elige fijas porque los rastreadores no ejecutan guiones (RF-9); se descarta la conmutación por no observable para crawlers.
- D-2: imagen sin texto frente a imagen con título. Se elige sin texto (solo logo/neón) por decisión de usuario y para evitar texto ilegible o mezcla de idiomas; se descarta la imagen con texto.
- D-3: salto global a `#main` que mueve foco dentro de la vista activa frente a enlaces por vista o salto de vista. Se elige global único por compatibilidad con «sin atajos»; se descartan los enlaces por vista por duplicar mecanismos.
- D-4: ajustar valores de color frente a reescribir textos o tiempos para pasar contraste. Se elige ajustar color porque la spec lo permite y preserva contenido y animaciones; se descarta reescribir textos/tiempos.
- D-5: re-medición manual con cronómetro frente a estimación por código. Se elige cronómetro real con registro del mayor por idioma porque la 001 lo exige y el código solo da topes; se descarta dar por válido el cálculo.

## Estrategia de verificación

Sin navegador ni MCP en el entorno de implementación: lo estructural se verifica por código (atributo de idioma, metas, regiones con nombre, foco, literales en diccionario, imagen existente con dimensiones y peso) más builds y lint; lo visual y temporal queda en protocolo manual pendiente explícito donde aplique. Comandos según AGENTS.md: `cd frontend && npm run lint`, `cd frontend && npm run build`, `cd backend && npm run build`, más verificación manual del flujo ES/EN → puerta → entrevista → sugerencia.
- RF-1: inspección de atributo inicial ES y cambio con idioma + manual con lector cuando disponible.
- RF-2, RF-3, RF-4, RF-11, RF-12: barrido de teclado por los 8 contextos en ES/EN + lector (NVDA/VoiceOver) cuando disponible, si no inspección de regiones/foco; protocolo pendiente si no hay lector.
- RF-5: inspección de diccionario + manual ES/EN.
- RF-6: medición DevTools/axe a 2 decimales por combinación y estado; protocolo pendiente donde no haya herramienta.
- RF-7, RF-8, RF-9: inspección de metas + imagen (existe, 1200x630, <500 KB, referenciada) + validador o `curl` de metas y petición de imagen con 200.
- RF-10a–10d: cronómetro real 1 vez/idioma (mayor), 2 ciclos escritorio + 375 px, escucha G1–G12, 11 acciones solo-teclado; registro en audit.md. Sin navegador se deja como protocolo pendiente explícito, nunca como estimado.

## Cobertura RF por parte

- Entrada estática (index + imagen): RF-1 (inicial), RF-7, RF-8, RF-9.
- Navegación y regiones: RF-2, RF-3, RF-12.
- Foco y color: RF-2 (visible), RF-4, RF-6.
- Diccionario e insignia: RF-5.
- Avisos y tutorial: RF-11, RF-12.
- Registro 001: RF-10a, RF-10b, RF-10c, RF-10d.
- Guía y checklist: RNF-1 (lista de estados), RNF-2 (conteo), RNF-3, RF-6 (evidencia).
