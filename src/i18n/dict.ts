export type Language = 'es' | 'en'

export type QuestionKey =
  | 'introduction'
  | 'motivation'
  | 'learning'
  | 'projects'
  | 'contact'

type DictSection = {
  common: {
    languageLabel: string
    languageName: string
    start: string
    back: string
    close: string
    github: string
    demo: string
    download: string
  }
  loading: {
    title: string
    description: string
    progressLabel: string
  }
  door: {
    intro: string
    button: string
  }
  interview: {
    title: string
    subtitle: string
    avatarAlt: string
    selectPrompt: string
    questions: Record<QuestionKey, { label: string; playerLine: string }>
    answers: Record<QuestionKey, string>
    conversation: {
      youLabel: string
      characterLabel: string
      okButton: string
    }
  }
  footer: {
    text: string
  }
}

type Dict = Record<Language, DictSection>

export const dict: Dict = {
  es: {
    common: {
      languageLabel: 'Cambiar idioma',
      languageName: 'ES',
      start: 'Comenzar',
      back: '← Volver',
      close: 'Cerrar',
      github: 'GitHub',
      demo: 'Demo',
      download: 'Descargar',
    },
    loading: {
      title: 'Cargando interrogatorio pixelado...',
      description: 'Ajustando las luces, colocando los píxeles y preparando las preguntas difíciles.',
      progressLabel: 'Progreso de carga',
    },
    door: {
      intro: 'Holaaa ¿se puede entrar??!!',
      button: 'Dejar entrar',
    },
    interview: {
      title: 'Entrevista a Luis Da Silva',
      subtitle: 'Conoce a Luis en profundidad.',
      avatarAlt: 'Avatar pixelado de LK',
      selectPrompt: 'Pulsa un botón para comenzar la conversación.',
      questions: {
        introduction: {
          label: 'Hola, preséntate, ¿quién eres?',
          playerLine: 'Hola, preséntate, ¿quién eres?',
        },
        motivation: {
          label: '¿Por qué te gusta la programación?',
          playerLine: '¿Por qué te gusta la programación?',
        },
        learning: {
          label: '¿Qué cosas has aprendido últimamente?',
          playerLine: '¿Qué cosas has aprendido últimamente?',
        },
        projects: {
          label: '¿Cuáles son los proyectos en los que has trabajado?',
          playerLine: '¿En qué proyectos estuviste trabajando?',
        },
        contact: {
          label: '¿Cómo puedo contactar contigo?',
          playerLine: '¿Cómo puedo contactar contigo?',
        },
      },
      answers: {
        introduction:
          'Soy Luis Ángel José Da Silva, pero todos me dicen LK. Soy desarrollador front-end y me encanta darle vida a ideas con estética retro y detallitos que cuentan historias.',
        motivation:
          'La programación me gusta porque mezcla lógica con creatividad. Es como armar un rompecabezas donde cada pieza cobra vida cuando todo encaja.',
        learning:
          'Últimamente estoy profundizando en animaciones con Framer Motion, accesibilidad aplicada y automatizaciones con IA para acelerar flujos creativos.',
        projects:
          'He trabajado en dashboards, experiencias interactivas para eventos y sitios personales con mucho cariño pixel-art. Siempre busco que cada proyecto se sienta único.',
        contact:
          'Puedes escribirme por correo a hola@lk.dev o mandarme un mensaje por LinkedIn; contesto rápido si mencionas que viniste por la puerta pixelada.',
      },
      conversation: {
        youLabel: 'Tú',
        characterLabel: 'LK responde',
        okButton: 'Okey',
      },
    },
    footer: {
      text: 'Built with React + Tailwind + Framer Motion',
    },
  },
  en: {
    common: {
      languageLabel: 'Change language',
      languageName: 'EN',
      start: 'Start',
      back: '← Back',
      close: 'Close',
      github: 'GitHub',
      demo: 'Demo',
      download: 'Download',
    },
    loading: {
      title: 'Loading pixel interrogation...',
      description: 'Aligning LEDs, snapping pixels into place and picking the toughest questions.',
      progressLabel: 'Loading progress',
    },
    door: {
      intro: 'Heeey! May I come in??!!',
      button: 'Let in',
    },
    interview: {
      title: 'Interview Luis Da Silva',
      subtitle: 'Get to know Luis in depth.',
      avatarAlt: 'LK pixel avatar',
      selectPrompt: 'Tap a button to start the conversation.',
      questions: {
        introduction: {
          label: 'Hey, introduce yourself. Who are you?',
          playerLine: 'Hey, introduce yourself. Who are you?',
        },
        motivation: {
          label: 'Why do you enjoy programming?',
          playerLine: 'Why do you enjoy programming?',
        },
        learning: {
          label: 'What have you learned lately?',
          playerLine: 'What have you learned lately?',
        },
        projects: {
          label: 'Which projects have you worked on?',
          playerLine: 'Which projects have you worked on recently?',
        },
        contact: {
          label: 'How can I reach you?',
          playerLine: 'How can I reach you?',
        },
      },
      answers: {
        introduction:
          'I’m Luis Ángel Jose Da Silva—most people call me LK. I’m a front-end developer obsessed with mixing retro vibes, storytelling and polished interactions.',
        motivation:
          'Programming hooks me because it blends creativity with systems thinking. Building an interface feels like composing music with pixels and logic.',
        learning:
          'I’ve been diving deeper into Framer Motion, inclusive design practices and little AI helpers that speed up ideation and prototyping.',
        projects:
          'Recent work includes interactive dashboards, playful landing pages and personal experiments that celebrate pixel aesthetics. Each project is a new playground.',
        contact:
          'Drop me an email at hello@lk.dev or ping me on LinkedIn—mention the mysterious door so I know it’s you.',
      },
      conversation: {
        youLabel: 'You',
        characterLabel: 'LK replies',
        okButton: 'Okay',
      },
    },
    footer: {
      text: 'Built with React + Tailwind + Framer Motion',
    },
  },
}

export type DictKey = keyof typeof dict.en
