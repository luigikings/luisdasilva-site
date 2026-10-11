# Plan 004 — Atajos de reclutador

## Archivos y responsabilidades

- **Vista raíz de la experiencia (máquina Language→Loading→Door→Interview):** lee el query param al arrancar y fija el estado inicial: con `?go=interview` entra directo en entrevista en ES; sin él, flujo normal intacto. Reutiliza aviso de entrada y tutorial sin duplicarlos. Cubre RF-1, RF-2, RF-3 (idioma inicial), RF-6.
- **Lógica pura de resolución del modo de entrada (nueva unidad separada de la interfaz):** decide `deep-link` o `normal` a partir de la cadena de query; testeable sin DOM ni red. Cubre RF-1, RF-2 y casos límite de URL.
- **HUD persistente solo-deep-link (pieza visible solo en entrevista llegada por deep-link):** enlaces a CV, GitHub y contacto, visibles toda la entrevista, 1 interacción a destino, bilingüe; inexistente en flujo normal. Cubre RF-5, RF-4 (destinos), RF-3 (equivalencia del HUD).
- **Entrevista existente (reutilización, sin rediseño):** esenciales sin monedas, costes iguales para el resto, cambio ES/EN total, sugerencia extremo a extremo igual. Cubre RF-4, RF-3, RF-6.
- **`README.md` de la raíz (sección How It Works):** documenta parámetro, efecto y ejemplo de enlace. Cubre RF-7.

## Lógica separada de la interfaz

- Función pura `resolveEntryMode(queryString): 'deeplink' | 'normal'` que no toca DOM, red ni fecha: recibe la cadena de query como parámetro y aplica regla exacta (`go` igual a `interview`, sensible a mayúsculas, sin espacios ni codificaciones; repetido/mixto → normal; resto de params y fragmento ignorados).
- La interfaz solo pinta según el modo devuelto: estado inicial directo en entrevista ES o flujo normal; recarga con `?go=interview` reaplica ES (el parámetro manda).
- Pseudocódigo:
  ```
  function resolveEntryMode(query):
    values = parseQuery(query).getAll("go")
    if values.length == 1 and values[0] == "interview": return "deeplink"
    else: return "normal"
  onStart(query):
    if resolveEntryMode(query) == "deeplink": showInterview(lang=ES) + entryNotice + tutorial
    else: showLanguageSelection()
  ```

## Interfaz

- Sin ningún botón, pista o anuncio del atajo en las vistas normales (RF-5 de la spec 001 y definición de «silencioso»).
- En entrevista por deep-link: HUD persistente con 3 enlaces (CV, GitHub, contacto) siempre visible sin abrir mundos/preguntas, con etiquetas en el idioma activo y mismos destinos que lo esencial; tutorial idéntico con cierre en 1 interacción (botón o Escape); reducción de movimiento deja entrevista, tutorial y aviso en estado final sin animaciones.
- En flujo normal: nada cambia visualmente; el HUD persistente no se monta.

## Datos

- Formato: sin cambios; no se crea ni migra ningún formato guardado.
- URLs existentes intactas: direcciones sin `?go=interview` se comportan como antes; solo la presencia exacta del parámetro activa el modo directo.
- Compatibilidad: recarga con parámetro reaplica ES con monedas según la persistencia ya existente; recarga sin parámetro vuelve a idioma sin estados mezclados. Sin BBDD, sin PII nueva, sin cambios de contrato de email.

## Decisiones técnicas

- **Lectura del query una vez al arrancar y estado inicial directo vs. montar flujo y auto-avanzar:** se elige estado inicial directo porque evita mostrar idioma/carga/puerta y respeta RF-1 «sin mostrar»; descartado auto-avanzar por parpadeos y por violar el umbral de fricción. (RF-1)
- **HUD nuevo solo-deep-link vs. reutilizar solo preguntas esenciales:** se elige HUD nuevo porque RF-5 exige acceso a 1 interacción sin abrir mundos; descartado apoyarse solo en RF-4/RF-13 (≤2 interacciones) porque no cumpliría RF-5. (RF-4, RF-5)
- **Reutilizar aviso y tutorial existentes vs. duplicar variantes:** se reutilizan porque RF-6 exige «mismos»; descartado duplicar por riesgo de divergencia ES/EN y de cierre. (RF-6)
- **Sin nuevas dependencias ni cambios de deploy:** stack mínimo intacto; verificación manual + builds según AGENTS.md. (Constitución P1, P4)

## Estrategia de tests

- Sin script de tests en el proyecto (AGENTS.md: «Tests: pendiente»): verificación manual + compilación en verde.
- Matriz manual: con/sin `?go=interview` × ES/EN × escritorio/375 px responsive; casos: valor exacto, mayúsculas/espacios/codificado/repetido/mixto, params extra ignorados, recarga con/sin parámetro, enlace compartido, cambio ES↔EN total, HUD visible solo deep-link a 1 interacción con destinos exactos, aviso sin UI + tutorial con cierre botón/Escape, sugerencia e2e igual, flujo normal intacto ES/EN→puerta→entrevista→sugerencia.
- Comandos (AGENTS.md): arranque `cd backend && npm run dev` + `cd frontend && npm run dev`; `cd frontend && npm run lint`; `npm run build` en frontend y backend. Aprobado = sin solapes ni bloqueos en ambos tamaños.
- Cobertura por parte: resolución pura → RF-1/RF-2; estado inicial → RF-1/RF-2/RF-3; HUD → RF-5/RF-4/RF-3; reutilización → RF-4/RF-6/RF-3; README → RF-7; matriz final → RNF-1/RNF-2/RNF-3 y criterios.

## Trazabilidad RF

- Resolución + estado inicial → RF-1, RF-2, RF-3 (idioma inicial ES).
- HUD persistente → RF-5, RF-4 (destinos a 1 interacción), RF-3 (HUD bilingüe).
- Aviso + tutorial + esenciales + sugerencia reutilizados → RF-6, RF-4, RF-3.
- README → RF-7.
