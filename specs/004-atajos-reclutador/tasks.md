# Tasks 004 — Atajos de reclutador

- [x] **T1. Resolución pura del modo de entrada (normal vs deep-link).** RF-1, RF-2
  - Hecho cuando: `?go=interview` exacto da deep-link; falta/vacío/otro valor/mayúsculas/espacios/codificado/repetido/mixto da normal; params extra y fragmento se ignoran; verificable sin DOM.
- [x] **T2. Estado inicial directo en entrevista ES o flujo normal intacto.** RF-1, RF-2, RF-3
  - Hecho cuando: con deep-link se ve entrevista en ES sin vistas previas ni interacción previa; sin él empieza en idioma con orden e interacciones idénticos; recarga con parámetro reaplica ES y sin él vuelve a idioma.
- [x] **T3. HUD persistente CV/GitHub/contacto solo en entrevista por deep-link.** RF-5, RF-4, RF-3
  - Hecho cuando: visible toda la entrevista sin abrir mundos, inexistente en flujo normal, etiquetas en ES/EN, cada enlace a 1 interacción de su destino (CV descargado, GitHub/demo en pestaña, mailto/copia).
- [x] **T4. Esenciales sin monedas, costes iguales, idioma total y sugerencia igual.** RF-4, RF-3, RF-6
  - Hecho cuando: lo esencial a ≤2 interacciones sin monedas y resto con mismo coste; cambio ES↔EN coherente en entrevista+HUD+tutorial+aviso; sugerencia e2e igual que en flujo normal.
- [x] **T5. Aviso de entrada y tutorial reutilizados por deep-link.** RF-6, RNF-2
  - Hecho cuando: mismo aviso sin UI que en flujo normal y mismo tutorial con cierre en 1 interacción (botón o Escape); sin pasos ni pantallas nuevas; reducción de movimiento deja estado final.
- [x] **T6. README How It Works + verificación final manual y builds.** RF-7, RNF-1, RNF-3
  - Hecho cuando: `README.md` documenta parámetro, efecto y ejemplo; matriz con/sin deep-link × ES/EN × escritorio/375 px sin solapes ni bloqueos; `lint` y `build` front+back en verde.
