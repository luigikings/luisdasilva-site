# Spec 001 — Suavizar arcade hacia profesional

Estado: implementada

## Contexto y objetivo

El portfolio es una entrevista arcade (selección de idioma → carga → puerta → entrevista con monedas) que hoy se siente más juego que carta de presentación: la carga es larga, la puerta grita y hay destellos, sacudidas y celebraciones que pueden distraer o bloquear. Para un reclutador que llega por enlace directo, eso resta claridad y transmite menos profesionalidad. Esta spec suaviza el tono y acota los tiempos sin quitar la identidad (neón, pixel-art, monedas, logros, código secreto y detalles con encanto), y audita TODAS las animaciones con criterios medibles de fluidez, duración, entendibilidad y accesibilidad. El flujo obligatorio y el sistema de monedas se mantienen por decisión del usuario, con las atenuaciones A–D ya acordadas (tono de puerta suave, velo ligero, sonido moderado, glitch solo al entrar).

## Usuarios

- **Reclutador/a (principal):** quiere entender el perfil, ver proyectos, descargar el CV y contactar en pocos minutos, en español o inglés.
- **Visitante curioso:** disfruta del juego (monedas, logros, código secreto, celebraciones).
- **Persona sensible al movimiento:** necesita usar el portfolio completo sin animaciones.
- **Visitante solo-teclado o con lector de pantalla:** necesita completar el flujo sin ratón ni información solo visual/sonora.

## Historias de usuario

- HU-1. Como reclutadora, quiero completar idioma → carga → puerta → entrevista en tiempos acotados para llegar al contenido sin esperas innecesarias.
- HU-2. Como visitante, quiero entender siempre qué está pasando y qué hacer a continuación para no quedarme bloqueado ante una animación.
- HU-3. Como persona sensible al movimiento, quiero la misma experiencia sin animaciones para usar el portfolio con comodidad.
- HU-4. Como reclutador, quiero abrir el CV, los proyectos/GitHub y el contacto aunque me quede sin monedas para no perder lo esencial.
- HU-5. Como visitante curioso, quiero conservar la diversión arcade (monedas, logros, código secreto, celebraciones) para disfrutar la visita.
- HU-6. Como visitante solo-teclado, quiero hacer todo con el teclado para completar la visita sin ratón.

## Definiciones

- **Tono profesional suave:** texto de bienvenida amable y directo que cumple la lista de aceptación de RF-15 (sin mayúsculas sostenidas, sin signos de cierre dobles, sin vocales alargadas), manteniendo el guiño arcade.
- **Identidad arcade:** neón, pixel-art, sonidos 8-bit, monedas, logros, código secreto y celebraciones (confeti, lluvia de monedas, destellos). Se conserva; solo se aplican las atenuaciones A–D acordadas.
- **Animación fluida:** animación que cumple estas tres condiciones observables: dura lo acotado en su RF, no presenta congelamientos ni saltos visibles en 2 ciclos observados, y no bloquea la interacción fuera de RF-1/RF-6.
- **Animación entendible:** el visitante sabe qué ocurre y qué hacer después porque hay progreso visible, pista textual o botón/acción visible en la misma pantalla.
- **Destello agresivo:** destello de pantalla completa de más de 300 ms, repetido o en bucle, velo de opacidad superior al 35 %, o cualquier parpadeo que oculte un texto por completo.
- **Vista:** cada paso del flujo (idioma, carga, puerta, entrevista).
- **Vista interactiva:** la nueva vista responde al primer intento (su primer botón o enlace ejecuta la acción al primer clic, toque o tecla) y ningún elemento de la vista anterior intercepta la interacción.
- **Sin bloquear:** mientras el efecto o aviso está visible, todos los botones y preguntas siguen accionables, el foco no queda capturado y no es obligatorio cerrarlo para continuar.

## Requisitos funcionales

