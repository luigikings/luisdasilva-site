# Spec 002 — Arranque sin clave de email

Estado: implementada

## Contexto y objetivo
El servidor de sugerencias no arranca cuando falta la clave del proveedor de email, y cuando la clave es inválida informa de un envío correcto aunque el correo no salió. Esto contradice la regla documentada (arrancar igual y responder `emailSent:false`) y deja al visitante sin diagnóstico real. Esta spec restaura ese contrato para que el portfolio siga recibiendo visitas y sugerencias con degradación visible pero sin caídas.

## Usuarios
- Visitante del portfolio (ES/EN) que entra a la entrevista o envía una sugerencia.
- Dueño del portfolio, que necesita saber si el aviso por email llegó o no.

## Historias de usuario
- HU-1. Como visitante, quiero entrar a la entrevista aunque el email falle para no quedarme bloqueado.
- HU-2. Como visitante que envía una sugerencia, quiero que la respuesta HTTP indique si el aviso se envió o no para tener expectativas correctas (observable en la respuesta, sin cambio de interfaz).
- HU-3. Como dueño, quiero que el servidor arranque sin clave de email para que la web siga disponible en entornos sin correo configurado.

## Definiciones
- Clave ausente: la clave de email no tiene valor, es cadena vacía o contiene solo espacios en blanco. Las tres formas se tratan igual en toda esta spec.
- Sugerencia válida: cuerpo JSON con `text` de al menos 8 caracteres tras recortar espacios, `category` opcional y `lang` opcional con valor `es` o `en`.
- Aviso válido: cuerpo ausente, cuerpo vacío u objeto JSON con `lang` opcional (`es` o `en`); la ausencia de cuerpo o de cabecera de contenido también es válida.
- Rechazo comunicado: el proveedor responde que el envío no se aceptó (por ejemplo, clave inválida) y devuelve un error como resultado.
- Fallo con interrupción: el intento de envío no llega a devolver un resultado normal porque la llamada se interrumpe (excepción, fallo de red o espera agotada).
- Forma del 201 (fija): toda respuesta 201 de sugerencias y avisos tiene exactamente el cuerpo `{emailSent: boolean, error: string|null}`; `error` es `null` si y solo si `emailSent` es `true`.
- Destinatario: dirección de entrega configurada (SUGGESTION_EMAIL_TO); sigue siendo obligatoria y su ausencia falla el arranque como hoy.

## Requisitos funcionales
- RF-1: CUANDO el servidor arranca con la clave ausente y el destinatario configurado, EL SISTEMA completa el arranque y deja disponibles la comprobación de salud y los dos endpoints de envío (sugerencias y avisos).
- RF-2: MIENTRAS la clave está ausente, EL SISTEMA responde a cada sugerencia válida con 201, `emailSent:false` y `error` con un mensaje no vacío que indica clave ausente.
- RF-3: MIENTRAS la clave está ausente, EL SISTEMA responde a cada aviso válido (incluido sin cuerpo) con 201, `emailSent:false` y `error` con un mensaje no vacío que indica clave ausente.
- RF-4: CUANDO el proveedor comunica un rechazo en sugerencias o en avisos, EL SISTEMA responde 201 con `emailSent:false` y `error` no vacío con el mensaje del proveedor; SI ese mensaje viene vacío o nulo, ENTONCES EL SISTEMA sustituye un mensaje genérico no vacío.
- RF-5: CUANDO el envío se interrumpe por excepción, fallo de red o espera agotada en sugerencias o en avisos, EL SISTEMA responde 201 con `emailSent:false` y `error` no vacío, sin responder 500 ni propagar la interrupción.
- RF-6: CUANDO el proveedor acepta el envío en sugerencias o en avisos, EL SISTEMA responde 201 con `emailSent:true` y `error:null`.
- RF-7: SI la petición a sugerencias no cumple la validación (incluido JSON malformado o cuerpo no JSON), ENTONCES EL SISTEMA responde 400 sin intentar ningún envío.
- RF-8: SI la petición a avisos trae un cuerpo inválido (por ejemplo, idioma distinto de `es`/`en`), ENTONCES EL SISTEMA responde 400 sin intentar ningún envío; un aviso sin cuerpo, con cuerpo vacío o sin cabecera de contenido es válido y sigue RF-3, RF-4, RF-5 o RF-6.
- RF-9: EL SISTEMA responde a cada 201 de sugerencias y de avisos con exactamente `{emailSent: boolean, error: string|null}`, donde `error` es `null` si y solo si `emailSent` es `true`.
- RF-10: SI el destinatario está ausente o es inválido, ENTONCES EL SISTEMA falla el arranque durante la validación de configuración y el proceso no arranca; en ese caso RF-1 no aplica (el destinatario prevalece sobre la clave).
- RF-11: MIENTRAS dos envíos se ejecutan a la vez, EL SISTEMA responde a cada petición de forma independiente con el mismo contrato (RF-9), sin que el resultado de una altere el de la otra.

