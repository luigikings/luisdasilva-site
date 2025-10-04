import type { Language } from '../i18n/dict'

type Localized = Record<Language, string>

export type PortfolioItem = {
  id: string
  title: Localized
  excerpt: Localized
  details: Localized
  tags: string[]
  githubUrl: string
  demoUrl?: string
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'pixel-synth-lab',
    title: {
      es: 'Pixel Synth Lab',
      en: 'Pixel Synth Lab',
    },
    excerpt: {
      es: 'Sintetizador modular en el navegador con interfaz retro y loops guardables.',
      en: 'Browser-based modular synth with a retro interface and saveable loops.',
    },
    details: {
      es: 'Construí un secuenciador visual para músicos curiosos. Incluye grabación, exportación MIDI y soporte para WebMIDI.',
      en: 'I built a visual sequencer for curious musicians. It ships with recording, MIDI export and WebMIDI support.',
    },
    tags: ['React', 'Tone.js', 'TypeScript', 'WebMIDI'],
    githubUrl: 'https://github.com/example/pixel-synth-lab',
    demoUrl: 'https://example.com/pixel-synth-lab',
  },
  {
    id: 'checkpoint-ai',
    title: {
      es: 'Checkpoint AI Mentor',
      en: 'Checkpoint AI Mentor',
    },
    excerpt: {
      es: 'Mentor virtual para bootcamps que responde en tono amigable y da feedback accionable.',
      en: 'Virtual bootcamp mentor that replies in a friendly tone and gives actionable feedback.',
    },
    details: {
      es: 'Integración con APIs de OpenAI y supabase para seguimiento de progreso y recomendaciones personalizadas.',
      en: 'Integrates OpenAI APIs and Supabase to track progress and deliver tailored recommendations.',
    },
    tags: ['Next.js', 'OpenAI', 'Supabase', 'Tailwind'],
    githubUrl: 'https://github.com/example/checkpoint-ai',
  },
  {
    id: 'retro-runner',
    title: {
      es: 'Retro Runner Analytics',
      en: 'Retro Runner Analytics',
    },
    excerpt: {
      es: 'Dashboard gamificado para analizar métricas de productos digitales.',
      en: 'Gamified dashboard for tracking product health metrics.',
    },
    details: {
      es: 'Sistema de visualizaciones con charts personalizadas y logros desbloqueables según objetivos cumplidos.',
      en: 'A visualization system with custom charts and unlockable achievements tied to business goals.',
    },
    tags: ['React', 'D3.js', 'Framer Motion', 'Vercel'],
    githubUrl: 'https://github.com/example/retro-runner',
    demoUrl: 'https://example.com/retro-runner',
  },
  {
    id: 'sprite-docs',
    title: {
      es: 'Sprite Docs',
      en: 'Sprite Docs',
    },
    excerpt: {
      es: 'Generador de documentación técnica con vista previa de componentes en vivo.',
      en: 'Technical documentation generator with live component previews.',
    },
    details: {
      es: 'Sistema de documentación multi-idioma con MDX, búsqueda instantánea y modo accesibilidad.',
      en: 'Multi-language documentation system using MDX, instant search and accessibility mode.',
    },
    tags: ['Astro', 'React', 'MDX', 'Algolia'],
    githubUrl: 'https://github.com/example/sprite-docs',
    demoUrl: 'https://example.com/sprite-docs',
  },
  {
    id: 'shader-playground',
    title: {
      es: 'Shader Playground',
      en: 'Shader Playground',
    },
    excerpt: {
      es: 'Playground para crear shaders WebGL con presets y colaboración en tiempo real.',
      en: 'WebGL shader playground with presets and real-time collaboration.',
    },
    details: {
      es: 'Integra CRDT para edición colaborativa, vista previa en vivo y exportación a glsl.',
      en: 'Features CRDT collaborative editing, live preview and GLSL export.',
    },
    tags: ['React', 'WebGL', 'CRDT', 'TypeScript'],
    githubUrl: 'https://github.com/example/shader-playground',
  },
  {
    id: 'pixel-commerce',
    title: {
      es: 'Pixel Commerce',
      en: 'Pixel Commerce',
    },
    excerpt: {
      es: 'E-commerce headless con catálogo animado y checkout optimizado.',
      en: 'Headless e-commerce with animated catalog and optimized checkout.',
    },
    details: {
      es: 'Integración con Stripe, gestión de inventario en tiempo real y componentes accesibles para todos los flujos.',
      en: 'Integrates Stripe, real-time inventory and accessible components across the whole flow.',
    },
    tags: ['Remix', 'Stripe', 'Tailwind', 'Accessibility'],
    githubUrl: 'https://github.com/example/pixel-commerce',
    demoUrl: 'https://example.com/pixel-commerce',
  },
]
