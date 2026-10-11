# Spec 005 — Feedback honesto de sugerencias

Estado: implementada

## Contexto y objetivo
El formulario de sugerencias confirma el envío como exitoso aunque el aviso por email no haya salido, porque ignora la señal de `emailSent` del contrato vigente. El visitante se va con una falsa confirmación y el contacto puede perderse. Esta spec alinea lo visible con el estado real: éxito intacto cuando el aviso salió y mensaje degradado claro y bilingüe, con la misma presentación del éxito, cuando la propuesta quedó recibida pero el aviso no se envió.

## Usuarios
- Visitante del portfolio (ES/EN) que propone una pregunta desde la entrevista.

## Historias de usuario
- HU-1. Como visitante que envía una sugerencia, quiero saber si mi propuesta quedó recibida aunque el aviso no se haya podido enviar para no quedarme con una confirmación falsa.

## Definiciones
- Éxito total: respuesta con `emailSent:true`. El detalle acompañante, si existe, no altera este caso.
- Estado degradado: respuesta con `emailSent:false`, sea cual sea el código 200 o 201 y sea cual sea el detalle acompañante (incluido vacío, nulo o ausente).
- Error de envío: respuesta sin cuerpo, con cuerpo no interpretable, sin campo `emailSent`, o petición que no llega a responderse (rechazo por validación, fallo del servidor o fallo de red).
- Presentación de éxito: el mismo panel actual de confirmación (mismo título, mismo icono y misma disposición); solo cambia el cuerpo del mensaje.
- Literal degradado: cuerpo fijo del estado degradado, exacto por idioma, sin prefijos ni sufijos ni puntuación añadida: ES "Recibida, pero el aviso no se envió" / EN "Received, but the notification was not sent".
- Mensaje de éxito actual: ES "Tu propuesta fue enviada. La revisaré pronto." / EN "Your suggestion was sent. I will review it soon.", con el título actual de éxito intacto.
- Mensaje de error actual: ES "No se pudo enviar la sugerencia. Intenta nuevamente." / EN "Could not send the suggestion. Please try again."
- Mensaje de validación actual: ES "Por favor escribe una pregunta con al menos 8 caracteres." / EN "Please write a question with at least 8 characters."
- Idioma congelado: idioma activo en el momento de pulsar el envío; el mensaje generado en ese idioma no cambia aunque después se cambie de idioma.
- Contrato vigente: la forma del 201 definida en la spec 002 (`emailSent` booleano y `error` cadena o nulo).

## Requisitos funcionales
- RF-1: CUANDO la respuesta trae `emailSent:true`, EL SISTEMA muestra la presentación de éxito con el título y el mensaje de éxito actuales en el idioma congelado, sin cambios.
- RF-2: CUANDO la respuesta trae `emailSent:false` con código 200 o 201, EL SISTEMA muestra la misma presentación de éxito (mismo título, icono y disposición) con el cuerpo sustituido por el literal degradado exacto en el idioma congelado, sin prefijos, sufijos ni cambios de puntuación.
- RF-3: SI los campos de la respuesta se contradicen, ENTONCES EL SISTEMA decide solo por `emailSent`: con `emailSent:true` muestra éxito total (RF-1) aunque el detalle no sea nulo, y con `emailSent:false` muestra el degradado (RF-2) aunque el detalle sea nulo, vacío o ausente.
- RF-4: EL SISTEMA nunca muestra en el formulario el detalle técnico acompañante, ni claves, ni información interna; en el estado degradado solo es visible el literal degradado de RF-2.
- RF-5: SI la respuesta llega sin cuerpo, con cuerpo no interpretable o sin campo `emailSent`, o la petición falla por rechazo de validación, fallo del servidor o fallo de red, ENTONCES EL SISTEMA muestra el mensaje de error actual en el idioma congelado, sin éxito (RF-1) ni degradado (RF-2).
- RF-6: SI el texto propuesto tiene menos de 8 caracteres tras recortar espacios, ENTONCES EL SISTEMA muestra el mensaje de validación actual en el idioma activo sin intentar ningún envío.
- RF-7: MIENTRAS el idioma activo sea ES o EN, EL SISTEMA genera cada mensaje (éxito, degradado, error, validación) en ese idioma y lo congela; SI el idioma es indeterminado al enviar, ENTONCES EL SISTEMA genera el mensaje en EN.
- RF-8: CUANDO la documentación pública raíz ya describa el resultado del envío de sugerencias, EL SISTEMA la mantiene coherente con éxito total (RF-1) frente a estado degradado (RF-2); si no describe el envío, no requiere cambios.

