# Checklist de contraste AA — spec 007 (T8, RF-6, RNF-1)

Fecha: 2026-10-12. Umbrales: 4.5:1 texto normal, 3:1 texto grande y componentes de interfaz. Valores a 2 decimales, sin redondeo a favor (se compara el valor ya redondeado a 2 decimales con el umbral).

## Método

- Herramienta: script propio `contrast.mjs` (Node, sin dependencias) que aplica la fórmula WCAG 2.x de luminancia relativa y composición alfa por canal sobre los tokens reales de `tailwind.config.js` y los valores inline de los componentes. No hay estimaciones: cada fila sale del script.
- Esta medida es por cálculo sobre los valores de color del código, no una lectura de DevTools/axe: el entorno de implementación no tiene navegador. La medición visual con DevTools/axe sobre la web renderizada queda como protocolo pendiente para T10 (no cambia los valores de color fuente).
- Fondos de referencia por combinación: **oscuro** = `night` #0b0620 (el más oscuro de la página) y **claro** = el pico decorativo del sol sintético (coin al 40 % sobre night, #6d582c, solo vistas con rejilla). En la vista de entrevista no hay sol: su fondo más claro es la nebulosa morada (purple/25 sobre #2a0f5c), usada en las filas de conversación. Las superficies translúcidas (`abyss/80`, `panel/90`, etc.) se componen sobre ambos fondos; las opacas aparecen una sola vez.
- Estados medidos: normal, hover (incluido el filtro `brightness(1.08) saturate(1.1)` de `.btn-arcade`, calculado con la matriz de Filter Effects), foco (enlace de salto), inactivo (idioma no elegido) y deshabilitado. En botones se mide además el velo blanco superior del 35 % de `.btn-arcade` (peor caso para texto claro).
- Texto grande: solo se aplica 3:1 a ≥ 24 px o ≥ 18,66 px en negrita (el infinito `∞` de la tarjeta de mundo y los bordes/pulgar de componentes). Todo lo demás se mide a 4.5:1.

## Exentos (WCAG 1.4.3 / 1.4.11)

- Texto o iconos puramente decorativos: estrellas y nebulosas del fondo, rejilla synthwave, sol, escáner CRT, destellos y brillos de aviso (`pointer-events-none`, `aria-hidden`), partículas de confeti/monedas.
- Logotipos e imagen del personaje (`LK_hablando1.png`), banderas de idioma (imágenes con `aria-label` en el botón) y el emoji de cada mundo/aviso (`aria-hidden`; el texto equivalente está al lado).
- Botones deshabilitados (`.btn-arcade:disabled`, opacidad 50 %): exentos por ser componentes inactivos; se listan sus valores medidos y el estado se comunica además por texto (botón de comenzar hasta completar la carga).
- Contornos de tarjetas y botones (`border-line`) cuando el texto interior ya identifica el control y el foco (T3) ya tiene su medida; sí se mide el borde del campo de texto, que es el único límite del control.

## Ajustes de color aplicados (mínimos, sin tocar textos, tiempos ni animaciones)

1. `text-muted/60`, `text-muted/70`, `placeholder:text-muted/50` pasan a `text-muted` (plano) en pie, pista de teclado, pista Esc, contadores de sugerencia y marcador de posición (de 2.78–4.42 a ≥ 4.5).
2. Botones `.btn-arcade` sobre `neonCyan`, `neonPurple` y `neonPink` y etiquetas "LK"/nivel/número sobre `neonPink`: texto `ink` → `night` (de 1.24–3.55 a 5.06–15.23; el velo blanco superior sube el contraste, no lo baja).
3. Tarjetas de mundo: contador, aviso "sin monedas" e insignia COMPLETADO/CLEAR llevan un chip `bg-abyss/80` (de 2.27–4.46 a ≥ 5.62 sobre el tramo más claro del degradado).
4. Tarjeta de idioma no elegido: `opacity-60` → `opacity-80` (de 2.97 a ≥ 4.5; sigue siendo visiblemente atenuada).
5. Borde del campo de sugerencia: `border-line` → `#6a5bb0` (de 1.55 a ≥ 3.26).

Archivos tocados: `Interview.tsx`, `LanguageIntroScreen.tsx`, `LoadingScreen.tsx`, `DoorScene.tsx`, `SuggestionPrompt.tsx`, `interview/ConversationPanel.tsx`, `interview/HudBar.tsx`, `interview/InterviewNav.tsx`, `interview/RecruiterQuickBar.tsx`, `pages/InterviewExperience.tsx`.

## Resultado

- Combinaciones medidas tras el ajuste: 195 (187 pasa, 8 exentas por deshabilitado, **0 no-pasa**).
- Combinaciones que fallaban antes del ajuste (evidencia): 33 filas, abajo.

## Checklist tras el ajuste

