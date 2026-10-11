# Spec 006 — Higiene y anti-spam del backend

Estado: implementada

## Contexto y objetivo

El endpoint de sugerencias acepta texto sin tope de tamaño, lo inserta tal cual en el email que recibe el dueño (inyección de HTML), no limita el ritmo de peticiones (spam a coste del proveedor de email), acepta peticiones desde cualquier origen y no valida el formato del remitente configurado. Esta spec cierra esos huecos para proteger la bandeja del dueño y el coste de envío, manteniendo intacto el contrato de respuestas de la spec 002.

## Usuarios

- Visitante del portfolio (ES/EN) que envía una sugerencia o entra a la entrevista.
- Dueño del portfolio, que recibe los avisos por email y asume el coste de cada envío.

## Historias de usuario

- HU-1. Como visitante, quiero ver los límites de tamaño del formulario y un mensaje claro en mi idioma cuando los supero para no enviar a ciegas.
- HU-2. Como visitante que abusa o reintenta sin parar, quiero recibir un aviso de límite de ritmo para saber que debo esperar.
- HU-3. Como dueño, quiero que el contenido que escriben los visitantes llegue a mi email como texto literal (nunca como markup) y que nadie pueda usar mis endpoints para disparar envíos masivos.

## Definiciones

- Forma del 201 (fija, heredada de la spec 002): toda respuesta 201 de sugerencias y avisos tiene exactamente el cuerpo `{emailSent: boolean, error: string|null}`; `error` es `null` si y solo si `emailSent` es `true`.
- Texto recortado: texto y categoría con el whitespace Unicode de ambos extremos eliminado; lo recortado es lo que se valida y lo que se envía.
- Longitud: número de unidades de código JS (`.length`, igual que Zod); los emojis cuentan como pares sustitutos (p. ej. un emoji = 2).
- Origen permitido: origen web (esquema + dominio + puerto) desde el que el navegador puede llamar a los endpoints de envío.
- Ventana deslizante: intervalo exacto de 60 segundos hacia atrás desde cada petición; vive solo en memoria (si hay varias instancias o reinicios, los contadores divergen; aceptado y sin persistencia por RNF-1).
- Contador compartido: el ritmo se cuenta por IP sumando ambos endpoints de envío, no por separado.
- Detalle técnico: pila de llamadas, trazas, valores de claves o IPs internas; nunca llega al visitante.
- Remitente por defecto: dirección de envío usada cuando no se configura remitente; la actual se mantiene.

## Requisitos funcionales

