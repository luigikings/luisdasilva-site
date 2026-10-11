# Spec 007 — Accesibilidad y cierre

Estado: implementada

## Contexto y objetivo

El portfolio arranca declarado en inglés aunque la visita empiece en español, no ofrece salto directo al contenido ni regiones reconocibles por lector de pantalla, el foco de teclado no está garantizado en todos los controles, la insignia de mundo completado vive fuera del diccionario bilingüe, los contrastes neón sobre fondo oscuro no tienen medida registrada, la vista previa del enlace está rota (imagen inexistente y dirección ajena) y queda pendiente la medición manual con cronómetro de la spec 001. Esta spec cierra esas brechas para que un reclutador con teclado o lector complete la visita, el enlace de candidatura previsualice bien y la 001 quede verificada, sin reescribir animaciones, tiempos ni textos.

## Usuarios

- **Reclutador/a con teclado o lector de pantalla:** quiere recorrer idioma, carga, puerta, entrevista, contacto y sugerencia sin ratón y sin perderse.
- **Visitante que comparte el enlace:** quiere que la tarjeta de vista previa muestre imagen, título y descripción correctos.
- **Responsable de la verificación 001:** quiere la re-medición manual completa registrada, sin valores estimados.

## Historias de usuario

- HU-1. Como visitante con lector de pantalla, quiero que la página declare mi idioma y exponga regiones con nombre para orientarme desde el primer segundo.
- HU-2. Como visitante solo-teclado, quiero ver siempre dónde está el foco y completar idioma, carga, puerta, entrevista, avisos, tutorial, sugerencia y contacto sin ratón.
- HU-3. Como reclutadora, quiero leer cada texto (incluida la insignia de mundo completado) en mi idioma y con contraste legible sobre el fondo oscuro.
- HU-4. Como candidato que comparte su enlace, quiero que la vista previa muestre imagen, título y descripción fijos y correctos con la dirección real.
- HU-5. Como responsable de la 001, quiero la re-medición manual completa registrada para cerrar su verificación pendiente.

## Definiciones

- **Idioma declarado:** el idioma que lectores de pantalla y navegadores usan para anunciar la página; observable como atributo de idioma de la página. Español por defecto desde la primera carga.
- **Texto grande:** texto equivalente a 18 pt normal o 14 pt en negrita, o mayor.
- **Checklist de contraste:** registro fila por fila de cada combinación de texto sobre fondo con su valor medido a 2 decimales y su veredicto pasa/no-pasa, sin redondeo a favor.
- **Congelamiento:** imagen quieta no intencionada de más de 500 ms durante una animación (pausas intencionadas de guion no cuentan).
- **Vista previa del enlace:** la tarjeta que muestran redes y mensajerías al pegar la dirección (imagen, título y descripción). Es un juego único de metas fijas en español: los rastreadores no ejecutan guiones, así que no hay conmutación por idioma.
- **Regiones cerradas:** lista cerrada de regiones con nombre (ver RF-3); no se aceptan regiones sin nombre ni roles fuera de la lista.
- **Sin atajos:** el flujo obligatorio idioma → carga → puerta → entrevista se mantiene; el salto al contenido mueve el foco dentro de la vista activa sin saltar vistas.

## Requisitos funcionales