| # | Combinación | Texto sobre fondo | Fondo de referencia | Estado | Umbral | Medido | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | Texto base de pagina | ink sobre night | oscuro | normal | 4.5:1 | 17.79:1 | pasa |
| 2 | Enlaces hover/foco | neonCyan sobre night | oscuro | hover | 4.5:1 | 12.83:1 | pasa |
| 3 | Texto principal ink | ink sobre abyss/80 | oscuro | normal | 4.5:1 | 18.16:1 | pasa |
| 4 | Texto principal ink | ink sobre abyss/80 | claro | normal | 4.5:1 | 16.26:1 | pasa |
| 5 | Texto secundario muted | muted sobre abyss/80 | oscuro | normal | 4.5:1 | 8.29:1 | pasa |
| 6 | Texto secundario muted | muted sobre abyss/80 | claro | normal | 4.5:1 | 7.42:1 | pasa |
| 7 | Texto ink/80 | ink/80 sobre abyss/80 | oscuro | normal | 4.5:1 | 11.55:1 | pasa |
| 8 | Texto ink/80 | ink/80 sobre abyss/80 | claro | normal | 4.5:1 | 10.68:1 | pasa |
| 9 | Texto principal ink | ink sobre abyss/95 | oscuro | normal | 4.5:1 | 18.27:1 | pasa |
| 10 | Texto principal ink | ink sobre abyss/95 | claro | normal | 4.5:1 | 17.86:1 | pasa |
| 11 | Texto secundario muted | muted sobre abyss/95 | oscuro | normal | 4.5:1 | 8.34:1 | pasa |
| 12 | Texto secundario muted | muted sobre abyss/95 | claro | normal | 4.5:1 | 8.15:1 | pasa |
| 13 | Texto ink/80 | ink/80 sobre abyss/95 | oscuro | normal | 4.5:1 | 11.53:1 | pasa |
| 14 | Texto ink/80 | ink/80 sobre abyss/95 | claro | normal | 4.5:1 | 11.38:1 | pasa |
| 15 | Texto principal ink | ink sobre panel | oscuro | normal | 4.5:1 | 16.45:1 | pasa |
| 16 | Texto secundario muted | muted sobre panel | oscuro | normal | 4.5:1 | 7.51:1 | pasa |
| 17 | Texto ink/80 | ink/80 sobre panel | oscuro | normal | 4.5:1 | 10.67:1 | pasa |
| 18 | Texto principal ink | ink sobre panel/90 | oscuro | normal | 4.5:1 | 16.61:1 | pasa |
| 19 | Texto principal ink | ink sobre panel/90 | claro | normal | 4.5:1 | 15.47:1 | pasa |
| 20 | Texto secundario muted | muted sobre panel/90 | oscuro | normal | 4.5:1 | 7.58:1 | pasa |
| 21 | Texto secundario muted | muted sobre panel/90 | claro | normal | 4.5:1 | 7.06:1 | pasa |
| 22 | Texto ink/80 | ink/80 sobre panel/90 | oscuro | normal | 4.5:1 | 10.77:1 | pasa |
| 23 | Texto ink/80 | ink/80 sobre panel/90 | claro | normal | 4.5:1 | 10.23:1 | pasa |
| 24 | Texto principal ink | ink sobre panel/95 | oscuro | normal | 4.5:1 | 16.51:1 | pasa |
| 25 | Texto principal ink | ink sobre panel/95 | claro | normal | 4.5:1 | 15.99:1 | pasa |
| 26 | Texto secundario muted | muted sobre panel/95 | oscuro | normal | 4.5:1 | 7.54:1 | pasa |
| 27 | Texto secundario muted | muted sobre panel/95 | claro | normal | 4.5:1 | 7.30:1 | pasa |
| 28 | Texto ink/80 | ink/80 sobre panel/95 | oscuro | normal | 4.5:1 | 10.71:1 | pasa |
| 29 | Texto ink/80 | ink/80 sobre panel/95 | claro | normal | 4.5:1 | 10.47:1 | pasa |
| 30 | Texto principal ink | ink sobre panelHi | oscuro | normal | 4.5:1 | 14.49:1 | pasa |
| 31 | Texto secundario muted | muted sobre panelHi | oscuro | normal | 4.5:1 | 6.62:1 | pasa |
| 32 | Texto ink/80 | ink/80 sobre panelHi | oscuro | normal | 4.5:1 | 9.62:1 | pasa |
| 33 | Texto principal ink | ink sobre night | oscuro | normal | 4.5:1 | 17.79:1 | pasa |
| 34 | Texto secundario muted | muted sobre night | oscuro | normal | 4.5:1 | 8.12:1 | pasa |
| 35 | Texto ink/80 | ink/80 sobre night | oscuro | normal | 4.5:1 | 11.33:1 | pasa |
| 36 | Texto de acento neonCyan | neonCyan sobre abyss/80 | oscuro | normal | 4.5:1 | 13.10:1 | pasa |
| 37 | Texto de acento neonCyan | neonCyan sobre abyss/80 | claro | normal | 4.5:1 | 11.73:1 | pasa |
| 38 | Texto de acento neonLime | neonLime sobre abyss/80 | oscuro | normal | 4.5:1 | 15.75:1 | pasa |
| 39 | Texto de acento neonLime | neonLime sobre abyss/80 | claro | normal | 4.5:1 | 14.11:1 | pasa |
| 40 | Texto de acento neonPink | neonPink sobre abyss/80 | oscuro | normal | 4.5:1 | 6.24:1 | pasa |
| 41 | Texto de acento neonPink | neonPink sobre abyss/80 | claro | normal | 4.5:1 | 5.59:1 | pasa |
| 42 | Texto de acento coin | coin sobre abyss/80 | oscuro | normal | 4.5:1 | 13.99:1 | pasa |
| 43 | Texto de acento coin | coin sobre abyss/80 | claro | normal | 4.5:1 | 12.53:1 | pasa |
| 44 | Texto de acento danger | danger sobre abyss/80 | oscuro | normal | 4.5:1 | 6.23:1 | pasa |
| 45 | Texto de acento danger | danger sobre abyss/80 | claro | normal | 4.5:1 | 5.58:1 | pasa |
| 46 | Texto de acento violet b38bff | violet b38bff sobre abyss/80 | oscuro | normal | 4.5:1 | 7.75:1 | pasa |
| 47 | Texto de acento violet b38bff | violet b38bff sobre abyss/80 | claro | normal | 4.5:1 | 6.94:1 | pasa |
| 48 | Texto de acento neonCyan | neonCyan sobre panel | oscuro | normal | 4.5:1 | 11.86:1 | pasa |
| 49 | Texto de acento neonLime | neonLime sobre panel | oscuro | normal | 4.5:1 | 14.27:1 | pasa |
| 50 | Texto de acento neonPink | neonPink sobre panel | oscuro | normal | 4.5:1 | 5.65:1 | pasa |
| 51 | Texto de acento coin | coin sobre panel | oscuro | normal | 4.5:1 | 12.68:1 | pasa |
| 52 | Texto de acento danger | danger sobre panel | oscuro | normal | 4.5:1 | 5.64:1 | pasa |
| 53 | Texto de acento violet b38bff | violet b38bff sobre panel | oscuro | normal | 4.5:1 | 7.02:1 | pasa |
| 54 | Texto de acento neonCyan | neonCyan sobre panel/90 | oscuro | normal | 4.5:1 | 11.98:1 | pasa |
| 55 | Texto de acento neonCyan | neonCyan sobre panel/90 | claro | normal | 4.5:1 | 11.15:1 | pasa |
| 56 | Texto de acento neonLime | neonLime sobre panel/90 | oscuro | normal | 4.5:1 | 14.41:1 | pasa |
| 57 | Texto de acento neonLime | neonLime sobre panel/90 | claro | normal | 4.5:1 | 13.42:1 | pasa |
| 58 | Texto de acento neonPink | neonPink sobre panel/90 | oscuro | normal | 4.5:1 | 5.71:1 | pasa |
| 59 | Texto de acento neonPink | neonPink sobre panel/90 | claro | normal | 4.5:1 | 5.31:1 | pasa |
| 60 | Texto de acento coin | coin sobre panel/90 | oscuro | normal | 4.5:1 | 12.80:1 | pasa |
| 61 | Texto de acento coin | coin sobre panel/90 | claro | normal | 4.5:1 | 11.92:1 | pasa |
| 62 | Texto de acento danger | danger sobre panel/90 | oscuro | normal | 4.5:1 | 5.70:1 | pasa |
| 63 | Texto de acento danger | danger sobre panel/90 | claro | normal | 4.5:1 | 5.31:1 | pasa |
| 64 | Texto de acento violet b38bff | violet b38bff sobre panel/90 | oscuro | normal | 4.5:1 | 7.09:1 | pasa |
| 65 | Texto de acento violet b38bff | violet b38bff sobre panel/90 | claro | normal | 4.5:1 | 6.60:1 | pasa |
| 66 | Texto de acento neonCyan | neonCyan sobre night | oscuro | normal | 4.5:1 | 12.83:1 | pasa |
| 67 | Texto de acento neonLime | neonLime sobre night | oscuro | normal | 4.5:1 | 15.43:1 | pasa |
| 68 | Texto de acento neonPink | neonPink sobre night | oscuro | normal | 4.5:1 | 6.11:1 | pasa |
| 69 | Texto de acento coin | coin sobre night | oscuro | normal | 4.5:1 | 13.70:1 | pasa |
| 70 | Texto de acento danger | danger sobre night | oscuro | normal | 4.5:1 | 6.10:1 | pasa |
| 71 | Texto de acento violet b38bff | violet b38bff sobre night | oscuro | normal | 4.5:1 | 7.59:1 | pasa |
| 72 | Boton cerrar hover danger | danger sobre panel | oscuro | hover | 4.5:1 | 5.64:1 | pasa |
| 73 | Boton X aviso hover ink | ink sobre abyss/95 | oscuro | hover | 4.5:1 | 18.27:1 | pasa |
| 74 | Boton X aviso hover ink | ink sobre abyss/95 | claro | hover | 4.5:1 | 17.86:1 | pasa |
| 75 | HUD infinito activo | neonLime sobre neonLime/15 sobre abyss/80 | oscuro | normal | 4.5:1 | 11.72:1 | pasa |
| 76 | HUD infinito activo | neonLime sobre neonLime/15 sobre abyss/80 | claro | normal | 4.5:1 | 9.79:1 | pasa |
| 77 | Conversacion etiqueta cian | neonCyan sobre neonCyan/10 sobre fondo | oscuro | normal | 4.5:1 | 11.01:1 | pasa |
| 78 | Conversacion etiqueta cian | neonCyan sobre neonCyan/10 sobre fondo | claro (nebulosa) | normal | 4.5:1 | 6.33:1 | pasa |
| 79 | Conversacion texto ink | ink sobre neonCyan/10 sobre fondo | oscuro | normal | 4.5:1 | 15.26:1 | pasa |
| 80 | Conversacion texto ink | ink sobre neonCyan/10 sobre fondo | claro (nebulosa) | normal | 4.5:1 | 8.78:1 | pasa |
| 81 | Sugerencia exito lima | neonLime sobre neonLime/10 sobre panel | oscuro | normal | 4.5:1 | 11.76:1 | pasa |
| 82 | Sugerencia exito ink/80 | ink/80 sobre neonLime/10 sobre panel | oscuro | normal | 4.5:1 | 9.17:1 | pasa |
| 83 | Sugerencia disparador ink | ink sobre neonPink/10 sobre fondo | oscuro | normal | 4.5:1 | 16.24:1 | pasa |
| 84 | Sugerencia disparador ink | ink sobre neonPink/10 sobre fondo | claro | normal | 4.5:1 | 5.87:1 | pasa |
| 85 | Sugerencia disparador hover ink | ink sobre neonPink/20 sobre fondo | oscuro | hover | 4.5:1 | 14.13:1 | pasa |
| 86 | Sugerencia disparador hover ink | ink sobre neonPink/20 sobre fondo | claro | hover | 4.5:1 | 5.55:1 | pasa |
| 87 | Insignia nivel/LK night sobre neonPink | night sobre neonPink | oscuro | normal | 4.5:1 | 6.11:1 | pasa |
| 88 | Tarjeta mundo cian titulo | ink sobre gradiente cyan/0.35 sobre panel | oscuro | normal | 4.5:1 | 6.90:1 | pasa |
| 89 | Tarjeta mundo cian contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente cyan/0.35 sobre panel | oscuro | normal | 4.5:1 | 7.52:1 | pasa |
| 90 | Tarjeta mundo cian sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente cyan/0.35 sobre panel | oscuro | normal | 4.5:1 | 5.65:1 | pasa |
| 91 | Tarjeta mundo cian insignia COMPLETADO (chip abyss/80) | cyan sobre chip abyss/80 sobre gradiente cyan/0.35 sobre panel | oscuro | normal | 4.5:1 | 11.87:1 | pasa |
| 92 | Tarjeta mundo cian infinito (texto grande) | neonLime sobre gradiente cyan/0.35 sobre panel | oscuro | normal | 3:1 | 5.99:1 | pasa |
| 93 | Tarjeta mundo cian titulo | ink sobre gradiente purple/0.15 sobre panel | oscuro | normal | 4.5:1 | 13.78:1 | pasa |
| 94 | Tarjeta mundo cian contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente purple/0.15 sobre panel | oscuro | normal | 4.5:1 | 8.05:1 | pasa |
| 95 | Tarjeta mundo cian sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente purple/0.15 sobre panel | oscuro | normal | 4.5:1 | 6.05:1 | pasa |
| 96 | Tarjeta mundo cian insignia COMPLETADO (chip abyss/80) | cyan sobre chip abyss/80 sobre gradiente purple/0.15 sobre panel | oscuro | normal | 4.5:1 | 12.71:1 | pasa |
| 97 | Tarjeta mundo cian infinito (texto grande) | neonLime sobre gradiente purple/0.15 sobre panel | oscuro | normal | 3:1 | 11.95:1 | pasa |
| 98 | Etiqueta personaje acento cian | night sobre acento cyan | oscuro | normal | 4.5:1 | 12.83:1 | pasa |
| 99 | Etiqueta mundo seleccionado cian | cyan sobre panel | oscuro | normal | 4.5:1 | 11.86:1 | pasa |
| 100 | Tarjeta mundo rosa titulo | ink sobre gradiente pink/0.35 sobre panel | oscuro | normal | 4.5:1 | 9.77:1 | pasa |
| 101 | Tarjeta mundo rosa contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente pink/0.35 sobre panel | oscuro | normal | 4.5:1 | 7.81:1 | pasa |
| 102 | Tarjeta mundo rosa sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente pink/0.35 sobre panel | oscuro | normal | 4.5:1 | 5.87:1 | pasa |
| 103 | Tarjeta mundo rosa insignia COMPLETADO (chip abyss/80) | pink sobre chip abyss/80 sobre gradiente pink/0.35 sobre panel | oscuro | normal | 4.5:1 | 5.88:1 | pasa |
| 104 | Tarjeta mundo rosa infinito (texto grande) | neonLime sobre gradiente pink/0.35 sobre panel | oscuro | normal | 3:1 | 8.47:1 | pasa |
| 105 | Tarjeta mundo rosa titulo | ink sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 13.09:1 | pasa |
| 106 | Tarjeta mundo rosa contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 7.99:1 | pasa |
| 107 | Tarjeta mundo rosa sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 6.00:1 | pasa |
| 108 | Tarjeta mundo rosa insignia COMPLETADO (chip abyss/80) | pink sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 6.01:1 | pasa |
| 109 | Tarjeta mundo rosa infinito (texto grande) | neonLime sobre gradiente orange/0.15 sobre panel | oscuro | normal | 3:1 | 11.36:1 | pasa |
| 110 | Etiqueta personaje acento rosa | night sobre acento pink | oscuro | normal | 4.5:1 | 6.11:1 | pasa |
| 111 | Etiqueta mundo seleccionado rosa | pink sobre panel | oscuro | normal | 4.5:1 | 5.65:1 | pasa |
| 112 | Tarjeta mundo lima titulo | ink sobre gradiente lime/0.3 sobre panel | oscuro | normal | 4.5:1 | 7.34:1 | pasa |
| 113 | Tarjeta mundo lima contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente lime/0.3 sobre panel | oscuro | normal | 4.5:1 | 7.55:1 | pasa |
| 114 | Tarjeta mundo lima sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente lime/0.3 sobre panel | oscuro | normal | 4.5:1 | 5.68:1 | pasa |
| 115 | Tarjeta mundo lima insignia COMPLETADO (chip abyss/80) | lime sobre chip abyss/80 sobre gradiente lime/0.3 sobre panel | oscuro | normal | 4.5:1 | 14.35:1 | pasa |
| 116 | Tarjeta mundo lima infinito (texto grande) | neonLime sobre gradiente lime/0.3 sobre panel | oscuro | normal | 3:1 | 6.37:1 | pasa |
| 117 | Tarjeta mundo lima titulo | ink sobre gradiente cyan/0.12 sobre panel | oscuro | normal | 4.5:1 | 13.11:1 | pasa |
| 118 | Tarjeta mundo lima contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente cyan/0.12 sobre panel | oscuro | normal | 4.5:1 | 8.00:1 | pasa |
| 119 | Tarjeta mundo lima sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente cyan/0.12 sobre panel | oscuro | normal | 4.5:1 | 6.01:1 | pasa |
| 120 | Tarjeta mundo lima insignia COMPLETADO (chip abyss/80) | lime sobre chip abyss/80 sobre gradiente cyan/0.12 sobre panel | oscuro | normal | 4.5:1 | 15.20:1 | pasa |
| 121 | Tarjeta mundo lima infinito (texto grande) | neonLime sobre gradiente cyan/0.12 sobre panel | oscuro | normal | 3:1 | 11.38:1 | pasa |
| 122 | Etiqueta personaje acento lima | night sobre acento lime | oscuro | normal | 4.5:1 | 15.43:1 | pasa |
| 123 | Etiqueta mundo seleccionado lima | lime sobre panel | oscuro | normal | 4.5:1 | 14.27:1 | pasa |
| 124 | Tarjeta mundo violeta titulo | ink sobre gradiente purple/0.4 sobre panel | oscuro | normal | 4.5:1 | 9.31:1 | pasa |
| 125 | Tarjeta mundo violeta contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente purple/0.4 sobre panel | oscuro | normal | 4.5:1 | 7.73:1 | pasa |
| 126 | Tarjeta mundo violeta sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente purple/0.4 sobre panel | oscuro | normal | 4.5:1 | 5.81:1 | pasa |
| 127 | Tarjeta mundo violeta insignia COMPLETADO (chip abyss/80) | violet sobre chip abyss/80 sobre gradiente purple/0.4 sobre panel | oscuro | normal | 4.5:1 | 7.23:1 | pasa |
| 128 | Tarjeta mundo violeta infinito (texto grande) | neonLime sobre gradiente purple/0.4 sobre panel | oscuro | normal | 3:1 | 8.08:1 | pasa |
| 129 | Tarjeta mundo violeta titulo | ink sobre gradiente pink/0.12 sobre panel | oscuro | normal | 4.5:1 | 14.35:1 | pasa |
| 130 | Tarjeta mundo violeta contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente pink/0.12 sobre panel | oscuro | normal | 4.5:1 | 8.09:1 | pasa |
| 131 | Tarjeta mundo violeta sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente pink/0.12 sobre panel | oscuro | normal | 4.5:1 | 6.08:1 | pasa |
| 132 | Tarjeta mundo violeta insignia COMPLETADO (chip abyss/80) | violet sobre chip abyss/80 sobre gradiente pink/0.12 sobre panel | oscuro | normal | 4.5:1 | 7.56:1 | pasa |
| 133 | Tarjeta mundo violeta infinito (texto grande) | neonLime sobre gradiente pink/0.12 sobre panel | oscuro | normal | 3:1 | 12.45:1 | pasa |
| 134 | Etiqueta personaje acento violeta | night sobre acento violet | oscuro | normal | 4.5:1 | 7.59:1 | pasa |
| 135 | Etiqueta mundo seleccionado violeta | violet sobre panel | oscuro | normal | 4.5:1 | 7.02:1 | pasa |
| 136 | Tarjeta mundo dorado titulo | ink sobre gradiente coin/0.35 sobre panel | oscuro | normal | 4.5:1 | 6.61:1 | pasa |
| 137 | Tarjeta mundo dorado contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente coin/0.35 sobre panel | oscuro | normal | 4.5:1 | 7.47:1 | pasa |
| 138 | Tarjeta mundo dorado sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente coin/0.35 sobre panel | oscuro | normal | 4.5:1 | 5.62:1 | pasa |
| 139 | Tarjeta mundo dorado insignia COMPLETADO (chip abyss/80) | coin sobre chip abyss/80 sobre gradiente coin/0.35 sobre panel | oscuro | normal | 4.5:1 | 12.61:1 | pasa |
| 140 | Tarjeta mundo dorado infinito (texto grande) | neonLime sobre gradiente coin/0.35 sobre panel | oscuro | normal | 3:1 | 5.74:1 | pasa |
| 141 | Tarjeta mundo dorado titulo | ink sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 13.09:1 | pasa |
| 142 | Tarjeta mundo dorado contador (chip abyss/80) | muted sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 7.99:1 | pasa |
| 143 | Tarjeta mundo dorado sin monedas (chip abyss/80) | danger sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 6.00:1 | pasa |
| 144 | Tarjeta mundo dorado insignia COMPLETADO (chip abyss/80) | coin sobre chip abyss/80 sobre gradiente orange/0.15 sobre panel | oscuro | normal | 4.5:1 | 13.48:1 | pasa |
| 145 | Tarjeta mundo dorado infinito (texto grande) | neonLime sobre gradiente orange/0.15 sobre panel | oscuro | normal | 3:1 | 11.36:1 | pasa |
| 146 | Etiqueta personaje acento dorado | night sobre acento coin | oscuro | normal | 4.5:1 | 13.70:1 | pasa |
| 147 | Etiqueta mundo seleccionado dorado | coin sobre panel | oscuro | normal | 4.5:1 | 12.68:1 | pasa |
| 148 | Etiqueta personaje acento por defecto | night sobre neonPurple | oscuro | normal | 4.5:1 | 5.06:1 | pasa |
| 149 | LIVE (7px) danger sobre chip y gradiente morado | danger sobre abyss/80 sobre #3b1f8f | oscuro | normal | 4.5:1 | 5.88:1 | pasa |
| 150 | Tarjeta idioma inactivo muted, opacity-80 | muted sobre panel opacity-80 | oscuro | inactivo | 4.5:1 | 5.27:1 | pasa |
| 151 | Tarjeta idioma inactivo muted, opacity-80 | muted sobre panel opacity-80 | claro | inactivo | 4.5:1 | 4.75:1 | pasa |
| 152 | Tarjeta idioma inactivo hover opacity-90 | muted sobre panel opacity-90 | oscuro | hover | 4.5:1 | 6.32:1 | pasa |
| 153 | Tarjeta idioma inactivo hover opacity-90 | muted sobre panel opacity-90 | claro | hover | 4.5:1 | 5.95:1 | pasa |
| 154 | Pulgar interruptor HUD (muted, no texto 3:1) | muted sobre abyss | oscuro | componente UI | 3:1 | 8.35:1 | pasa |
| 155 | Borde de campo de texto (componente UI 3:1) | borde #6a5bb0 sobre panel (modal) | oscuro | componente UI | 3:1 | 3.26:1 | pasa |
| 156 | Borde de campo de texto vs relleno abyss/80 | borde #6a5bb0 sobre campo abyss/80 sobre panel | oscuro | componente UI | 3:1 | 3.56:1 | pasa |
| 157 | btn-arcade bg-neonCyan texto night base | night sobre neonCyan | oscuro | normal | 4.5:1 | 12.83:1 | pasa |
| 158 | btn-arcade bg-neonCyan texto night velo blanco 35% | night sobre neonCyan+blanco35% | oscuro | normal | 4.5:1 | 14.36:1 | pasa |
| 159 | btn-arcade bg-neonCyan texto night hover | night sobre neonCyan hover filtro | oscuro | hover | 4.5:1 | 15.23:1 | pasa |
| 160 | btn-arcade bg-neonPurple texto night base | night sobre neonPurple | oscuro | normal | 4.5:1 | 5.06:1 | pasa |
| 161 | btn-arcade bg-neonPurple texto night velo blanco 35% | night sobre neonPurple+blanco35% | oscuro | normal | 4.5:1 | 8.42:1 | pasa |
| 162 | btn-arcade bg-neonPurple texto night hover | night sobre neonPurple hover filtro | oscuro | hover | 4.5:1 | 5.53:1 | pasa |
| 163 | btn-arcade bg-neonPink texto night base | night sobre neonPink | oscuro | normal | 4.5:1 | 6.11:1 | pasa |
| 164 | btn-arcade bg-neonPink texto night velo blanco 35% | night sobre neonPink+blanco35% | oscuro | normal | 4.5:1 | 8.72:1 | pasa |
| 165 | btn-arcade bg-neonPink texto night hover | night sobre neonPink hover filtro | oscuro | hover | 4.5:1 | 6.22:1 | pasa |
| 166 | btn-arcade bg-coin texto night base | night sobre coin | oscuro | normal | 4.5:1 | 13.70:1 | pasa |
| 167 | btn-arcade bg-coin texto night velo blanco 35% | night sobre coin+blanco35% | oscuro | normal | 4.5:1 | 15.50:1 | pasa |
| 168 | btn-arcade bg-coin texto night hover | night sobre coin hover filtro | oscuro | hover | 4.5:1 | 15.25:1 | pasa |
| 169 | btn-arcade bg-neonLime texto night base | night sobre neonLime | oscuro | normal | 4.5:1 | 15.43:1 | pasa |
| 170 | btn-arcade bg-neonLime texto night velo blanco 35% | night sobre neonLime+blanco35% | oscuro | normal | 4.5:1 | 16.50:1 | pasa |
| 171 | btn-arcade bg-neonLime texto night hover | night sobre neonLime hover filtro | oscuro | hover | 4.5:1 | 15.33:1 | pasa |
| 172 | btn-arcade bg-panelHi texto ink base | ink sobre panelHi | oscuro | normal | 4.5:1 | 14.49:1 | pasa |
| 173 | btn-arcade bg-panelHi texto ink velo blanco 35% | ink sobre panelHi+blanco35% | oscuro | normal | 4.5:1 | 4.64:1 | pasa |
| 174 | btn-arcade bg-panelHi texto ink hover | ink sobre panelHi hover filtro | oscuro | hover | 4.5:1 | 15.40:1 | pasa |
| 175 | Enlace de salto foco | ink sobre abyss | oscuro | foco | 4.5:1 | 18.28:1 | pasa |
| 176 | Modal boton cerrar | muted sobre panel | oscuro | normal | 4.5:1 | 7.51:1 | pasa |
| 177 | Seleccion de texto | night sobre neonPink | oscuro | seleccion | 4.5:1 | 6.11:1 | pasa |
| 178 | Texto degradado parada cian | cyan sobre night | oscuro | normal | 4.5:1 | 12.83:1 | pasa |
| 179 | Texto degradado parada morada | purple sobre night | oscuro | normal | 4.5:1 | 5.06:1 | pasa |
| 180 | Texto degradado parada rosa | pink sobre night | oscuro | normal | 4.5:1 | 6.11:1 | pasa |
| 181 | Texto degradado parada dorada | coin sobre night | oscuro | normal | 4.5:1 | 13.70:1 | pasa |
| 182 | Terminal carga lima | neonLime sobre panel/80 | oscuro | normal | 4.5:1 | 14.48:1 | pasa |
| 183 | Terminal carga lima | neonLime sobre panel/80 | claro | normal | 4.5:1 | 12.54:1 | pasa |
| 184 | Terminal carga muted | muted sobre abyss/60 | oscuro | normal | 4.5:1 | 8.26:1 | pasa |
| 185 | Terminal carga muted | muted sobre abyss/60 | claro | normal | 4.5:1 | 6.12:1 | pasa |
| 186 | Terminal carga pink | neonPink sobre panel/80 | oscuro | normal | 4.5:1 | 5.74:1 | pasa |
| 187 | Terminal carga pink | neonPink sobre panel/80 | claro | normal | 4.5:1 | 4.97:1 | pasa |
| 188 | btn-arcade bg-neonPink texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonPink opacity-50 | oscuro | deshabilitado | 4.5:1 | 1.65:1 | exento (inactivo) |
| 189 | btn-arcade bg-neonPink texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonPink opacity-50 | claro | deshabilitado | 4.5:1 | 2.20:1 | exento (inactivo) |
| 190 | btn-arcade bg-coin texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre coin opacity-50 | oscuro | deshabilitado | 4.5:1 | 2.21:1 | exento (inactivo) |
| 191 | btn-arcade bg-coin texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre coin opacity-50 | claro | deshabilitado | 4.5:1 | 2.79:1 | exento (inactivo) |
| 192 | btn-arcade bg-neonCyan texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonCyan opacity-50 | oscuro | deshabilitado | 4.5:1 | 2.15:1 | exento (inactivo) |
| 193 | btn-arcade bg-neonCyan texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonCyan opacity-50 | claro | deshabilitado | 4.5:1 | 2.69:1 | exento (inactivo) |
| 194 | btn-arcade bg-neonLime texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonLime opacity-50 | oscuro | deshabilitado | 4.5:1 | 2.30:1 | exento (inactivo) |
| 195 | btn-arcade bg-neonLime texto night DESHABILITADO opacity-50 (exento WCAG: inactivo) | night sobre neonLime opacity-50 | claro | deshabilitado | 4.5:1 | 2.87:1 | exento (inactivo) |

