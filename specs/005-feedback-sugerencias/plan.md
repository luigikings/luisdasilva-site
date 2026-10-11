# Plan 005 — Feedback honesto de sugerencias

## Alcance
Alinear lo visible del formulario de sugerencias con el contrato 002: éxito intacto con `emailSent:true`, misma presentación con cuerpo degradado exacto ES/EN con `emailSent:false`, error actual en el resto de fallos. Sin cambios de flujo, backend, despliegue ni dependencias.

## Archivos y responsabilidades
- `frontend/src/lib/api.ts` — alinear el tipo de retorno del envío con el contrato `{emailSent, error}`; no cambia comportamiento de red, solo lo observable para decidir la rama. Cubre RF-1, RF-2, RF-3, RF-5.
- `frontend/src/lib/` (función pura nueva o existente ampliada) — decidir la rama visible (`success` / `degraded` / `error`) a partir de `{emailSent, error}` y estado de la respuesta, sin DOM ni red. Cubre RF-1, RF-2, RF-3, RF-5 y casos límite.
- `frontend/src/components/SuggestionPrompt.tsx` — usar la decisión pura: éxito intacto (RF-1), degradado con misma presentación y cuerpo exacto (RF-2), nunca pintar el detalle técnico (RF-4), error actual en fallos (RF-5), validación local <8 sin envío (RF-6), mensaje congelado en el idioma del envío con respaldo EN (RF-7).
- `frontend/src/i18n/dict.ts` — dos claves nuevas ES/EN solo para el literal degradado exacto; éxito, error y validación intactos. Cubre RF-2, RF-7.
- `README.md` (raíz) — solo si ya describe el resultado del envío: coherencia éxito frente a degradado. Si no lo describe, se registra "no requiere cambios". Cubre RF-8.

## Lógica separada de la interfaz
Función pura, por ejemplo `resolveSuggestionOutcome(input)`:
- Entrada: `{ emailSent: boolean | undefined, hasBody: boolean, isJson: boolean }` (el detalle `error` se recibe pero no se usa para decidir ni se devuelve a la vista).
- Salida: `'success' | 'degraded' | 'error'`.
- Pseudocódigo:
  ```
  if hasBody is false or isJson is false or emailSent is not boolean:
    return 'error'
  if emailSent is true:
    return 'success'
  else:
    return 'degraded'
  ```
- La interfaz solo pinta: `success` → título y mensaje de éxito actuales; `degraded` → mismo título/icono/disposición con cuerpo degradado exacto; `error` → mensaje de error actual. La validación local (<8 tras recortar) va antes y no llama a la función ni a la red.

## Cómo se pinta en la interfaz
Sin panel, icono ni disposición nuevos: la rama degradada reutiliza el panel de éxito actual con el mismo título y solo sustituye el cuerpo por el literal degradado exacto. El detalle técnico nunca llega al mensaje visible.

## Datos
Sin nuevos formatos ni almacenamiento. La respuesta sigue siendo la del contrato 002; el detalle `error` se ignora en la vista. Compatibilidad: la rama degradada aparece con clave ausente/inválida sin romper el flujo.

## Decisiones técnicas
- Decisión 1: función pura de decisión separada de la llamada de red. Alternativa descartada: decidir inline en el `try/catch` del formulario, porque mezcla red/DOM con la regla `emailSent` manda y no es reutilizable ni verificable sin navegador.
- Decisión 2: degradado con misma presentación del éxito y solo cuerpo nuevo. Alternativa descartada: panel de aviso distinto (color/icono/título propios), porque la decisión de usuario exige reutilizar el éxito y minimiza el delta visual.
- Decisión 3: ignorar siempre el detalle `error` en la vista. Alternativa descartada: mostrarlo cuando venga no vacío, porque expondría tecnicismos en inglés y violaría RNF-2 y RF-4.
- Decisión 4: claves nuevas solo para el degradado; éxito/error/validación intactos. Alternativa descartada: reescribir los tres mensajes, porque rompería RF-1/RF-5/RF-6 y ampliaría la superficie bilingüe sin necesidad.

## Estrategia de verificación (comando de AGENTS.md)
Sin script de tests: verificación manual + `npm run lint` (frontend) + `npm run build` en frontend y backend.
- Rama degradada (RF-2 + RF-4): arrancar el backend sin clave y con destinatario configurado (AGENTS.md:20); enviar sugerencia válida en ES y en EN; la vista muestra la misma presentación del éxito con el cuerpo exacto; la pestaña de red muestra 201 con `emailSent:false`; ningún detalle técnico visible.
- Rama éxito (RF-1 + RF-3): inspección del mapeo `emailSent:true` → éxito intacto, más comprobación por el dueño con clave real cuando esté disponible (como RF-6 de la 002).
- Contradicciones (RF-3): respuestas `true` + detalle no nulo → éxito; `false` + detalle nulo → degradado.
- Fallos (RF-5): respuesta sin cuerpo / no interpretable / sin `emailSent`, petición inválida, servidor caído y red cortada → mensaje de error actual en ES y EN.
- Validación local (RF-6): texto <8 tras recortar → mensaje de validación actual sin tráfico en red; 8 exactos → se envía.
- Idioma (RF-7): generar en ES y EN, cambiar de idioma con el mensaje visible (no cambia), e idioma indeterminado → EN.
- Documentación (RF-8): lectura de la raíz; coherencia o registro de "no requiere cambios".
- Cierre: recorrido ES/EN → puerta → entrevista → sugerencia; `lint` y `build` front+back en verde.
