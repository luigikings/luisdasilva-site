# 🎮 Pixel Interrogatorio — Portfolio de LK

> Portal interactivo en pixel art para conocer el trabajo de **Luis Ángel Jose Da Silva (LK)**. Incluye flujo de entrevista, portafolio editable, descarga de CV y formulario de contacto preparado para servicios sin backend.

## 📦 Stack principal
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) para estilos con estética retro
- [Framer Motion](https://www.framer.com/motion/) para animaciones sutiles
- i18n artesanal con diccionarios ES/EN y persistencia en `localStorage`

## 🚀 Primeros pasos
```bash
npm install
npm run dev
```
- Abre [http://localhost:5173](http://localhost:5173) para ver el interrogatorio.
- `npm run build` genera la carpeta `dist/` lista para producción.
- `npm run preview` sirve el build generado.
- `npm run lint` valida el código con ESLint.
- `npm run format` aplica Prettier a todo el proyecto.

## 🗂️ Estructura de carpetas
```
public/
  LK_CV.pdf       # CV de ejemplo (reemplazar por el real)
  robots.txt
  sitemap.xml
src/
  components/     # UI modular (Loading, Door, Interview, Portfolio, etc.)
  data/           # Datos editables: diálogos y proyectos
  hooks/          # useT y proveedores de idioma
  i18n/           # Diccionario bilingüe ES/EN
  lib/            # Utilidades (analytics stub)
  index.css       # Tailwind + estilos globales
  App.tsx         # Flow principal de la experiencia
```

## 🌐 Cómo traducir o editar textos
- Todas las cadenas visibles viven en [`src/i18n/dict.ts`](src/i18n/dict.ts).
- Cada clave tiene su versión en español (`es`) e inglés (`en`).
- El hook `useT()` permite acceder a las traducciones desde cualquier componente.
- El idioma se guarda automáticamente en `localStorage` (`pixel-interrogatorio-lang`).

## 💼 Cómo editar el portafolio
- Modifica [`src/data/portfolio.ts`](src/data/portfolio.ts) con tus propios proyectos.
- Cada elemento soporta `title`, `excerpt`, `details`, `tags`, `githubUrl` y `demoUrl`.
- El componente `PortfolioGrid` renderiza tarjetas y modales animados con CTA.

## 💬 Frases de la puerta
- Ajusta los mensajes de impaciencia en [`src/data/dialogs.ts`](src/data/dialogs.ts).
- Cada entrada tiene `es` y `en` para mantener el tono en ambos idiomas.

## ✉️ Formulario de contacto (sin backend)
- El componente [`ContactForm`](src/components/ContactForm.tsx) está listo para Formspree.
- Reemplaza el atributo `action="#"` con tu endpoint `https://formspree.io/f/XXXXXX`.
- Validación mínima en frontend (nombre, email y mensaje de al menos 10 caracteres).

## 🖼️ Personalizar imágenes
- El proyecto usa elementos vectoriales generados con CSS para la puerta y el avatar.
- Si deseas sprites pixel art reales, añade tus propios archivos a `public/` y actualiza los componentes.
- Para redes sociales, publica tu propia imagen OG y ajusta las etiquetas en `index.html`.

## 🔍 SEO y accesibilidad
- `index.html` incluye `<title>`, meta description, etiquetas Open Graph y Twitter Card.
- `public/robots.txt` y `public/sitemap.xml` están listos para subir al dominio `luis-dasilva.com`.
- Animaciones sensibles a `prefers-reduced-motion`, navegación por teclado y `aria-labels` en controles.

## 📈 Analíticas
- [`src/lib/analytics.ts`](src/lib/analytics.ts) expone `track(eventName, payload?)`.
- Reemplaza la implementación por la integración real (Plausible, Umami, etc.).

## ☁️ Despliegue sugerido
- **Vercel**: importando el repo, Vercel detecta Vite y usa `npm run build` automáticamente.
- **Netlify**: build command `npm run build`, publish directory `dist`.
- Recuerda configurar dominios personalizados (`luis-dasilva.com`) y HTTPS.

## 🧭 Roadmap sugerido
- [ ] Integrar backend ligero para guardar mensajes del formulario.
- [ ] Añadir vista de timeline/experiencia profesional.
- [ ] Conectar analytics reales (Plausible) usando `lib/analytics.ts`.
- [ ] Incluir modo “entrevista rápida” con preguntas aleatorias.

## 📜 Licencias y créditos
- Fuentes Google: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) y [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) — licencia Open Font License.
- Elementos gráficos generados por CSS en esta versión (sin assets externos).

## 🗒️ Changelog
- **2025-10-04** · Versión inicial del portal “Pixel Interrogatorio” con flujo completo (loading → puerta → entrevista), portafolio editable, i18n ES/EN, CV descargable, formulario sin backend y optimizaciones SEO/UX básicas.