## Requisitos no funcionales
- RNF-1: Contrato estable: los 201 mantienen códigos y la forma fija `{emailSent, error}` y los 400 se mantienen para peticiones inválidas; el campo `error` ya existía en el tipo de respuesta, solo cambia su contenido (ahora refleja el error real del proveedor); ningún fallo del envío (rechazo, excepción, red, espera) produce nunca un 500.
- RNF-2: La clave de email nunca aparece en ningún cuerpo de respuesta HTTP; su valor tampoco se imprime en los registros del servidor ("registros" = ficheros/salida de log del servidor, no visibles al visitante; las respuestas HTTP sí lo son).
- RNF-3: Sin nuevas dependencias, sin base de datos, sin cambios de despliegue y sin cambios visibles en el frontend; HU-2 se observa solo en la respuesta HTTP.

## Casos límite
- Clave con solo espacios: se trata como ausente (RF-2, RF-3).
- Rechazo con mensaje vacío/nulo y sin datos: mensaje genérico no vacío, `emailSent:false` (RF-4).
- Rechazo que devuelve datos y error a la vez: se trata como fallo, `emailSent:false` con el mensaje del error (RF-4).
- JSON malformado o `Content-Type` inesperado (texto plano) en sugerencias: 400 sin envío (RF-7); en avisos con cuerpo inválido: 400 (RF-8).
- Fallo de red o espera agotada: 201 con `emailSent:false`, nunca 500 (RF-5).
- Aviso sin cuerpo o sin cabecera de contenido: válido, 201 con el estado real del envío (RF-3, RF-8).
- Destinatario ausente o inválido: el arranque falla durante la validación aunque la clave también falte; este fix solo cubre la clave (RF-10).
- Doble envío concurrente: cada petición se responde por separado con el contrato intacto (RF-11).

## Fuera de alcance
- Cambios en el frontend, textos de la interfaz o flujo de pantallas.
- Cambios de despliegue, variables nuevas o nuevas dependencias.
- Cambiar qué configuración es obligatoria (el destinatario sigue siendo requerido).
- Reintentos de envío, colas o almacenamiento de sugerencias.
- Endurecer fricción arcade (puerta, monedas, boot).

## Criterios de finalización
Verificación manual (sin script de tests, según AGENTS.md) + builds en verde. Mapa RF↔prueba:
- RF-1: arrancar el backend sin clave y con destinatario válido; el proceso sigue en pie y `GET /health` responde 200.
- RF-2 + RF-9: `POST /api/suggestions` con cuerpo válido responde 201 `{emailSent:false, error:"..." no vacío}`.
- RF-3 + RF-9: `POST /api/door-entry` sin cuerpo responde 201 `{emailSent:false, error:"..." no vacío}`.
- RF-7: `POST /api/suggestions` con texto de menos de 8 caracteres responde 400 sin envío.
- RF-8: `POST /api/door-entry` con idioma inválido responde 400; sin cuerpo responde 201.
- RF-4 + RF-5: con clave presente pero inválida (o red bloqueada), ambos endpoints responden 201 `{emailSent:false, error no vacío}` y nunca 500 ni `emailSent:true`.
- RF-6 + RF-9: solo si hay clave válida disponible, ambos endpoints responden 201 `{emailSent:true, error:null}`.
- RF-10: arrancar sin destinatario no arranca (falla la validación), prevalece sobre RF-1.
- RF-11: lanzar dos peticiones válidas a la vez; cada una responde 201 con su propio `emailSent`/`error` según RF-9.
- Cierre: flujo en navegador ES/EN → puerta → entrevista → sugerencia completa sin bloqueos (cada envío degradado responde 201 con `emailSent:false` en la pestaña de red); `build` de frontend y backend en verde más lint del frontend, sin tests automatizados.

## Dudas abiertas
- Ninguna pendiente para este fix. Aplazadas fuera de alcance: reintentos de envío, mensajes de error bilingües y almacenamiento de sugerencias.
