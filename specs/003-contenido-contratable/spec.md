# Spec 003 — Contenido contratable

Estado: implementada

> Nota de cierre (2026-10-11): fix de aviso indeterminado aplicado y verificado (lógica resolveCv 7/7 en verde). Verificación manual en navegador pendiente (protocolo en T6/criterios: ES/EN + 375 px). Cierre aceptado por el usuario.

## Contexto y objetivo

La entrevista responde con textos genéricos y cortos: los proyectos no nombran stack ni enlaces; lo aprendido últimamente no muestra dónde se aplica; y el contacto deja el correo como texto plano y menciona una red que no se va a usar. Un reclutador que llega por enlace directo no puede evaluar el perfil ni descargar el CV en su idioma. Esta spec reescribe las respuestas clave con datos reales y verificables (stack, 3 proyectos con enlace verificable, contacto accionable y CV por idioma) en tono profesional con carisma, para convertir visitas en CVs descargados y correos enviados. Excepción conocida: Magnar WarGames se muestra con demo verificada y sin enlace de código (ver RF-2).

## Usuarios

- **Reclutador/a (principal):** quiere evaluar stack, ver 3 proyectos con enlace, descargar el CV y contactar por correo, en español o inglés.
- **Visitante curioso:** quiere conocer el perfil real (formación, qué hace ahora, qué está aprendiendo) sin textos vacíos.

## Historias de usuario

- HU-1. Como reclutadora, quiero leer una presentación con formación, perfil y stack concreto para decidir si encaja.
- HU-2. Como reclutador, quiero ver 3 proyectos con nombre, qué hacen, stack y enlace verificable para evaluar trabajo real.
- HU-3. Como reclutadora, quiero contactar con 1 clic (correo) y abrir el GitHub para no copiar textos a mano.
- HU-4. Como visitante, quiero descargar el CV en mi idioma (con alternativa en inglés avisada si el español aún no existe) para compartirlo.
- HU-5. Como reclutador, quiero saber qué está aprendiendo y dónde se ve aplicado para valorar crecimiento real.

## Definiciones

- **Tono profesional con carisma:** cumple la lista de aceptación siguiente: máximo 1 frase con personalidad por respuesta; nunca jerga de juego de esta lista cerrada (moneda, mundo, nivel, puerta pixelada, respawn, game over, jugador, logro, misión); sin 4 o más letras mayúsculas seguidas salvo siglas (según definición de la spec 001).
- **Dato verificable:** cada dato profesional de esta spec se acepta si cumple su verificador: enlace demo responde 200 OK, enlace de código abre el repositorio público, o fichero PDF existe descargable; nada se afirma sin verificador.
- **Enlace verificable:** acción visible que abre la demo o el repositorio en una pestaña nueva; se acepta si abre el destino correcto en una pestaña nueva.
- **CV por idioma:** el visitante obtiene el CV en el idioma de su visita; si el CV en español aún no existe, obtiene el inglés con el aviso definido en RF-4.
- **Acceso directo (esta spec):** contenido contratable alcanzable dentro de la entrevista tras la puerta, sin pasos adicionales; los atajos que eviten la puerta son la spec C2 y quedan fuera.

## Requisitos funcionales

