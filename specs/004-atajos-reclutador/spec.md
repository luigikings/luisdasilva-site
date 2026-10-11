# Spec 004 — Atajos de reclutador

Estado: implementada

> Nota de cierre (2026-10-11): cierre aceptado por el usuario. @reviewer dio CAMBIOS NECESARIOS solo por la matriz visual manual (con/sin `?go=interview` × ES/EN × escritorio/375px), imposible en este entorno sin navegador/MCP — nada fabricado; todo lo demás OK por código (RF-1–RF-7, RNF, constitución; lint + builds verdes). Matriz visual manual pendiente, protocolo en T6/criterios. Notas menores: ejemplo README con dominio marcador + verificar iconos del HUD en la pasada visual.

## Contexto y objetivo

Llegar al CV, GitHub y contacto exige hoy completar idioma → carga → puerta (~6-10 s); el reclutador que llega por un enlace de candidatura y tiene prisa puede abandonar antes de ver lo esencial. Esta spec añade un acceso directo silencioso solo para ese enlace, que lleva a la entrevista sin esperas, manteniendo el flujo arcade intacto para el visitante normal.

## Usuarios

- **Reclutador/a con enlace de candidatura (principal):** quiere ver el perfil, descargar el CV y contactar sin pasar por la puerta.
- **Visitante normal:** entra por la dirección sin parámetros válidos y espera la experiencia arcade completa como hasta ahora.

## Historias de usuario

- HU-1. Como reclutadora con enlace de candidatura, quiero llegar directo a la entrevista para ver CV, proyectos/GitHub y contacto sin esperas.
- HU-2. Como visitante normal, quiero que la visita siga igual que siempre para disfrutar o evaluar el flujo completo.
- HU-3. Como reclutador que recibe el enlace de otro, quiero que el enlace compartido funcione igual para llegar directo al contenido.

## Definiciones

- **Deep-link silencioso:** dirección que contiene `?go=interview`. «Silencioso» significa solo interfaz normal: no se anuncia ni se muestra ningún botón o pista sobre su existencia en las vistas; la guía pública del proyecto sí lo documenta.
- **Visitante normal:** quien abre la dirección sin ese parámetro exacto (falta, vacío, otro valor, repetido o mixto).
- **Flujo normal:** orden obligatorio idioma → carga → puerta → entrevista, con monedas y tutorial como hasta ahora. Excepción explícita y acotada a la regla «sin atajos»: solo `?go=interview` salta el flujo; nada más lo salta.
- **Aviso de entrada:** notificación al dueño de que alguien entró en la entrevista; no tiene interfaz y no retiene ni muestra nada al visitante.
- **1 interacción:** 1 clic, 1 pulsación de Enter/Espacio o 1 toque; se cuenta desde la vista de entrevista con mundos visibles.
- **Lo esencial:** CV, proyectos, GitHub y contacto dentro de la entrevista.
- **HUD persistente:** barra o conjunto de enlaces a CV, GitHub y contacto visible durante toda la entrevista llegada por deep-link; no existe en el flujo normal.
- **Estado final (reducción de movimiento):** entrevista renderizada sin animaciones, con tutorial y aviso en su estado normal.

## Requisitos funcionales

- RF-1: CUANDO el visitante abre la dirección con `go` exactamente igual a `interview`, EL SISTEMA muestra directamente la entrevista sin mostrar las vistas de idioma, carga ni puerta y sin exigir ninguna interacción previa (se admite el aviso al dueño sin interfaz y el tutorial normal de la entrevista).
- RF-2: SI el parámetro `go` falta, está vacío, tiene un valor distinto de `interview` (incluidos mayúsculas, espacios o codificaciones), viene repetido o mezclado, ENTONCES EL SISTEMA muestra el flujo normal empezando por la selección de idioma; otros parámetros de la dirección y el fragmento se ignoran y no invalidan ni validan por sí solos.
- RF-3: MIENTRAS el visitante está en la entrevista llegada por deep-link, EL SISTEMA la presenta en español por defecto y permite cambiar a inglés manteniendo equivalencia completa en entrevista, HUD, tutorial y aviso, contada como mismo número de preguntas, botones, enlaces del HUD, pasos del tutorial y textos de aviso, con el mismo significado y sin texto sin traducir (salvo nombres propios y direcciones web).
- RF-4: MIENTRAS el visitante está en la entrevista llegada por deep-link, EL SISTEMA mantiene lo esencial siempre accesible sin monedas, a un máximo de 2 interacciones desde la navegación de mundos y preguntas, con destino verificable: CV descargado, GitHub o demo abiertos en pestaña nueva, o contacto con envío de correo disparado o dirección copiada; el resto de preguntas mantiene el mismo coste en monedas que en el flujo normal.
- RF-5: MIENTRAS el visitante está en la entrevista llegada por deep-link, EL SISTEMA muestra el HUD persistente con enlaces a CV, GitHub y contacto, visible durante toda la entrevista sin necesidad de abrir mundos ni preguntas y con cada recurso a 1 interacción de su destino; en el flujo normal ese HUD no existe.
- RF-6: CUANDO el visitante entra en la entrevista por el deep-link, EL SISTEMA genera el mismo aviso de entrada que en el flujo normal y muestra el mismo tutorial con el mismo cierre en 1 interacción (clic en su botón o tecla Escape).
- RF-7: CUANDO se lee el `README.md` de la raíz, EL SISTEMA documenta en su sección How It Works el deep-link `?go=interview` con contenido mínimo: qué parámetro es, qué efecto tiene (entrevista directa en español, flujo normal intacto) y un ejemplo de enlace.