- RF-1: CUANDO el visitante confirma el idioma, EL SISTEMA completa la carga en un máximo de 3 segundos sin exigir interacción y termina mostrando el botón de comenzar habilitado y con foco (el paso a la puerta requiere 1 clic en ese botón).
- RF-2: CUANDO el visitante interactúa durante la carga (clic, toque o tecla), EL SISTEMA suma un mínimo de 5 puntos al porcentaje visible, lo refleja en la barra y el número en menos de 0,2 segundos, y permite terminar antes de los 3 segundos.
- RF-3: CUANDO el visitante llega a la escena de la puerta, EL SISTEMA muestra el botón de entrar en un máximo de 8 segundos desde la aparición de la escena, sin exigir ninguna interacción previa.
- RF-4: MIENTRAS se escriben los mensajes de la puerta, EL SISTEMA completa cada mensaje en un máximo de 3 segundos, muestra el botón de entrar al terminar el primer mensaje y avanza los mensajes restantes automáticamente sin ocultar el botón.
- RF-5: CUANDO el visitante cambia de vista, EL SISTEMA completa la transición visual en un máximo de 0,6 segundos y deja la nueva vista interactiva según la definición.
- RF-6: MIENTRAS hay animaciones decorativas en pantalla (las enumeradas como decorativas en la tabla de auditoría: fondo, flotaciones, parpadeos, brillos, cursor, celebraciones, avisos y textos flotantes), EL SISTEMA mantiene todos los botones y enlaces accionables; las únicas animaciones que pueden retener al visitante son la carga (RF-1) y la apertura de la puerta, que completa el paso a la entrevista en un máximo de 2 segundos desde el clic.
- RF-7: SI el visitante tiene activada la reducción de movimiento antes de entrar, ENTONCES EL SISTEMA muestra cada contenido directamente, sin escritura carácter a carácter, transiciones, sacudidas, destellos, flotaciones ni celebraciones con movimiento, manteniendo el mismo flujo y los mismos textos; los umbrales de tiempo de RF-1, RF-3 y RF-5 no aplican porque no hay animación que medir.
- RF-8: MIENTRAS la reducción de movimiento se activa a mitad de una animación, EL SISTEMA detiene la animación y muestra su estado final en un máximo de 0,5 segundos.
- RF-9: EL SISTEMA limita los destellos de pantalla completa a un máximo de 1 por cambio de vista, con duración máxima de 300 milisegundos, nunca en bucle, y limita cualquier velo o superposición luminosa a una opacidad máxima del 35 %.
- RF-10: EL SISTEMA reproduce el efecto glitch del logo una sola vez al entrar en la vista de idioma, con duración máxima de 1 segundo, y nunca en bucle.
- RF-11: EL SISTEMA garantiza que ningún parpadeo oculta un texto por completo: todo texto animado permanece visible y distinguible palabra por palabra durante todo el ciclo, verificado observando 2 ciclos completos.
- RF-12: CUANDO se escribe la respuesta en la conversación de la entrevista, EL SISTEMA muestra el texto completo al hacer clic en la caja de respuesta o al pulsar Enter; en la puerta no se exige salto manual porque RF-3 y RF-4 ya acotan el total a 8 segundos con avance automático.
- RF-13: MIENTRAS el visitante está en la entrevista, EL SISTEMA mantiene las preguntas de CV, proyectos, GitHub y contacto siempre accesibles sin monedas (nunca quedan bloqueadas por falta de monedas), a un máximo de 2 interacciones desde la navegación de mundos y preguntas, y sin exigir activar el modo infinito.
- RF-14: EL SISTEMA mantiene la experiencia completa y equivalente en español e inglés en estos grupos: selección de idioma, carga, puerta (incluidos los 4 mensajes), entrevista (título, mundos, las 22 preguntas y respuestas, monedas, HUD, los 6 logros, tutorial, conversación, sugerencias y pie) y títulos de pestaña; la equivalencia se acepta si hay el mismo número de elementos, con el mismo significado y sin texto sin traducir (salvo nombres propios y direcciones web).
- RF-15: EL SISTEMA usa el sonido solo como refuerzo opcional en estos eventos: pasar el cursor, elegir, comenzar, volver, escritura de texto, golpes de puerta, apertura, moneda, error, logro y celebración; toda la información tiene equivalente visual, y el control de silencio está visible desde todas las vistas y conserva su estado al recargar la página en el mismo navegador.
- RF-16: EL SISTEMA reproduce los efectos de sonido a un volumen moderado y homogéneo (ningún efecto aislado destaca por encima del resto de forma molesta; golpes y escritura suenan suavizados), verificado por escucha manual en la auditoría.
- RF-17: CUANDO el visitante alcanza un hito de esta lista cerrada (primera pregunta, mundo completado, mitad, 100 %, modo infinito, código secreto), EL SISTEMA lo celebra con un aviso breve que se descarta solo en un máximo de 4 segundos o con 1 interacción, sin bloquear según la definición.
- RF-18: CUANDO se reproduce una celebración (confeti, lluvia de monedas, ráfaga de partículas) o una sacudida de error, EL SISTEMA la termina en un máximo de 2,5 segundos, sin repetición y sin bloquear según la definición.
- RF-19: CUANDO el visitante entra en la entrevista, EL SISTEMA muestra el tutorial con su comportamiento actual de aparición y un cierre evidente: botón con etiqueta de texto visible y tecla Escape, que lo cierra con 1 interacción y devuelve el foco a la entrevista.
- RF-20: CUANDO el visitante entra en la entrevista, EL SISTEMA presenta los textos de bienvenida y del tutorial en tono profesional suave según la lista de aceptación siguiente: sin 4 o más letras mayúsculas seguidas (salvo siglas), sin signos de cierre dobles (??, !!) y sin vocales alargadas (misma letra 3 o más veces); inventario: los 4 mensajes de la puerta y el título, pasos y botón de cierre del tutorial, en español e inglés.
- RF-21: EL SISTEMA permite completar con solo teclado todas estas acciones: elegir idioma, confirmar, comenzar, entrar, elegir mundo y pregunta, saltar texto, cerrar avisos y tutorial, activar modo infinito, silenciar y enviar sugerencia, con foco siempre visible.