## Evidencia: combinaciones que no pasaban antes del ajuste

| # | Combinación | Texto sobre fondo | Fondo de referencia | Estado | Umbral | Medido | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | Pie/pista Esc muted/60 | muted/60 sobre night | oscuro | antes (corregido) | 4.5:1 | 3.53:1 | no-pasa (antes del ajuste) |
| 2 | Pista teclado muted/70 | muted/70 sobre night | oscuro | antes (corregido) | 4.5:1 | 4.42:1 | no-pasa (antes del ajuste) |
| 3 | Contador sugerencia muted/60 | muted/60 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.47:1 | no-pasa (antes del ajuste) |
| 4 | Placeholder muted/50 | muted/50 sobre abyss/80 | oscuro | antes (corregido) | 4.5:1 | 2.78:1 | no-pasa (antes del ajuste) |
| 5 | Placeholder muted/50 | muted/50 sobre abyss/80 | claro | antes (corregido) | 4.5:1 | 2.80:1 | no-pasa (antes del ajuste) |
| 6 | Insignia nivel/LK ink sobre neonPink | ink sobre neonPink | oscuro | antes (corregido) | 4.5:1 | 2.91:1 | no-pasa (antes del ajuste) |
| 7 | Tarjeta mundo cian contador SIN chip | muted sobre gradiente cyan/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.15:1 | no-pasa (antes del ajuste) |
| 8 | Tarjeta mundo cian sin monedas SIN chip | danger sobre gradiente cyan/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 2.37:1 | no-pasa (antes del ajuste) |
| 9 | Tarjeta mundo cian COMPLETADO SIN chip | cyan sobre gradiente cyan/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 4.98:1 | no-pasa (antes del ajuste) |
| 10 | Tarjeta mundo rosa contador SIN chip | muted sobre gradiente pink/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 4.46:1 | no-pasa (antes del ajuste) |
| 11 | Tarjeta mundo rosa sin monedas SIN chip | danger sobre gradiente pink/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.35:1 | no-pasa (antes del ajuste) |
| 12 | Tarjeta mundo rosa COMPLETADO SIN chip | pink sobre gradiente pink/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.36:1 | no-pasa (antes del ajuste) |
| 13 | Tarjeta mundo lima contador SIN chip | muted sobre gradiente lime/0.3 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.35:1 | no-pasa (antes del ajuste) |
| 14 | Tarjeta mundo lima sin monedas SIN chip | danger sobre gradiente lime/0.3 sobre panel | oscuro | antes (corregido) | 4.5:1 | 2.52:1 | no-pasa (antes del ajuste) |
| 15 | Tarjeta mundo lima COMPLETADO SIN chip | lime sobre gradiente lime/0.3 sobre panel | oscuro | antes (corregido) | 4.5:1 | 6.37:1 | no-pasa (antes del ajuste) |
| 16 | Tarjeta mundo violeta contador SIN chip | muted sobre gradiente purple/0.4 sobre panel | oscuro | antes (corregido) | 4.5:1 | 4.25:1 | no-pasa (antes del ajuste) |
| 17 | Tarjeta mundo violeta sin monedas SIN chip | danger sobre gradiente purple/0.4 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.19:1 | no-pasa (antes del ajuste) |
| 18 | Tarjeta mundo violeta COMPLETADO SIN chip | violet sobre gradiente purple/0.4 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.97:1 | no-pasa (antes del ajuste) |
| 19 | Tarjeta mundo dorado contador SIN chip | muted sobre gradiente coin/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 3.02:1 | no-pasa (antes del ajuste) |
| 20 | Tarjeta mundo dorado sin monedas SIN chip | danger sobre gradiente coin/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 2.27:1 | no-pasa (antes del ajuste) |
| 21 | Tarjeta mundo dorado COMPLETADO SIN chip | coin sobre gradiente coin/0.35 sobre panel | oscuro | antes (corregido) | 4.5:1 | 5.09:1 | no-pasa (antes del ajuste) |
| 22 | Tarjeta idioma inactivo muted, opacity-60 | muted sobre panel opacity-60 | oscuro | antes (corregido) | 4.5:1 | 3.48:1 | no-pasa (antes del ajuste) |
| 23 | Tarjeta idioma inactivo muted, opacity-60 | muted sobre panel opacity-60 | claro | antes (corregido) | 4.5:1 | 2.97:1 | no-pasa (antes del ajuste) |
| 24 | Borde de campo de texto border-line | borde #3a2a78 sobre panel (modal) | oscuro | antes (corregido) | 3:1 | 1.55:1 | no-pasa (antes del ajuste) |
| 25 | btn-arcade bg-neonCyan texto ink base [antes (corregido)] | ink sobre neonCyan | oscuro | antes (corregido) | 4.5:1 | 1.39:1 | no-pasa (antes del ajuste) |
| 26 | btn-arcade bg-neonCyan texto ink velo blanco 35% [antes (corregido)] | ink sobre neonCyan+blanco35% | oscuro | antes (corregido) | 4.5:1 | 1.24:1 | no-pasa (antes del ajuste) |
| 27 | btn-arcade bg-neonCyan texto ink hover [antes (corregido)] | ink sobre neonCyan hover filtro | oscuro | antes (corregido) | 4.5:1 | 1.29:1 | no-pasa (antes del ajuste) |
| 28 | btn-arcade bg-neonPurple texto ink base [antes (corregido)] | ink sobre neonPurple | oscuro | antes (corregido) | 4.5:1 | 3.52:1 | no-pasa (antes del ajuste) |
| 29 | btn-arcade bg-neonPurple texto ink velo blanco 35% [antes (corregido)] | ink sobre neonPurple+blanco35% | oscuro | antes (corregido) | 4.5:1 | 2.11:1 | no-pasa (antes del ajuste) |
| 30 | btn-arcade bg-neonPurple texto ink hover [antes (corregido)] | ink sobre neonPurple hover filtro | oscuro | antes (corregido) | 4.5:1 | 3.55:1 | no-pasa (antes del ajuste) |
| 31 | btn-arcade bg-neonPink texto ink base [antes (corregido)] | ink sobre neonPink | oscuro | antes (corregido) | 4.5:1 | 2.91:1 | no-pasa (antes del ajuste) |
| 32 | btn-arcade bg-neonPink texto ink velo blanco 35% [antes (corregido)] | ink sobre neonPink+blanco35% | oscuro | antes (corregido) | 4.5:1 | 2.04:1 | no-pasa (antes del ajuste) |
| 33 | btn-arcade bg-neonPink texto ink hover [antes (corregido)] | ink sobre neonPink hover filtro | oscuro | antes (corregido) | 4.5:1 | 3.16:1 | no-pasa (antes del ajuste) |