- RF-1: CUANDO el visitante pregunta quién es Luis, EL SISTEMA muestra en español e inglés una presentación con nombre (Luis Ángel Jose Da Silva), recién graduado en Desarrollo de Aplicaciones Web (DAW), perfil full stack y stack principal (React, TypeScript, TailwindCSS en frontend; Node.js en backend; MySQL/MariaDB/MongoDB en datos; Git/Docker/Linux como herramientas), en tono profesional con carisma según la definición.
- RF-2: CUANDO el visitante pregunta en qué proyectos ha trabajado, EL SISTEMA muestra en español e inglés exactamente 3 proyectos con estos literales canónicos idénticos en ambos idiomas (sin paréntesis ni alias en el nombre visible): «AgencyMac» (web de agencia de marketing; TypeScript con .NET y Tailwind; enlace al repositorio https://github.com/luigikings/AgencyMac), «MetalRenova» (web de chatarrería; Astro; enlace al repositorio https://github.com/luigikings/ChatarreroMetalRenova) y «Magnar WarGames» (web inspirada en Juego de Tronos con frontend, backend y base de datos; enlace demo https://www.magnarwargames.com/ y sin enlace de código); EL SISTEMA no afirma nada sobre el código de Magnar WarGames más allá de lo aquí escrito ni enlaza ningún repositorio para él.
- RF-3: CUANDO el visitante pregunta cómo contactar, EL SISTEMA muestra en español e inglés la dirección `luigidasilv@gmail.com` como enlace que abre el gestor de correo al pulsarlo, con la dirección siempre visible como texto seleccionable junto al enlace, más una acción que abre `https://github.com/luigikings` en una pestaña nueva; EL SISTEMA no añade ninguna mención ni enlace a LinkedIn y elimina la mención existente si sigue presente.
- RF-4: CUANDO el visitante pide el CV en inglés, EL SISTEMA entrega el PDF inglés con nombre sin espacios `cv-luis-dasilva-en.pdf` (renombrado desde el actual `CV Luis Angel Da Silva English.pdf`); CUANDO lo pide en español y existe el fichero `cv-luis-dasilva-es.pdf`, EL SISTEMA entrega ese fichero; MIENTRAS el fichero español no exista, EL SISTEMA entrega el inglés y muestra junto a la descarga este aviso no bloqueante, en el idioma activo — ES: «De momento solo tengo el CV en inglés: aquí lo tienes.» / EN: «My résumé is only available in English for now — here it is.» — sin modal obligatorio ni error.
- RF-5: CUANDO el visitante pregunta qué ha aprendido últimamente, EL SISTEMA muestra en español e inglés exactamente estos 2 aprendizajes, cada uno con su aplicación visible: animación de interfaces (aplicada en este portfolio) y accesibilidad aplicada (aplicada en este portfolio), en tono profesional con carisma según la definición.
- RF-6: EL SISTEMA presenta todo texto nuevo o reescrito de esta spec en español e inglés con el mismo número de datos verificables y el mismo significado, validado por lectura manual; quedan exentas de traducción las siglas y nombres propios (CV, DAW, GitHub, mailto, portfolio, nombres de stack, URLs y literales canónicos de RF-2).
- RF-7: CUANDO se verifica el cierre de esta spec, EL SISTEMA presenta la documentación pública del proyecto (README.md, en el idioma que ya tenga; no se exige bilingüe) actualizada con los mismos proyectos, enlaces, correo, GitHub y CVs descritos en RF-1–RF-5, editando los apartados existentes que describan ese contenido y sin crear apartados separados por spec.

## Requisitos no funcionales

- RNF-1 (Bilingüe): ningún texto nuevo de esta spec existe en un solo idioma; la equivalencia se acepta según el criterio de RF-6.
- RNF-2 (Sin dependencias nuevas): ningún contenido nuevo exige dependencias, bases de datos ni cambios de despliegue.
- RNF-3 (Datos reales): ningún dato profesional (stack, proyectos, enlaces, correo) se inventa más allá de la fuente de verdad fijada en RF-1–RF-5; lo no aportado queda omitido, nunca rellenado con ficción.

## Casos límite

- CV en español aún no aportado: se sirve el inglés con el aviso de RF-4, descarga con éxito y sin error ni bloqueo.
- PDF inglés ausente o ruta rota: la acción de CV muestra un mensaje de no disponible en el idioma activo en vez de una descarga rota; se registra como fallo de cierre.
- CV pedido sin idioma activo determinable: se sirve el inglés con el aviso en inglés de RF-4.
- Cambio de idioma: rige el idioma activo en el momento de pedir (pregunta o descarga); la existencia del fichero español se comprueba en ese momento; ninguna descarga en curso se altera.
- Enlace de proyecto o GitHub roto, que no abre pestaña nueva o destino caído: se registra como fallo de cierre; no se sustituye por otro destino.
- Correo sin gestor configurado o mailto bloqueado: la dirección `luigidasilv@gmail.com` sigue visible y seleccionable para copiarla a mano; no se exige diagnóstico del bloqueo.
- Texto largo de proyectos (3 proyectos con stack y enlace): la respuesta permite desplazar el contenido, el foco de teclado alcanza cada enlace, el lector de pantalla anuncia los 3 enlaces y no hay solapes en 375 px.
- Atajo o enlace que evita la puerta: declarado fuera de alcance (spec C2); esta spec no lo implementa ni lo rompe.

## Fuera de alcance

- Rediseño visual o de identidad (neón, pixel-art, puerta, monedas, celebraciones).
- Cambios de flujo (orden idioma → carga → puerta → entrevista intacto), sistema de monedas, nuevas páginas o secciones, atajos o enlaces que eviten la puerta (spec C2).
- Backend y entrega de correo (incluida la integración con el proveedor de email), SEO, bases de datos, nuevas dependencias o cambios de despliegue. El enlace `mailto:` del RF-3 SÍ está dentro.
- Cambios visuales más allá de botones y enlaces (correo, GitHub, CV, enlaces de proyecto y aviso de RF-4).

## Criterios de finalización

- Mapa RF↔prueba, todo manual por idioma (ES y EN): RF-1/RF-5/RF-6 lectura de respuestas en la entrevista; RF-2 clic en los 3 enlaces (cada uno abre su destino en pestaña nueva); RF-3 clic en el correo (abre gestor o deja dirección copiable) y en GitHub; RF-4 descarga del CV en cada idioma (con aviso si el ES no existe); RF-7 lectura de los apartados afectados de la documentación.
- Compilación de frontend y backend en verde y linter del frontend sin errores (comandos de AGENTS.md: `npm run build` en frontend y backend; `npm run lint` en frontend). No hay suite automatizada en este proyecto (verificación manual + build por constitución).
- La documentación pública refleja el contenido nuevo donde corresponda (RF-7).
- No quedan dudas abiertas; el único insumo pendiente listado abajo no bloquea el cierre.

## Dudas abiertas

Ninguna pendiente: todas las decisiones están tomadas y aplicadas en los RF.

## Insumos pendientes (no bloquean el cierre)

- PDF del CV en español (`cv-luis-dasilva-es.pdf`): mientras no se aporte, aplica el fallback al inglés de RF-4. Si se aporta después, requiere micro-actualización de esta spec (volver a «aprobada» antes de implementarlo, por principio de spec manda) y verificación de RF-4 en español.