- RF-1: CUANDO el sistema genera el aviso por email de una sugerencia, EL SISTEMA escapa en el texto y la categoría los caracteres `& < > " '` a sus entidades HTML y convierte los saltos de línea en `<br>`, de modo que el contenido llega como texto literal; EL SISTEMA no genera versión en texto plano.
- RF-2: EL SISTEMA recorta el texto y la categoría solo por los extremos (whitespace Unicode); lo recortado es lo que se valida y lo que se envía.
- RF-3: SI el texto recortado supera los 1000 caracteres, ENTONCES EL SISTEMA responde 400 sin intentar ningún envío.
- RF-4: SI la categoría recortada supera los 100 caracteres, ENTONCES EL SISTEMA responde 400 sin intentar ningún envío.
- RF-5: CUANDO el texto tiene exactamente 1000 caracteres y la categoría exactamente 100, EL SISTEMA los acepta como válidos (los topes son inclusivos).
- RF-6: MIENTRAS el visitante escribe la sugerencia, EL SISTEMA muestra bajo cada campo su contador siempre visible (`x/1000` en pregunta, `x/100` en categoría); CUANDO el texto o la categoría supera su tope, EL SISTEMA muestra un mensaje en el idioma activo, congelado al momento del envío como en la spec 005, y no realiza el envío.
- RF-7: MIENTRAS una misma IP acumule 10 peticiones dentro de la ventana deslizante sumando los dos endpoints de envío, EL SISTEMA responde a la siguiente petición con 429 sin intentar ningún envío; solo cuentan las peticiones a `POST` de sugerencias y de avisos (salud, preflights, rutas inexistentes y métodos inválidos no cuentan).
- RF-8: CUANDO el sistema responde 429 por límite de ritmo, EL SISTEMA responde JSON `{error: string}` con mensaje no vacío en español (convención actual de mensajes del backend) y sin detalle técnico; la comprobación de salud sigue respondiendo con normalidad.
- RF-9: EL SISTEMA aplica este orden de precedencia: primero el parser del cuerpo (malformado → 400, gigante por encima del límite del parser → 413), después el límite de ritmo (429), y por último la validación de tamaño (400).
- RF-10: SI la petición no trae cabecera de origen (p. ej. curl o llamadas servidor a servidor) o trae `Origin: null`, ENTONCES EL SISTEMA la permite sin añadir cabeceras de CORS; SI el origen no figura en la lista de permitidos, ENTONCES EL SISTEMA responde con el mismo estado pero sin cabeceras de CORS (sin crear ningún código nuevo); MIENTRAS el origen sí figura, EL SISTEMA atiende con las cabeceras correspondientes (sin credenciales; métodos `GET, POST, OPTIONS`; cabecera `Content-Type`).
- RF-11: EL SISTEMA lee la lista de orígenes permitidos de la variable `CORS_ORIGINS` (URLs separadas por comas; se recorta cada entrada, se pasa a minúsculas, se quita la barra final y se respeta el puerto; las entradas vacías o inválidas se ignoran); SI está ausente o queda vacía, ENTONCES EL SISTEMA usa los valores por defecto `http://localhost:5173` y `https://luisdasilva-site.vercel.app`; el subdominio debe coincidir de forma exacta.
- RF-12: SI el remitente configurado, tras recortar espacios, tiene valor pero no es una dirección de email estricta (solo dirección desnuda: `Nombre <mail>` o varias direcciones son inválidas; las mayúsculas sí valen), ENTONCES EL SISTEMA falla el arranque con salida no-cero, mensaje en el registro y puerto cerrado (igual que el destinatario); MIENTRAS el remitente está ausente o solo contiene espacios, EL SISTEMA arranca con el remitente por defecto.
- RF-13: CUANDO un intento de envío alcanza o supera los 10000 ms, EL SISTEMA lo da por superado y responde 201 con `emailSent:false` y mensaje genérico no vacío en español; el envío huérfano que termine después se ignora, sin reintentos.
- RF-14: EL SISTEMA mantiene los códigos y la forma de respuesta de la spec 002 para los 201 y 400; las únicas respuestas nuevas son el 429 de ritmo (RF-8) y el 413 de cuerpo gigante del parser; ningún fallo de envío produce 500.
- RF-15: EL SISTEMA documenta en el README de la raíz el comportamiento de esta spec con el contenido mínimo: topes de tamaño, límite de ritmo, CORS, remitente y timeout.

## Requisitos no funcionales

- RNF-1: Sin nuevas dependencias, sin base de datos, sin colas, sin reintentos y sin cambios de despliegue (la variable `CORS_ORIGINS` es configuración, no cambio de despliegue).
- RNF-2: Ninguna clave, traza ni IP interna aparece en cuerpos de respuesta HTTP ni en los registros del servidor.
- RNF-3: Código y comentarios en inglés; todo mensaje visible al visitante existe en ES y EN.
- RNF-4: Las IPs del contador de ritmo viven solo en memoria volátil de 60 s y no se registran en logs: no hay PII persistente.
- RNF-5: El límite de ritmo y los topes son protección anti-spam permitida, no fricción arcade: el flujo Language→Loading→Door→Interview no cambia.

## Casos límite