### Textos acordados de la puerta (ES/EN, decisión A aplicada)

- Bienvenida — ES: «¡Hola! ¿Puedo pasar?» / EN: «Hello! May I come in?»
- Mensaje 1 — ES: «¡Hola! ¿Hay alguien ahí?» / EN: «Hello! Is anyone there?»
- Mensaje 2 — ES: «Hace frío aquí fuera, ¿me dejas entrar?» / EN: «It's cold out here, may I come in?»
- Mensaje 3 — ES: «Llamo tres veces: esa es la señal, ¿verdad?» / EN: «I'll knock three times: that's the signal, right?»
- El botón de entrar y los textos del tutorial se mantienen como están (ya cumplen la lista de aceptación).

## Requisitos no funcionales

- RNF-1 (Rendimiento percibido): cada animación de la tabla de auditoría se observa durante 2 ciclos completos en escritorio y en móvil de 375 px y pasa si no presenta congelamientos ni saltos visibles; el resultado (0 tirones) se registra por fila.
- RNF-2 (Accesibilidad de movimiento y sensorial): se cumplen RF-7, RF-8, RF-9, RF-10, RF-11 y RF-21; además ningún contenido depende solo del color o solo del sonido.
- RNF-3 (Datos mínimos): ningún dato personal sale del navegador ni se guarda en servidor salvo el email de sugerencias ya existente; la preferencia de silencio es un ajuste local del navegador (no es un dato personal ni se transmite), por lo que RF-15 es compatible con el principio 5 de la constitución.
- RNF-4 (Protocolo de medición): cada umbral se mide con cronómetro, 1 vez por idioma, registrando el mayor valor, en navegador actualizado, sin limitación artificial de CPU o red y con animaciones activas; inicio y fin de cada medida: RF-1 desde confirmar idioma hasta botón de comenzar habilitado; RF-2 desde la interacción hasta el cambio visible; RF-3 desde la aparición de la escena hasta el botón de entrar visible; RF-4 por mensaje desde su inicio hasta texto completo; RF-5 desde la interacción que cambia de vista hasta vista interactiva; RF-6 (apertura) desde el clic en entrar hasta entrevista visible; RF-8 desde el cambio de ajuste hasta estado final; RF-17 y RF-18 desde la aparición del aviso o efecto hasta su desaparición.