- RF-1: CUANDO la página carga por primera vez, EL SISTEMA declara español como idioma de la página desde el primer anuncio; CUANDO el visitante confirma o cambia el idioma entre español e inglés, EL SISTEMA actualiza el idioma declarado al idioma elegido y lo mantiene durante toda la visita. El mecanismo observable es el atributo de idioma de la página.
- RF-2: EL SISTEMA ofrece en todas las vistas un salto directo al contenido principal con destino único `#main`. CUANDO el visitante pulsa Tab hasta revelarlo y pulsa Enter (1 interacción), EL SISTEMA mueve el foco al contenido principal de la vista activa sin saltar vistas. MIENTRAS recibe el foco, EL SISTEMA lo muestra en posición fija con un contorno que cumple contraste AA.
- RF-3: MIENTRAS el visitante recorre cualquier vista, EL SISTEMA expone exactamente estas regiones con rol y nombre cerrado: cabecera (título e interruptores de idioma y sonido), contenido principal (vista activa), navegación de la entrevista (mundos y preguntas) y pie; más los diálogos de tutorial y avisos expuestos como diálogo con nombre cuando están visibles. Ninguna vista expone regiones fuera de esta lista ni regiones sin nombre (la barra rápida de CV, GitHub y correo no es una región de navegación propia). Excepción aceptada (ver «Decisiones y aceptaciones», 2026-10-12): el pie existe solo en la vista de entrevista, dentro del contenido principal, con su nombre y sin contacto ni redes.
- RF-4: MIENTRAS el visitante navega con teclado por idioma, carga, puerta, entrevista, avisos, tutorial, sugerencia y contacto, EL SISTEMA muestra en cada elemento interactivo un indicador de foco mínimo de contorno de 2 px con contraste AA frente al fondo adyacente, que nunca queda oculto por decoraciones ni celebraciones y no depende de animación (visible también con movimiento reducido). El barrido exhaustivo cubre los 8 contextos: idioma, carga (incluido impulso de progreso y botón de comenzar), puerta, entrevista, avisos, tutorial, sugerencia y contacto.
- RF-5: CUANDO el visitante completa un mundo, EL SISTEMA muestra la insignia de mundo completado con el literal del diccionario bilingüe (español `COMPLETADO` / inglés `CLEAR`). «Mismo significado» = comunica el mismo estado de mundo completado en ambos idiomas, sin texto sin traducir.
- RF-6: EL SISTEMA mantiene todo texto informativo o interactivo sobre fondo oscuro con contraste mínimo de 4.5:1 en texto normal y 3:1 en texto grande, recogido en una checklist con valor medido a 2 decimales y veredicto por combinación. Alcance: todos los textos informativos e interactivos, medidos sobre el fondo más oscuro y el más claro de cada estado; exentos solo el decorativo puro y los logotipos según WCAG, listados como exentos en la checklist. Ajustar valores de color para alcanzar el umbral está permitido y no cuenta como reescritura de textos ni tiempos.
- RF-7: EL SISTEMA sirve la imagen de vista previa como imagen existente sin texto (solo logo y neón) de 1200x630 en la ruta fija `public/og-image.png`, con peso inferior a 500 KB y referenciada por las metas. SI la imagen falta, tiene otras dimensiones o no está referenciada, ENTONCES EL SISTEMA no pasa la verificación de vista previa.
- RF-8: CUANDO se comparte la dirección canónica `https://luisdasilva-site.vercel.app/`, EL SISTEMA presenta la dirección canónica, la imagen y las metas de vista previa apuntando a esa dirección y a su imagen, sin direcciones ajenas ni rutas inexistentes.
- RF-9: EL SISTEMA presenta un juego único de metas fijas en español (título, descripción y tarjetas de vista previa con la dirección canónica) y documenta que no hay conmutación por idioma porque la página de entrada es estática y los rastreadores no ejecutan guiones. No existe mezcla de idiomas posible en la tarjeta.
- RF-10a: CUANDO se ejecuta la verificación de tiempos, EL SISTEMA deja registrados los umbrales de la 001 medidos con cronómetro (carga ≤ 3 s, puerta ≤ 8 s, transiciones ≤ 0,6 s y demás umbrales de su protocolo), una vez por idioma, registrando el MAYOR valor (peor caso) con su veredicto, en `specs/001-suavizar-arcade-profesional/audit.md`, sin valores estimados.
- RF-10b: CUANDO se ejecuta la verificación de fluidez, EL SISTEMA deja registrados 2 ciclos observados en escritorio y en móvil estrecho de 375 px por animación, con cero congelamientos según la definición, con valor observado y veredicto en la misma tabla.
- RF-10c: CUANDO se ejecuta la verificación de sonido, EL SISTEMA deja registrada la escucha de los 12 eventos de sonido del inventario de la auditoría (G1–G12), con volumen moderado y homogéneo y equivalente visual, con veredicto por evento en la misma tabla.
- RF-10d: CUANDO se ejecuta la verificación solo-teclado, EL SISTEMA deja registrado el recorrido completo de las 11 acciones (elegir idioma, confirmar, comenzar, entrar, elegir mundo y pregunta, saltar texto, cerrar avisos y tutorial, activar modo infinito, silenciar y enviar sugerencia) con foco siempre visible, con veredicto por acción en la misma tabla.
- RF-11: CUANDO aparece un aviso de logro o celebración, EL SISTEMA lo descarta solo en un máximo de 4 segundos o con 1 interacción, sin bloquear botones ni preguntas.
- RF-12: MIENTRAS hay avisos, tutorial o celebraciones visibles, EL SISTEMA mantiene el foco sin captura: todos los botones y preguntas siguen accionables y no es obligatorio cerrar el aviso para continuar. Este requisito aplica solo a avisos y celebraciones; el tutorial es un diálogo modal explícito con cierre evidente, excepción aceptada (ver «Decisiones y aceptaciones», 2026-10-12).

