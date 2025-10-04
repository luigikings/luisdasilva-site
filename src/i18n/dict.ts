export type Language = 'es' | 'en'

export type QuestionKey =
  | 'portfolio'
  | 'cv'
  | 'who'
  | 'stack'
  | 'joke'

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
    impatienceLabel: string
    button: string
  }
  interview: {
    title: string
    subtitle: string
    avatarAlt: string
    selectPrompt: string
    questions: Record<QuestionKey, string>
    responses: {
      who: {
        heading: string
        body: string
      }
      stack: {
        heading: string
        intro: string
        items: string[]
      }
      jokes: {
        heading: string
        intro: string
        items: string[]
      }
      cv: {
        heading: string
        body: string
      }
      portfolio: {
        heading: string
        body: string
        modalCta: string
      }
    }
    contact: {
      heading: string
      description: string
      nameLabel: string
      emailLabel: string
      messageLabel: string
      submit: string
      helper: string
      errors: {
        name: string
        email: string
        message: string
        success: string
      }
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
      impatienceLabel: 'LK está impaciente:',
      button: 'Dejar entrar',
    },
    interview: {
      title: 'Entrevista a LK',
      subtitle: 'Selecciona una pregunta para obtener una respuesta animada.',
      avatarAlt: 'Avatar pixelado de LK',
      selectPrompt: 'Pulsa un botón para comenzar la conversación.',
      questions: {
        portfolio: 'Ver portafolio',
        cv: 'Descargar CV',
        who: '¿Quién eres tú, bro?',
        stack: 'Stack y tecnologías',
        joke: 'Dime un chiste',
      },
      responses: {
        who: {
          heading: 'Quién es LK',
          body:
            'Soy Luis Ángel Jose Da Silva, desarrollador front-end y creador de experiencias digitales con sabor retro. Me apasiona traducir ideas complejas en interfaces amigables, accesibles y llenas de carácter.',
        },
        stack: {
          heading: 'Stack favorito',
          intro: 'Estas son las herramientas con las que construyo productos digitales robustos:',
          items: [
            'TypeScript + React para interfaces modulares y mantenibles',
            'Node.js y edge functions para backend ligero',
            'Tailwind CSS para diseñar a velocidad warp',
            'Framer Motion para microinteracciones con alma',
            'Vercel, Netlify y AWS para despliegues sin sustos',
          ],
        },
        jokes: {
          heading: 'Humor en 8 bits',
          intro: 'Los píxeles también se ríen. Aquí van algunos chistes malos (pero con cariño):',
          items: [
            '¿Por qué el sprite fue a terapia? Porque tenía demasiados frames sin resolver.',
            'Mi bug favorito es el que se convierte en feature cuando lo presento en 8 bits.',
            'Pixel art rule #1: si queda raro, agrégale otra sombra y di que es “profundidad”.',
          ],
        },
        cv: {
          heading: 'Descarga el CV',
          body: 'Haz clic en el botón para descargar mi CV en PDF y descubrir la versión formal de esta entrevista.',
        },
        portfolio: {
          heading: 'Proyectos destacados',
          body: 'Explora algunos proyectos seleccionados. Cada tarjeta tiene más detalles dentro.',
          modalCta: 'Abrir proyecto',
        },
      },
      contact: {
        heading: '¿Quieres hablar?',
        description:
          'Envíame un mensaje rápido con este formulario. Llega directo a mi bandeja si configuras tu servicio favorito.',
        nameLabel: 'Nombre',
        emailLabel: 'Email',
        messageLabel: 'Mensaje',
        submit: 'Enviar mensaje',
        helper: 'Este formulario usa Formspree. Sustituye la URL de acción por la tuya para activarlo.',
        errors: {
          name: 'Ingresa tu nombre.',
          email: 'Necesito un email válido.',
          message: 'Cuéntame un poco más, mínimo 10 caracteres.',
          success: '¡Listo! Reemplaza la acción de Formspree para enviar de verdad.',
        },
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
      impatienceLabel: 'LK is getting impatient:',
      button: 'Let in',
    },
    interview: {
      title: 'Interview LK',
      subtitle: 'Pick a question to unlock an animated answer.',
      avatarAlt: 'LK pixel avatar',
      selectPrompt: 'Choose any button to kick things off.',
      questions: {
        portfolio: 'See portfolio',
        cv: 'Download CV',
        who: 'Who are you, bro?',
        stack: 'Stack & tech',
        joke: 'Tell me a joke',
      },
      responses: {
        who: {
          heading: 'Who is LK',
          body:
            "I'm Luis Ángel Jose Da Silva, a front-end developer crafting digital experiences with a retro heart. I love translating complex ideas into friendly, accessible, character-driven interfaces.",
        },
        stack: {
          heading: 'Favorite stack',
          intro: 'These are the tools I rely on to build robust digital products:',
          items: [
            'TypeScript + React for modular, maintainable interfaces',
            'Node.js and edge functions for nimble backends',
            'Tailwind CSS to design at warp speed',
            'Framer Motion for soulful micro-interactions',
            'Vercel, Netlify and AWS for stress-free deployments',
          ],
        },
        jokes: {
          heading: '8-bit humor',
          intro: 'Pixels laugh too. Here are a few lovingly bad jokes:',
          items: [
            "Why did the sprite go to therapy? Too many unresolved frames.",
            "My favorite bug is the one that becomes a feature once rendered in 8-bit.",
            "Pixel art rule #1: if it looks weird, add another shadow and call it ‘depth’.",
          ],
        },
        cv: {
          heading: 'Download the CV',
          body: 'Hit the button to download my PDF CV and discover the formal version of this chat.',
        },
        portfolio: {
          heading: 'Featured projects',
          body: 'Explore a handful of curated projects. Each card hides more details inside.',
          modalCta: 'Open project',
        },
      },
      contact: {
        heading: 'Want to chat?',
        description:
          'Send me a quick note with this form. Point it to your favourite service and it will reach me instantly.',
        nameLabel: 'Name',
        emailLabel: 'Email',
        messageLabel: 'Message',
        submit: 'Send message',
        helper: 'This form uses Formspree. Replace the action URL with yours to make it live.',
        errors: {
          name: 'Please enter your name.',
          email: 'Please enter a valid email.',
          message: 'Please share a bit more, at least 10 characters.',
          success: 'All set! Replace the Formspree action URL to actually send.',
        },
      },
    },
    footer: {
      text: 'Built with React + Tailwind + Framer Motion',
    },
  },
}

export type DictKey = keyof typeof dict.en