## Casos límite

- Visitante con reducción de movimiento activada desde el inicio: flujo completo usable según RF-7.
- Reducción de movimiento activada a mitad de una animación: se aplica RF-8 (estado final en 0,5 s).
- Visitante que no interactúa nunca: todo avanza solo dentro de los umbrales (RF-1, RF-3, RF-4).
- Clics o toques repetidos durante la carga o las transiciones: el flujo no se rompe ni duplica efectos (sin pantallas en blanco ni saltos de vista).
- Doble clic en el botón de entrar de la puerta: una sola apertura y un solo aviso al servidor, sin duplicar la entrada.
- Avisos de logro simultáneos o encadenados: se muestran sin apilarse de forma ilegible y cada uno cumple RF-17.
- Visitante sin monedas en un mundo: las preguntas de CV, proyectos, GitHub y contacto siguen accesibles (RF-13); la pista del modo infinito es solo ayuda contextual, nunca un requisito.
- Cambio de idioma a mitad de la carga, la puerta o la entrevista: la vista se reinicia de forma coherente, sin textos mezclados de ambos idiomas.
- Recarga de la página a mitad del flujo: la visita vuelve a la selección de idioma sin errores ni estados mezclados; solo se conserva la preferencia de silencio (RF-15).
- Sonido o reproducción automática bloqueados por el navegador: la experiencia funciona igual en silencio (RF-15).
- Navegación solo con teclado o con lector de pantalla: todas las acciones de RF-21 funcionan y los diálogos se exponen como texto (no solo como imagen o sonido).
- Pantallas distintas de 375 px (móvil pequeño, tableta, escritorio ancho): textos, botones y avisos permanecen visibles y sin solapes durante las animaciones.
- Textos largos de respuesta en la entrevista: siempre se pueden saltar al texto completo (RF-12).

## Fuera de alcance

- Eliminar, hacer opcional o saltable el flujo idioma → carga → puerta → entrevista (se mantiene obligatorio por decisión del usuario). Esto es compatible con el principio 6 de la constitución («acceso directo sin fricción extra»): «sin fricción extra» significa sin pasos ni peajes adicionales más allá del propio flujo (que además queda acotado en RF-1–RF-6), y RF-13 garantiza CV, proyectos, GitHub y contacto a ≤2 interacciones y sin monedas dentro de la entrevista.
- Cambiar el sistema de monedas, sus presupuestos, el modo infinito o el código secreto (se mantienen; única excepción: RF-13 para CV/proyectos/GitHub/contacto, exigido por la constitución).
- Nuevas secciones, páginas o cambios de contenido (respuestas, proyectos); solo tono, tiempos y detalles.
- Backend, emails, SEO, bases de datos, nuevas dependencias o cambios de despliegue.
- Atenuaciones de identidad más allá de las A–D ya acordadas: nada más se elimina ni se atenúa.

## Criterios de finalización

- Todos los RF verificados manualmente en español e inglés, en escritorio y en móvil de 375 px, con el protocolo de RNF-4.
- Tabla de auditoría (`specs/001-suavizar-arcade-profesional/audit.md`) completa y sin pendientes: todas las filas con duración medida, veredicto por criterio y 0 filas sin revisar; cualquier animación visible no listada debe añadirse a la tabla antes de cerrar.
- Flujo ES/EN → puerta → entrevista → sugerencia correcto y compilación de frontend y backend en verde.
- No quedan dudas abiertas.

## Dudas abiertas

- Ninguna pendiente: las decisiones Q4 (A+B+C+D), tutorial (apariencia actual con cierre evidente) y celebraciones (máximo 2,5 s sin repetición) ya están aplicadas en RF-9, RF-10, RF-15, RF-16, RF-18, RF-19, RF-20 y los textos acordados.

Nota de cierre: verificación manual con navegador pendiente (protocolo en T10/audit.md); cierre aceptado por el usuario el 2026-10-11.
