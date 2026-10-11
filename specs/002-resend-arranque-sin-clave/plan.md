# Plan 002 — Arranque sin clave de email

## Archivos que se crean o modifican
| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `backend/src/services/suggestionEmailService.ts` | MODIFICAR (cambio principal) | No tumbar la carga del módulo sin clave; distinguir ausencia / rechazo / interrupción / éxito; normalizar el resultado a la forma fija | RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-9, RF-11 |
| `backend/src/app.ts` | MODIFICAR (mínimo) | Mantener 201/400, no intentar envío si la validación falla, conservar `ok:true` por compatibilidad | RF-7, RF-8, RF-9, RNF-1 |
| `backend/src/env.ts` | SIN CAMBIOS (solo lectura) | Validación fail-fast del destinatario intacta | RF-10 |
| `frontend/*` | SIN CAMBIOS | Ningún cambio visual ni de flujo | RNF-3 |

## Lógica separada de la interfaz
- Lógica pura y comprobable sin red: `claveAusente(clave)` (ausente = sin valor, vacía o solo espacios), `fracaso(mensaje?)` (normaliza a `{emailSent:false, error no vacío}`), `exito()` (`{emailSent:true, error:null}`) e interpretación del resultado del proveedor (rechazo frente a éxito). Cubre RF-2, RF-3, RF-4, RF-6, RF-9.
- Borde con la red: una sola función de envío usa el cliente de email; la decisión del resultado nunca depende de la fecha, el DOM ni del estado global. Cubre RF-5, RF-11 (sin estado compartido entre peticiones concurrentes).

## Algoritmo (pseudocódigo)
```
resolverEnvio(intencion):
  SI claveAusente(clave): DEVOLVER {emailSent:false, error:"...clave ausente..."}  # RF-2/RF-3
  INTENTAR:
    resultado = proveedor.enviar(intencion)
    SI resultado es rechazo (hay error):
      mensaje = texto(resultado.error) O generico("...no se pudo enviar...")
      DEVOLVER {emailSent:false, error:mensaje}   # RF-4 (datos+error a la vez → esta rama)
    DEVOLVER {emailSent:true, error:null}        # RF-6
  CAPTURAR interrupcion (excepcion/red/espera):
    DEVOLVER {emailSent:false, error:texto(interrupcion)}  # RF-5, nunca 500
```
Notas: mensaje vacío/nulo del proveedor → genérico no vacío (RF-4, RF-9); cada petición concurrente ejecuta este algoritmo con sus propios datos, sin interferencias (RF-11).

## Interfaz
- Sin cambios visuales ni de flujo (RNF-3). HU-1 y HU-3 se cumplen por no bloquear; HU-2 es observable solo en el cuerpo de la respuesta HTTP, sin pintar nada nuevo.

## Datos: formato y compatibilidad
- Forma 201 garantizada: `{emailSent: boolean, error: string|null}`, con `error:null` si y solo si `emailSent:true` (RF-9).
- Compatibilidad: las respuestas actuales añaden además `ok:true`, que el lector del frontend consume; se conserva (superconjunto) para no romperlo, ya que el frontend está fuera de alcance. Los consumidores que leen `emailSent`/`error` no se ven afectados; códigos 201/400 intactos y ningún fallo de envío produce 500 (RNF-1).
- Nada se guarda ni migra; sin nuevas variables. La clave jamás aparece en respuestas HTTP ni se imprime su valor en registros (RNF-2).

## Decisiones técnicas
- D1: No construir el cliente de email durante la carga del módulo cuando falta la clave (construcción protegida tras la comprobación). Alternativa descartada: envolver la construcción en carga con try/catch — frágil, mantiene el acoplamiento arranque-red y cualquier otro throw volvería a tumbar el proceso. Cubre RF-1.
- D2: Tratar clave vacía o con solo espacios igual que ausente. Alternativa descartada: distinción literal entre formas — violaría la definición de la spec y dejaría un arranque caído por un valor en blanco. Cubre RF-1, RF-2, RF-3.
- D3: Normalizar el mensaje vacío/nulo del proveedor a un genérico no vacío. Alternativa descartada: propagar el mensaje tal cual — violaría RF-4/RF-9. Cubre RF-4, RF-9.
- D4: Conservar `ok:true` en el 201 junto a la forma fija. Alternativa descartada: eliminarlo para literalidad de "exactamente" (RF-9) — rompería el lector actual del frontend, fuera de alcance. Si el usuario prefiere literalidad, pedir micro-aclaración a la spec. Cubre RNF-1, RNF-3.
- D5: Sin reintentos, colas ni almacenamiento. Alternativas descartadas por fuera de alcance y stack mínimo (constitución 1).

## Estrategia de tests (verificación manual, sin suite automatizada)
AGENTS.md no tiene script de tests: verificación manual con curl + builds + lint.
- Arranque: `cd backend && npm run dev` sin clave (con destinatario válido) → proceso en pie y `GET /health` 200 (RF-1, RF-10 en negativo sin destinatario).
- Contratos: curl `POST /api/suggestions` válida → 201 `false` + error no vacío (RF-2); `POST /api/door-entry` sin cuerpo → 201 `false` (RF-3); sugerencia corta → 400 (RF-7); aviso con idioma inválido → 400, sin cuerpo → 201 (RF-8); con clave inválida ambos → 201 `false`, nunca 500 ni `true` (RF-4, RF-5); con clave válida (si disponible) → 201 `true`/`null` (RF-6); forma exacta en cada 201 (RF-9); dos peticiones a la vez independientes (RF-11).
- Cierre: `cd frontend && npm run lint`, `npm run build` en frontend y backend en verde, más flujo en navegador ES/EN → puerta → entrevista → sugerencia sin bloqueos (constitución 4).
