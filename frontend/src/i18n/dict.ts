export type Language = 'es' | 'en'

export type QuestionKey =
  | 'introduction'
  | 'motivation'
  | 'learning'
  | 'projects'
  | 'contact'
  | 'hobbies'
  | 'superpower'
  | 'location'
  | 'futureSelf'
  | 'spokenLanguages'
  | 'languageIdentity'
  | 'aiWork'
  | 'futureProjects'
  | 'teamwork'
  | 'workValues'
  | 'problemSolving'
  | 'dailyMotivation'
  | 'leastFavorite'
  | 'videogame'
  | 'advicePast'
  | 'github'
  | 'cv'

export type AchievementKey =
  | 'firstQuestion'
  | 'categoryComplete'
  | 'halfway'
  | 'allDone'
  | 'infinite'
  | 'konami'

export type QuestionGroupKey =
  | 'aboutYou'
  | 'motivations'
  | 'experience'
  | 'workStyle'
  | 'contactPortfolio'

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
    soundOn: string
    soundOff: string
  }
  languageIntro: {
    title: string
    subtitle: string
    confirm: string
    keyboardHint: string
  }
  loading: {
    title: string
    description: string
    progressLabel: string
    bootLines: string[]
    tips: string[]
    boostHint: string
    ready: string
  }
  door: {
    intro: string
    button: string
    knock: string
  }
  interview: {
    title: string
    subtitle: string
    avatarAlt: string
    groupPrompt: string
    selectPrompt: string
    repeatPrompt: string
    backToCategories: string
    tutorial: {
      title: string
      steps: { icon: string; text: string }[]
      close: string
    }
    coins: {
      remaining: string
      unavailable: string
      cost: string
      unlimited: string
      toggle: string
      noCoinsHint: string
      free: string
    }
    hud: {
      player: string
      progress: string
      level: string
      escHint: string
    }
    achievements: Record<AchievementKey, { title: string; body: string }>
    categories: Record<QuestionGroupKey, string>
    questions: Record<QuestionKey, { label: string; playerLine: string }>
    answers: Record<QuestionKey, string>
    conversation: {
      youLabel: string
      characterLabel: string
      okButton: string
      githubButton: string
      cvButton: string
      skipHint: string
    }
  }
  suggestions: {
    buttonLabel: string
    modalTitle: string
    modalDescription: string
    questionLabel: string
    questionPlaceholder: string
    categoryLabel: string
    categoryPlaceholder: string
    cancel: string
    submit: string
    successTitle: string
    successMessage: string
    errorMessage: string
    validationMessage: string
  }
  footer: {
    text: string
  }
  meta: {
    languageTitle: string
    loadingTitles: string[]
    doorTitle: string
    interviewTitle: string
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
      soundOn: 'Activar sonido',
      soundOff: 'Silenciar',
    },
    languageIntro: {
      title: 'Elige tu idioma',
      subtitle: 'Jugador 1',
      confirm: 'Jugar',
      keyboardHint: '← → elegir · Enter jugar',
    },
    loading: {
      title: 'Cargando',
      description: 'Preparando las preguntas difíciles…',
      progressLabel: 'Progreso de carga',
      bootLines: [
        'LK-OS v2.0 // arrancando',
        'cargando sprites ......... OK',
        'afinando sintetizadores .. OK',
        'puliendo píxeles ......... OK',
        'llenando monedas ......... OK',
        'café detectado ........... ☕',
        'listo para la entrevista ✔',
      ],
      tips: [
        'Tip: 1 moneda = 1 pregunta 🪙',
        'Tip: las preguntas repetidas son gratis',
        'Tip: haz clic en el diálogo para saltar el texto',
        'Tip: hay un código secreto escondido… ↑↑↓↓',
      ],
      boostHint: 'Haz clic para acelerar ⚡',
      ready: '¡Listo!',
    },
    door: {
      intro: 'Holaaa ¿se puede entrar??!!',
      button: 'Abrir la puerta',
      knock: 'TOC TOC',
    },
    interview: {
      title: 'Entrevista a Luis Da Silva',
      subtitle: 'Elige un mundo y pregunta lo que quieras.',
      avatarAlt: 'Avatar pixelado de LK',
      groupPrompt: 'Elige un mundo',
      selectPrompt: 'Elige una pregunta',
      repeatPrompt: 'Repetir pregunta',
      backToCategories: 'Mundos',
      tutorial: {
        title: 'Cómo se juega',
        steps: [
          { icon: '🗂️', text: 'Elige un mundo' },
          { icon: '🪙', text: '1 moneda = 1 pregunta' },
          { icon: '♾️', text: '¿Sin monedas? Modo infinito' },
        ],
        close: '¡Vamos!',
      },
      coins: {
        remaining: 'Monedas',
        unavailable: 'Sin monedas',
        cost: 'Costo',
        unlimited: 'Monedas ilimitadas',
        toggle: 'Infinitas',
        noCoinsHint: '¡Sin monedas aquí! Prueba el modo infinito ♾️',
        free: 'Gratis',
      },
      hud: {
        player: 'Jugador',
        progress: 'Progreso',
        level: 'Nv',
        escHint: 'Esc para volver',
      },
      achievements: {
        firstQuestion: { title: '¡Primera pregunta!', body: 'El hielo está roto 🧊' },
        categoryComplete: { title: '¡Mundo completado!', body: 'Lo sabes todo de esta categoría' },
        halfway: { title: '¡A mitad de camino!', body: 'Ya conoces media historia' },
        allDone: { title: '¡100% completado!', body: 'Ahora sí conoces a Luis 🏆' },
        infinite: { title: 'Modo infinito', body: 'Monedas sin límite activadas' },
        konami: { title: '¡Código secreto!', body: 'Eres de los buenos 🕹️' },
      },
      categories: {
        aboutYou: 'Sobre ti',
        motivations: 'Motivaciones y gustos personales',
        experience: 'Experiencia y proyectos',
        workStyle: 'Trabajo y forma de actuar',
        contactPortfolio: 'Contacto y portfolio',
      },
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
        hobbies: {
          label: '¿Cuáles son tus hobbies?',
          playerLine: '¿Cuáles son tus hobbies?',
        },
        superpower: {
          label: 'Si tuvieras un superpoder, ¿cuál sería?',
          playerLine: 'Si tuvieras un superpoder, ¿cuál sería?',
        },
        location: {
          label: '¿En dónde vives?',
          playerLine: '¿En dónde vives?',
        },
        futureSelf: {
          label: '¿Cómo te ves de aquí en 2-3 años?',
          playerLine: '¿Cómo te ves de aquí en 2-3 años?',
        },
        spokenLanguages: {
          label: '¿Qué idiomas hablas?',
          playerLine: '¿Qué idiomas hablas?',
        },
        languageIdentity: {
          label: 'Si fueras un lenguaje de programación, ¿cuál serías?',
          playerLine: 'Si fueras un lenguaje de programación, ¿cuál serías?',
        },
        aiWork: {
          label: '¿Trabajas con Inteligencia Artificial?',
          playerLine: '¿Trabajas con Inteligencia Artificial?',
        },
        futureProjects: {
          label: '¿Qué tipos de proyectos te gustaría construir en el futuro?',
          playerLine: '¿Qué tipos de proyectos te gustaría construir en el futuro?',
        },
        teamwork: {
          label: '¿Cómo sueles trabajar en equipo?',
          playerLine: '¿Cómo sueles trabajar en equipo?',
        },
        workValues: {
          label: '¿Qué es lo que más valoras en un trabajo?',
          playerLine: '¿Qué es lo que más valoras en un trabajo?',
        },
        problemSolving: {
          label: '¿Cómo enfrentas los retos o problemas cuando no sabes algo?',
          playerLine: '¿Cómo enfrentas los retos o problemas cuando no sabes algo?',
        },
        dailyMotivation: {
          label: '¿Qué te motiva a aprender cada día?',
          playerLine: '¿Qué te motiva a aprender cada día?',
        },
        leastFavorite: {
          label: '¿Qué es lo que menos te gusta como programador?',
          playerLine: '¿Qué es lo que menos te gusta como programador?',
        },
        videogame: {
          label: '¿Por qué te metiste a Full Stack?',
          playerLine: '¿Por qué te metiste a Full Stack?',
        },
        advicePast: {
          label: 'Si pudieras dar un consejo a tu yo del pasado, ¿cuál sería?',
          playerLine: 'Si pudieras dar un consejo a tu yo del pasado, ¿cuál sería?',
        },
        github: {
          label: '¿Podrías mostrarme tu GitHub?',
          playerLine: '¿Podrías mostrarme tu GitHub?',
        },
        cv: {
          label: '¿Podrías mostrarme tu CV?',
          playerLine: '¿Podrías mostrarme tu CV?',
        },
      },
      answers: {
        introduction:
          'Soy Luis Ángel Da Silva, aunque muchos me llaman Luigi.\nSoy desarrollador full stack y me encanta crear experiencias web que no solo se vean bien, sino que también estén bien pensadas por dentro.\nDisfruto tanto del diseño y la experiencia de usuario como de la lógica, la estructura y el funcionamiento real que hay detrás de cada proyecto.',
        motivation:
          'La programación me gusta porque mezcla lógica con creatividad. Es como armar un rompecabezas donde cada pieza cobra vida cuando todo encaja.',
        learning:
          'Últimamente estoy profundizando en animaciones con Framer Motion, accesibilidad aplicada y automatizaciones con IA para acelerar flujos creativos.',
        projects:
          'He trabajado en dashboards, experiencias interactivas para eventos y sitios personales con mucho cariño pixel-art. Siempre busco que cada proyecto se sienta único.',
        contact:
          'Puedes escribirme por correo a luigidasilv@gmail.com o mandarme un mensaje por LinkedIn; contesto rápido si mencionas que viniste por la puerta pixelada!',
        hobbies:
          'Cuando desconecto me gusta dibujar pixel art, tocar sintetizadores y salir a caminar con cámara en mano buscando texturas para futuros proyectos.',
        superpower:
          'Elegiría detener el tiempo unos minutos. Así podría pulir detalles infinitos sin romper deadlines y regalarme más siestas.',
        location:
          'Desde hace poco vivo en Holanda, en Eindhoven. Me inspira mucho el ambiente tech y el equilibrio con la vida tranquila que se respira aquí.',
        futureSelf:
          'En 2-3 años me veo liderando proyectos full stack con equipos creativos, afinando mi liderazgo y construyendo productos con impacto real.',
        spokenLanguages:
          'Hablo español nativamente porque nací en Venezuela, y puedo hablar inglés fluidamente sin problema.',
        languageIdentity:
          'Sería JavaScript bien pensado: flexible, creativo y capaz de adaptarse a casi cualquier cosa, pero con estructura y lógica para que nada se rompa cuando el proyecto crece.',
        aiWork:
          'Sí, la IA es parte de mi flujo. La uso para generar ideas, validar copys y prototipar, pero siempre con criterio humano y brújula ética.',
        futureProjects:
          'Quiero crear experiencias web inmersivas para contar historias interactivas, herramientas creativas colaborativas y dashboards que se sientan como juegos indie.',
        teamwork:
          'Me gusta trabajar en equipo con mucha comunicación. Soy de documentar, compartir avances y facilitar que cada persona sume su superpoder.',
        workValues:
          'Valoro la transparencia, el aprendizaje continuo y la posibilidad de experimentar sin miedo a equivocarse.',
        problemSolving:
          'Cuando no sé algo, lo desarmo en piezas pequeñas, busco recursos confiables y pregunto sin miedo; el objetivo es desbloquear rápido al equipo.',
        dailyMotivation:
          'Me motiva imaginar a alguien sonriendo al usar algo que construí y la idea de que cada día puedo aprender un truco nuevo.',
        leastFavorite:
          'Lo que menos me gusta es cuando los procesos se vuelven burocráticos o lentos y se pierde foco en construir valor real para las personas.',
        videogame:
          'Me metí a full stack porque quería entender el viaje completo del producto: desde la idea y el diseño hasta la lógica que lo hace funcionar.',
        advicePast:
          'Le diría a mi yo del pasado que confíe más en sus ideas raras, que aprenda a descansar y que compartir temprano siempre trae feedback valioso.',
        github: 'Claro, aquí tienes.',
        cv: 'Claro, aquí tienes.',
      },
      conversation: {
        youLabel: 'Tú',
        characterLabel: 'LK responde',
        okButton: 'Okey',
        githubButton: 'Ir a GitHub',
        cvButton: 'Descargar CV',
        skipHint: 'clic para saltar',
      },
    },
    suggestions: {
      buttonLabel: 'Pide una pregunta',
      modalTitle: 'Sugiere una nueva pregunta',
      modalDescription: '¿Crees que falta algo? Envíame tu pregunta propuesta y la revisaré.',
      questionLabel: 'Pregunta sugerida',
      questionPlaceholder: 'Escribe la pregunta que te gustaría ver en la entrevista...',
      categoryLabel: 'Categoría (opcional)',
      categoryPlaceholder: 'Ej. experiencia, motivación, cultura...',
      cancel: 'Cancelar',
      submit: 'Enviar sugerencia',
      successTitle: '¡Gracias!',
      successMessage: 'Tu propuesta fue enviada. La revisaré pronto.',
      errorMessage: 'No se pudo enviar la sugerencia. Intenta nuevamente.',
      validationMessage: 'Por favor escribe una pregunta con al menos 8 caracteres.',
    },
    footer: {
      text: 'Built with React + Tailwind + Framer Motion',
    },
    meta: {
      languageTitle: 'Preparando la entrevista',
      loadingTitles: ['cargando.', 'cargando..', 'cargando...'],
      doorTitle: '¡Luis quiere entrar!',
      interviewTitle: 'Entrevista con Luis Ángel Da Silva',
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
      soundOn: 'Sound on',
      soundOff: 'Mute',
    },
    languageIntro: {
      title: 'Choose your language',
      subtitle: 'Player 1',
      confirm: 'Play',
      keyboardHint: '← → choose · Enter play',
    },
    loading: {
      title: 'Loading',
      description: 'Picking the toughest questions…',
      progressLabel: 'Loading progress',
      bootLines: [
        'LK-OS v2.0 // booting',
        'loading sprites .......... OK',
        'tuning synthesizers ...... OK',
        'polishing pixels ......... OK',
        'filling coin purse ....... OK',
        'coffee detected .......... ☕',
        'ready for the interview ✔',
      ],
      tips: [
        'Tip: 1 coin = 1 question 🪙',
        'Tip: repeated questions are free',
        'Tip: click the dialog to skip the typing',
        'Tip: there is a secret code hidden… ↑↑↓↓',
      ],
      boostHint: 'Click to speed up ⚡',
      ready: 'Ready!',
    },
    door: {
      intro: 'Heeey! May I come in??!!',
      button: 'Open the door',
      knock: 'KNOCK KNOCK',
    },
    interview: {
      title: 'Interview Luis Da Silva',
      subtitle: 'Pick a world and ask anything.',
      avatarAlt: 'LK pixel avatar',
      groupPrompt: 'Pick a world',
      selectPrompt: 'Pick a question',
      repeatPrompt: 'Repeat question',
      backToCategories: 'Worlds',
      tutorial: {
        title: 'How to play',
        steps: [
          { icon: '🗂️', text: 'Pick a world' },
          { icon: '🪙', text: '1 coin = 1 question' },
          { icon: '♾️', text: 'Out of coins? Go infinite' },
        ],
        close: "Let's go!",
      },
      coins: {
        remaining: 'Coins',
        unavailable: 'No coins',
        cost: 'Cost',
        unlimited: 'Unlimited coins',
        toggle: 'Infinite',
        noCoinsHint: 'Out of coins here! Try infinite mode ♾️',
        free: 'Free',
      },
      hud: {
        player: 'Player',
        progress: 'Progress',
        level: 'Lv',
        escHint: 'Esc to go back',
      },
      achievements: {
        firstQuestion: { title: 'First question!', body: 'Ice officially broken 🧊' },
        categoryComplete: { title: 'World cleared!', body: 'You know everything in this category' },
        halfway: { title: 'Halfway there!', body: 'You know half the story already' },
        allDone: { title: '100% complete!', body: 'Now you really know Luis 🏆' },
        infinite: { title: 'Infinite mode', body: 'Unlimited coins unlocked' },
        konami: { title: 'Secret code!', body: 'A true gamer 🕹️' },
      },
      categories: {
        aboutYou: 'About you',
        motivations: 'Motivations & personal tastes',
        experience: 'Experience & projects',
        workStyle: 'Work style & collaboration',
        contactPortfolio: 'Contact & portfolio',
      },
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
        hobbies: {
          label: 'What are your hobbies?',
          playerLine: 'What are your hobbies?',
        },
        superpower: {
          label: 'If you had a superpower, what would it be?',
          playerLine: 'If you had a superpower, what would it be?',
        },
        location: {
          label: 'Where do you live?',
          playerLine: 'Where do you live?',
        },
        futureSelf: {
          label: 'How do you see yourself in 2-3 years?',
          playerLine: 'How do you see yourself in 2-3 years?',
        },
        spokenLanguages: {
          label: 'Which languages do you speak?',
          playerLine: 'Which languages do you speak?',
        },
        languageIdentity: {
          label: 'If you were a programming language, which one would you be?',
          playerLine: 'If you were a programming language, which one would you be?',
        },
        aiWork: {
          label: 'Do you work with Artificial Intelligence?',
          playerLine: 'Do you work with Artificial Intelligence?',
        },
        futureProjects: {
          label: 'What kinds of projects would you like to build in the future?',
          playerLine: 'What kinds of projects would you like to build in the future?',
        },
        teamwork: {
          label: 'How do you usually collaborate with a team?',
          playerLine: 'How do you usually collaborate with a team?',
        },
        workValues: {
          label: 'What do you value most in a job?',
          playerLine: 'What do you value most in a job?',
        },
        problemSolving: {
          label: 'How do you tackle challenges when you don’t know something?',
          playerLine: 'How do you tackle challenges when you don’t know something?',
        },
        dailyMotivation: {
          label: 'What motivates you to keep learning every day?',
          playerLine: 'What motivates you to keep learning every day?',
        },
        leastFavorite: {
          label: 'What do you like least as a programmer?',
          playerLine: 'What do you like least as a programmer?',
        },
        videogame: {
          label: 'Why did you get into full stack?',
          playerLine: 'Why did you get into full stack?',
        },
        advicePast: {
          label: 'If you could advise your past self, what would you say?',
          playerLine: 'If you could advise your past self, what would you say?',
        },
        github: {
          label: 'Could you show me your GitHub?',
          playerLine: 'Could you show me your GitHub?',
        },
        cv: {
          label: 'Could you share your résumé?',
          playerLine: 'Could you share your résumé?',
        },
      },
      answers: {
        introduction:
          'I’m Luis Ángel Da Silva, though many people call me Luigi.\nI’m a full stack developer and I love creating web experiences that not only look good, but are also thoughtfully built on the inside.\nI enjoy design and user experience as much as the logic, structure, and real-world functionality behind every project.',
        motivation:
          'Programming hooks me because it blends creativity with systems thinking. Building an interface feels like composing music with pixels and logic.',
        learning:
          'I’ve been diving deeper into Framer Motion, inclusive design practices and little AI helpers that speed up ideation and prototyping.',
        projects:
          'Recent work includes interactive dashboards, playful landing pages and personal experiments that celebrate pixel aesthetics. Each project is a new playground.',
        contact:
          'Email me at luigidasilv@gmail.com or drop a message on LinkedIn—bonus points if you mention the pixelated door!',
        hobbies:
          'I recharge by sketching pixel art, noodling on synths and wandering with my camera hunting textures for future interfaces.',
        superpower:
          'I’d freeze time for a couple of minutes. Perfect for polishing micro-interactions without breaking deadlines—and for bonus naps.',
        location:
          'I recently moved to Eindhoven in the Netherlands. The tech energy here and the calm pace of life are a great mix.',
        futureSelf:
          'In 2-3 years, I see myself leading full stack projects with creative teams, sharpening my leadership and shipping products with real impact.',
        spokenLanguages:
          'I speak native Spanish since I was born in Venezuela, and I can speak English fluently without a problem.',
        languageIdentity:
          'I’d be well-thought-out JavaScript: flexible, creative and able to adapt to almost anything, but with structure and logic so nothing breaks as the project grows.',
        aiWork:
          'Yep! AI helps me ideate, sanity-check copy and prototype faster, but human criteria and ethics always steer the ship.',
        futureProjects:
          'I dream about building immersive narrative sites, collaborative creative tools and dashboards that feel like cozy indie games.',
        teamwork:
          'Teamwork for me means over-communicating, documenting as I go and creating space so everyone can bring their superpower.',
        workValues:
          'I value transparency, a learning mindset and the freedom to experiment without fear of failing forward.',
        problemSolving:
          'When I’m stuck, I break the problem down, research reliable sources and ask for help early so the team keeps moving.',
        dailyMotivation:
          'Knowing someone might smile while using something I built—and that every day holds a fresh trick to learn—keeps me going.',
        leastFavorite:
          'I like programming less when processes get overly bureaucratic or slow and the focus shifts away from building real value for people.',
        videogame:
          'I got into full stack because I wanted to understand the entire product journey—from the idea and design to the logic that makes it work.',
        advicePast:
          'I’d tell past-me to trust the weird ideas, rest more often and share work early; feedback is fuel.',
        github: 'Sure—here it is.',
        cv: 'Absolutely—here you go.',
      },
    conversation: {
      youLabel: 'You',
      characterLabel: 'LK replies',
      okButton: 'Okay',
      githubButton: 'Go to GitHub',
      cvButton: 'Download CV',
      skipHint: 'click to skip',
    },
  },
    suggestions: {
      buttonLabel: 'Suggest a question',
      modalTitle: 'Suggest a new question',
      modalDescription: 'Think we are missing something? Share your proposed question and I will review it.',
      questionLabel: 'Suggested question',
      questionPlaceholder: 'Write the question you would like to see in the interview...',
      categoryLabel: 'Category (optional)',
      categoryPlaceholder: 'e.g. experience, motivation, culture...',
      cancel: 'Cancel',
      submit: 'Send suggestion',
      successTitle: 'Thank you!',
      successMessage: 'Your suggestion was sent. I will review it soon.',
      errorMessage: 'Could not send the suggestion. Please try again.',
      validationMessage: 'Please write a question with at least 8 characters.',
    },
    footer: {
      text: 'Built with React + Tailwind + Framer Motion',
    },
    meta: {
      languageTitle: 'Prepare for the interview',
      loadingTitles: ['loading.', 'loading..', 'loading...'],
      doorTitle: 'Luis wants to come in!',
      interviewTitle: 'Interview with Luis Ángel Da Silva',
    },
  },
}

export type DictKey = keyof typeof dict.en