## Requisitos no funcionales
- RNF-1: Bilingüe completo ES/EN sin textos mezclados en la misma vista; el idioma congelado decide el mensaje ya generado.
- RNF-2: Ningún mensaje visible expone claves, valores de configuración ni detalles internos; el detalle técnico nunca se pinta.
- RNF-3: Sin cambios en el flujo ni en el orden del recorrido; el degradado reutiliza la presentación del éxito, sin panel, icono ni disposición nuevos.

## Casos límite
- Degradado con detalle vacío, nulo o ausente: degradado con literal exacto (RF-2 + RF-3), nunca vacío ni éxito.
- `emailSent:true` con detalle no nulo: éxito total (RF-3 manda `emailSent`).
- `emailSent:false` con detalle nulo: degradado con literal exacto, sin exponer nada (RF-2 + RF-4).
- 200 con `emailSent:false`: degradado (equivale al 201 degradado).
- 201 sin cuerpo, con cuerpo no interpretable o sin campo `emailSent`: error actual (RF-5).
- Servidor no disponible, red caída o espera agotada: error actual (RF-5).
- Texto de exactamente 8 caracteres tras recortar: válido, se intenta el envío.
- Cambio de idioma con mensaje ya visible: el mensaje congelado no cambia ni se mezcla.
- Idioma indeterminado al enviar: mensaje generado en EN (RF-7).

## Fuera de alcance
- Todo lo que no sea el formulario de sugerencias; el aviso de entrada no tiene superficie visible y queda explícitamente fuera.
- Reintentos de envío, colas, persistencia o almacenamiento de sugerencias.
- Cambios en el contrato del 201 o en el comportamiento del servidor.
- Cambios de flujo, pantallas, iconos, disposición o animaciones más allá de sustituir el cuerpo por el literal degradado.
- Textos nuevos fuera del literal degradado; éxito, error y validación quedan intactos.
- Endurecer fricción arcade (puerta, monedas, arranque).

## Criterios de finalización
Verificación manual + builds en verde. Mapa RF↔prueba (repetir cada rama en ES y en EN):
- RF-2 + RF-4 (rama degradada): arrancar el servidor sin clave y con destinatario configurado; enviar sugerencia válida y comprobar en la vista que aparece la misma presentación del éxito con el cuerpo exacto ES/EN de RF-2, sin detalle técnico; confirmar en la pestaña de red la respuesta 201 con `emailSent:false`.
- RF-1 (rama éxito): por inspección del mapeo `emailSent:true` → éxito intacto, más comprobación con clave real por el dueño cuando esté disponible (equivalente a RF-6 de la 002); en la vista aparece título y mensaje de éxito actuales.
- RF-3 (contradicciones): simular respuestas `emailSent:true` con detalle no nulo → éxito, y `emailSent:false` con detalle nulo → degradado con literal exacto.
- RF-5: forzar respuesta sin cuerpo, cuerpo no interpretable y sin campo `emailSent`, más petición inválida, servidor caído y red cortada; en todos aparece el mensaje de error actual ES/EN.
- RF-6: escribir menos de 8 caracteres tras recortar y comprobar el mensaje de validación actual sin tráfico de envío en la pestaña de red.
- RF-7: generar cada mensaje en ES y en EN, cambiar de idioma con el mensaje visible y comprobar que no cambia ni se mezcla; con idioma indeterminado el mensaje sale en EN.
- RF-8: leer la documentación pública raíz; si describe el envío, refleja éxito frente a degradado; si no lo describe, se registra "no requiere cambios".
- Cierre: recorrido ES/EN → puerta → entrevista → sugerencia completa; builds en verde.

## Dudas abiertas
- Ninguna pendiente. Decisión aplicada: el degradado reutiliza el mismo título de éxito actual con el cuerpo sustituido por el literal exacto.