## Requisitos no funcionales

- RNF-1 (Accesibilidad medible): el flujo completo (idioma, carga, puerta, entrevista, avisos, tutorial, sugerencia, contacto) se completa solo-teclado; y estos elementos de estado no dependen solo del color ni solo del sonido: monedas restantes, insignia de mundo completado, aviso de logro, estado de silencio y errores de formulario (cada uno tiene texto o icono además del color o sonido).
- RNF-2 (Bilingüe contable): equivalencia español/inglés verificada por conteo: las 4 regiones de RF-3 más los interactivos de cada vista existen en igual número, con el mismo significado y sin texto sin traducir (salvo nombres propios y direcciones web); la vista previa queda fuera del conteo por ser juego único fijo en español según RF-9.
- RNF-3 (Guía): el archivo `README.md` de la raíz documenta el salto al contenido, el deep-link silencioso, el idioma declarado inicial y la vista previa del enlace; «cuando afecte a su uso» = exactamente esos cuatro temas.

## Casos límite

- Estilos desactivados: el orden de lectura es el orden del documento (idioma, contenido principal, contacto) sin información solo visual o sonora.
- Imagen de vista previa ausente, con otras dimensiones o con peso ≥ 500 KB: la verificación de vista previa falla; no se acepta tarjeta sin imagen como pasa.
- Zoom a 200 % con reflujo: textos, botones y avisos permanecen visibles y sin solapes en escritorio y en 375 px.
- Movimiento reducido activado: el indicador de foco y el salto al contenido funcionan sin depender de animación.
- Carga solo-teclado: el impulso de progreso y el botón de comenzar son accionables con teclado y el botón recibe el foco al habilitarse.
- Elemento deshabilitado (p. ej. comenzar antes de completar la carga): el foco lo salta sin quedar atrapado ni invisible, y el estado deshabilitado se comunica por texto además del color.
- Estados hover, focus y disabled de cada control: el contraste del texto se mide en cada estado aplicable dentro de la checklist.
- Fallo de red al pedir la imagen (imagen local estática): fuera de alcance; la imagen es local y su verificación es existencia, dimensiones, peso y referencia.
- Cambio de idioma a mitad de la entrevista: el idioma declarado, la insignia y el salto al contenido cambian juntos sin textos mezclados.
- Combinación en el borde del umbral (p. ej. 4.4:1 frente a 4.5:1): se registra como no-pasa con su valor a 2 decimales, sin redondeo a favor.

## Fuera de alcance

- Reescribir animaciones, tiempos de la 001 o textos (respuestas, proyectos, puerta, tutorial); solo se ajustan valores de color por contraste y se mide lo existente.
- Posicionamiento en buscadores: la skill de SEO técnico no aplica por decisión vigente sin SEO; solo la tarjeta de vista previa del enlace.
- Backend, correos, límites anti-spam o cambios de despliegue.
- Nuevas dependencias o bases de datos.
- Nuevas secciones, páginas o idiomas más allá de español e inglés; la vista previa es juego único fijo en español.

## Criterios de finalización