## Requisitos no funcionales

- RNF-1 (Bilingüe profesional): la entrevista llegada por deep-link es completa y equivalente en español e inglés; el conteo de equivalencia compara número de preguntas, botones, enlaces del HUD, pasos del tutorial y textos de aviso entre ambos idiomas.
- RNF-2 (Sin fricción extra): el deep-link no añade pasos, peajes ni pantallas nuevas más allá del aviso sin interfaz y del tutorial normal; el flujo normal no gana ni pierde ninguna interacción.
- RNF-3 (Verificación): verificación manual con y sin deep-link en español e inglés, en escritorio y en móvil de 375 px mediante vista responsive, más compilación de frontend y backend en verde; aprobado significa sin solapes ni bloqueos en ambos tamaños.

## Casos límite

- Valor no exacto (`INTERVIEW`, `Interview`, con espacios o codificado) o `go` repetido/mixto: se trata como visitante normal.
- Dirección con otros parámetros (por ejemplo de campaña) junto a `?go=interview` válido: el acceso directo se aplica; los demás parámetros se ignoran.
- Recarga con `?go=interview` conservado: se reaplica el acceso (entrevista en español aunque antes se hubiera cambiado a inglés; el parámetro manda), con tutorial y aviso según el estado normal de primera entrada y monedas intactas según la persistencia que ya exista.
- Recarga sin `?go=interview`: vuelve a la selección de idioma sin errores ni estados mezclados.
- Deep-link con reducción de movimiento activada: entrevista en su estado final, con tutorial y aviso en su estado normal.
- Enlace compartido o reenviado con `?go=interview` intacto: otro visitante llega también directo a la entrevista en español.
- Cambio de idioma dentro de la entrevista llegada por deep-link: entrevista, HUD, tutorial y aviso quedan coherentes, sin textos mezclados.
- Enlace de recurso roto, GitHub caído o CV no descargable: fuera de esta spec (heredado de la spec 003).

## Fuera de alcance

- Botón visible de «ver contenido» o cualquier pista del atajo en la interfaz normal.
- Eliminar, hacer opcional o saltable el flujo normal para el visitante sin deep-link.
- Cambiar el sistema de monedas, sus presupuestos, el modo infinito o el código secreto (RF-13 de la 001 sigue eximiendo lo esencial en toda entrevista, deep-link incluida).
- Cambios de backend, formato de datos guardados, bases de datos, nuevas dependencias, cambios de despliegue, SEO o canonical.
- Fallos de recursos externos (enlaces rotos, caídas) más allá de heredar el comportamiento ya definido.
- Nuevo diseño, nuevas secciones o cambios de contenido (respuestas, proyectos).

## Criterios de finalización

- RF-1–RF-7 verificados manualmente con y sin deep-link, en español e inglés, en escritorio y en móvil de 375 px con vista responsive, sin solapes ni bloqueos.
- Flujo del visitante normal ES/EN → puerta → entrevista → sugerencia correcto, y sugerencia desde entrevista por deep-link verificada extremo a extremo igual que en flujo normal.
- Guía comprobada: `README.md` de la raíz documenta parámetro, efecto y ejemplo de enlace.
- Compilación de frontend y backend en verde.
- No quedan dudas abiertas.

## Dudas abiertas

- Ninguna pendiente.