- Texto de 1001 caracteres o categoría de 101: 400 sin envío (RF-3, RF-4); 1000/100 exactos: válidos (RF-5).
- El recorte va primero: texto de 1001 caracteres que tras recortar queda en ≤1000 es válido; categoría de 100 espacios equivale a ausente (válida, al ser opcional); texto de solo espacios queda vacío y responde 400 por el mínimo de 8 sobre lo recortado (coherente con la spec 002).
- Texto con `<script>` u otras etiquetas: el email muestra el texto literal con entidades escapadas y `<br>` por salto de línea (RF-1).
- Peticiones concurrentes al contador: el incremento es síncrono en un único hilo, sin condición de carrera.
- Ráfaga: la 11.ª petición dentro de 60 s desde la misma IP (sumando ambos endpoints) responde 429 sin envío; pasada la ventana, se vuelve a permitir (RF-7).
- El límite de ritmo cuenta peticiones al endpoint aunque el cuerpo esté ausente (avisos sin cuerpo) o exceda los topes: el 429 prevalece sin intentar envío (RF-7, RF-9).
- Cuerpo gigante por encima del límite del parser: 413 sin llegar al contador; cuerpo malformado o no-JSON: 400 sin llegar al contador (RF-9).
- Preflight denegado: 204 sin cabeceras de CORS; permitido: 204 con cabeceras de CORS (verificación en Criterios).
- IP tras proxy de despliegue: se usa la IP del cliente tal como se ve tras el proxy; que la cabecera de reenvío sea falsificable o que varias personas compartan IP (NAT) es aceptable para este uso y está documentado aquí.
- Remitente con espacios alrededor: se recorta antes de validar; en mayúsculas: válido; varias direcciones o formato `Nombre <mail>`: inválido → no arranca (RF-12).
- Timeout: un envío que tiene éxito tras los 10 s se ignora porque ya se respondió degradado; un rechazo del proveedor y un timeout producen ambos `emailSent:false`, cada uno con su mensaje respectivo (RF-13).
- Los topes y el escape aplican donde hay texto/categoría (sugerencias); el ritmo aplica a ambos endpoints; el aviso de entrada solo lleva idioma opcional, como en la spec 002.
- El JSON de las respuestas nunca ejecuta HTML en el navegador y la interfaz no vuelve a mostrar el texto crudo enviado (a verificar por inspección en el plan).

## Fuera de alcance

- Base de datos, colas de envío, reintentos automáticos o almacenamiento de sugerencias.
- Nuevas dependencias o cambios de despliegue.
- Captchas u otras fricciones visibles más allá del mensaje de límite.
- Endurecer fricción arcade (puerta, monedas, boot).

## Criterios de finalización

Verificación manual (sin script de tests, según AGENTS.md) + builds en verde. Mapa RF↔prueba:

- RF-1: enviar sugerencia con `<b>`/`<script>` y saltos de línea; verificar por inspección de la función generadora que el HTML lleva entidades y `<br>`; con clave real, comprobar el caso en la bandeja del dueño cuando se dé.
- RF-2 + RF-3 + RF-4 + RF-5: texto de 1001 → 400; categoría de 101 → 400; 1000/100 exactos → 201 con la forma de la spec 002; texto de solo espacios → 400.
- RF-6: en el formulario ES y EN, contadores `x/1000` y `x/100` siempre visibles; al superar un tope aparece el mensaje en ese idioma y la pestaña de red muestra que no sale ninguna petición.
- RF-7 + RF-8 + RF-9: 11 peticiones en 60 s (mezclando ambos endpoints) desde la misma IP → 429 JSON `{error: "..."}` en español; `GET /health` sigue OK; cuerpo malformado → 400 antes que 429; validación de tamaño solo tras el 429.
- RF-10 + RF-11: preflight desde origen no permitido → 204 sin cabeceras de CORS; desde permitido → 204 con cabeceras; sin cabecera Origin → permitido sin cabeceras; la lista se gobierna por `CORS_ORIGINS` y en vacío rigen los dos defaults.
- RF-12: arrancar con remitente de formato inválido → salida no-cero con mensaje en el registro y puerto cerrado; sin remitente → arranca con el remitente por defecto.
- RF-13 + RF-14: en vivo, por inspección de la carrera de 10 s (y con un envío lento real si se da el caso): 201 con `emailSent:false` y mensaje genérico en español; ningún caso produce 500.
- RF-15: el README raíz contiene topes, ritmo, CORS, remitente y timeout.
- RNF-2: revisar respuestas HTTP y registros del servidor buscando clave, trazas o IPs internas: no aparecen.
- Cierre: flujo en navegador ES/EN → puerta → entrevista → sugerencia sin bloqueos; `build` de frontend y backend en verde más lint del frontend.

## Dudas abiertas

- Ninguna pendiente.
