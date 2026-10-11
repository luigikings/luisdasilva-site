# Plan 003 — Contenido contratable

Spec: `specs/003-contenido-contratable/spec.md` (Estado: aprobada).

## Archivos y responsabilidades

- Diccionario bilingüe (`i18n/dict.ts`): reescribe las respuestas `introduction`, `projects`, `contact`, `learning` en ES+EN con los datos de la spec; añade el aviso de fallback del CV (literales de RF-4) y la etiqueta del botón de correo. Mismas claves de pregunta, solo contenido nuevo. Cubre RF-1, RF-2 (textos), RF-3 (texto), RF-4 (aviso), RF-5, RF-6.
- Constantes de datos (`data/interview.ts`): `GITHUB_URL` se mantiene; se añaden las URLs verificables de RF-2 (repos AgencyMac/MetalRenova, demo Magnar), el correo, y las URLs/nombres de CV por idioma (`cv-luis-dasilva-en.pdf`, `cv-luis-dasilva-es.pdf`) con resolución con fallback al EN. Cubre RF-2 (enlaces), RF-3 (correo/GitHub), RF-4 (CVs).
- Panel de conversación (`components/interview/ConversationPanel.tsx`, vía `Interview.tsx`): muestra acciones clicables por respuesta — 3 botones de proyecto cuando la pregunta es proyectos, enlace `mailto:` + botón GitHub cuando es contacto (dirección siempre visible y seleccionable), descarga de CV con aviso no bloqueante cuando falta el ES. Sin cambios de estilo más allá de botones/enlaces. Cubre RF-2, RF-3, RF-4.
- PDFs en `frontend/public/`: el EN actual se renombra a `cv-luis-dasilva-en.pdf`; el ES (`cv-luis-dasilva-es.pdf`) queda como insumo pendiente. Cubre RF-4.
- `README.md`: edita los apartados existentes que describan contenido afectado (proyectos, contacto, CVs); sin apartados por spec. Cubre RF-7.

## Lógica separada de la interfaz

- Función pura `resolveCv(lang, esAvailable) → { url, downloadName, showFallbackNotice }`: recibe idioma activo y si existe el fichero ES, devuelve qué servir y si mostrar el aviso. Sin DOM, red ni fecha; la UI solo pinta el resultado y dispara la descarga.
- Los enlaces de proyecto/contacto son datos (lista nombre→URL por tipo); el panel solo itera y pinta botones; los handlers solo abren URL o `mailto:`.

## Algoritmo (resolución CV)

```
resolveCv(lang, esAvailable):
  si lang == 'es' y esAvailable: servir ES, sin aviso
  si lang == 'es' y no esAvailable: servir EN + aviso RF-4 en ES
  si lang == 'en': servir EN, sin aviso
  (la descarga en curso nunca se altera; el idioma se lee al pedir)
```

## Datos, formato y compatibilidad

- Mismas claves i18n (`QuestionKey` y grupos intactos); solo se añaden claves nuevas para el aviso y la etiqueta del botón de correo. Sin migraciones: no hay nada guardado.
- CV por idioma con fallback al EN mientras no exista el ES; nombres convenidos `cv-luis-dasilva-en.pdf` / `cv-luis-dasilva-es.pdf`; el nombre con espacios desaparece (quien enlazaba la ruta antigua con `%20` pasa a la nueva).
- Literales canónicos de proyecto idénticos en ES+EN (AgencyMac, MetalRenova, Magnar WarGames); Magnar solo demo, sin URL de código.

## Decisiones técnicas

- Fallback del CV resuelto en cliente con existencia conocida frente a petición HEAD en tiempo de ejecución (descartada: petición extra y parpadeo antes de descargar).
- Correo como enlace `mailto:` nativo con dirección visible frente a botón que copia al portapapeles (descartada: copiar no abre el gestor y exige JS/permiso).
- Enlaces de proyecto como botones del panel frente a URLs pegadas en el texto (descartadas: no son accionables ni verificables como «acción visible»).
- Renombrar el PDF con guiones frente a mantener `%20` (descartado: los espacios rompen descargas y copias).
- README editado en sus apartados existentes frente a sección nueva por spec (descartada: la spec RF-7 lo prohíbe).

## Estrategia de tests (sin suite; comandos de AGENTS.md)

- Verificación manual por idioma (ES y EN) siguiendo el mapa de la spec: lectura RF-1/RF-5/RF-6; clic en los 3 enlaces RF-2 (pestaña nueva, destino correcto); correo (abre gestor o copiable) + GitHub RF-3; descarga CV por idioma + aviso RF-4; lectura README RF-7. Casos límite: ES sin fichero, mailto bloqueado, texto largo en 375 px.
- `cd frontend && npm run lint`, `npm run build` en frontend y backend en verde.

## Cobertura RF por parte

- Dict (textos): RF-1, RF-5, RF-6 + textos de RF-2/RF-3/RF-4.
- Constantes + `resolveCv`: RF-2 (enlaces), RF-3 (datos), RF-4 (lógica).
- Panel/handlers: RF-2, RF-3, RF-4 (UI y casos límite).
- PDFs + README: RF-4, RF-7.