- RF-1–RF-5, RF-11 y RF-12 verificados manualmente con teclado en español e inglés, en escritorio y en 375 px; con lector de pantalla (NVDA o VoiceOver) cuando esté disponible y, si no, con inspección de regiones con nombre y de foco visible (la pasada con lector queda pendiente del dueño, ver «Decisiones y aceptaciones»).
- Checklist de contraste completa a 2 decimales: 0 combinaciones informativas o interactivas por debajo de 4.5:1 (normal) o 3:1 (grande); exentos listados. Medición aceptada con script propio (fórmula WCAG sobre los colores del código); la lectura con DevTools o axe sobre la web renderizada queda como verificación pendiente del dueño y no bloquea el cierre.
- Tarjeta de vista previa comprobada con validador o inspección de metas más petición de la imagen con respuesta 200: imagen existente de 1200x630 sin texto y menos de 500 KB, metas fijas en español con dirección canónica real, sin rutas inexistentes.
- Re-medición completa de la 001 registrada en su tabla de auditoría (10a cronómetro con el mayor por idioma, 10b dos ciclos más 375 px con cero congelamientos, 10c escucha G1–G12, 10d 11 acciones solo-teclado), sin estimaciones ni filas pendientes.
- Flujo ES/EN → puerta → entrevista → sugerencia correcto y compilación de frontend y backend en verde.
- No quedan dudas abiertas.

## Decisiones y aceptaciones

- 2026-10-12, aceptación por escrito de incumplimiento menor (decisión del usuario): RF-1 de la 001 (carga: confirmar idioma → «Comenzar» habilitado, límite ≤ 3 s) se mide en 3,17 s ES, 3,11 s EN y 3,29 s ES a 375 px (peor caso 3,29 s; exceso de 0,11–0,29 s). Medido con el navegador integrado sobre el build de producción (entorno de pruebas, no el navegador del dueño). Se acepta como incumplimiento menor; el límite de 3 s de la 001 NO se modifica. Pendiente repetir la medición en el navegador del dueño. Registro: `specs/001-suavizar-arcade-profesional/audit.md`, sección «Re-medición manual (spec 007, T9)».
- 2026-10-12, bug de T9 a corregir como T11 (decisión del usuario): Enter sobre «Saltar al contenido» en la pantalla de idioma también confirma el idioma y avanza, contra RF-2 («sin saltar vistas»). Se corrige en T11, antes de T10; sin cambios de RF.
- 2026-10-12, alcance de la verificación pendiente: lo no medido en T9 (escucha G1–G12, filas A–H fila a fila, RF-2 impulso, movimiento reducido, RF-18, teclado completo en EN y contacto, hueco de ≈ 1 s al montar la entrevista en ES de escritorio, foco que cae a `body` tras activar mundo/pregunta/enviar sugerencia) es responsabilidad del dueño y no bloquea el cierre. Esto matiza el criterio «sin filas pendientes» de la re-medición: las filas pendientes quedan registradas como protocolo explícito, nunca como estimadas.
- 2026-10-12, RF-3 pie (decisión del usuario, «Aceptar por escrito»): el pie actual (con nombre accesible, dentro del contenido principal, solo en la vista de entrevista, con «Built with ♥», sin contacto ni redes) queda como está. No se añade UI nueva ni pie global; RF-3 se da por aceptado con esta excepción. Además, la barra rápida de CV/GitHub/correo no debe emitir un segundo landmark de navegación (se corrige en T12).
- 2026-10-12, RF-12 tutorial (decisión del usuario, «Aceptar excepción escrita»): el tutorial es un diálogo explícito modal con cierre evidente (exigido por la 001). La ausencia de captura de foco de RF-12 aplica solo a avisos y celebraciones.
- 2026-10-12, RF-6 herramienta de medición (decisión del usuario, «Aceptar por escrito»): la medición de contraste se hizo con script propio (fórmula WCAG sobre los colores del código; 195 combinaciones, 0 no-pasa), no con DevTools ni axe. La lectura con DevTools/axe sobre la web renderizada queda como verificación pendiente del dueño y no bloquea el cierre.
- 2026-10-12, lector de pantalla (NVDA/VoiceOver): la pasada con lector queda pendiente del dueño, registrada explícitamente; no bloquea el cierre. Se mantiene la inspección de regiones con nombre y de foco visible como verificación disponible.

## Dudas abiertas

- Ninguna pendiente. Las 4 decisiones (imagen nueva sencilla sin texto, dirección canónica `https://luisdasilva-site.vercel.app/`, umbral WCAG AA medible y re-medición completa con registro) las tomó el usuario el 2026-10-11.
