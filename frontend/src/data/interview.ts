import type { QuestionGroupKey, QuestionKey } from '../i18n/dict'

export const questionGroupConfig: Record<QuestionGroupKey, { emoji: string; questions: QuestionKey[] }> = {
  aboutYou: {
    emoji: '🧑',
    questions: ['introduction', 'languageIdentity', 'videogame', 'location', 'futureSelf', 'spokenLanguages'],
  },
  motivations: {
    emoji: '🎉',
    questions: ['motivation', 'hobbies', 'superpower', 'dailyMotivation', 'leastFavorite', 'advicePast'],
  },
  experience: {
    emoji: '🛠️',
    questions: ['learning', 'projects', 'futureProjects', 'aiWork'],
  },
  workStyle: {
    emoji: '🤝',
    questions: ['teamwork', 'workValues', 'problemSolving'],
  },
  contactPortfolio: {
    emoji: '📬',
    questions: ['contact', 'github', 'cv'],
  },
}

export const questionEmojis: Record<QuestionKey, string> = {
  introduction: '🙋‍♂️',
  motivation: '💡',
  learning: '📚',
  projects: '🛠️',
  contact: '📬',
  hobbies: '🎨',
  superpower: '🦸‍♂️',
  location: '📍',
  futureSelf: '🔮',
  spokenLanguages: '🗣️',
  languageIdentity: '💻',
  aiWork: '🤖',
  futureProjects: '🚀',
  teamwork: '🤝',
  workValues: '🎯',
  problemSolving: '🧩',
  dailyMotivation: '🌅',
  leastFavorite: '🙃',
  videogame: '🎮',
  advicePast: '🕰️',
  github: '🐙',
  cv: '📄',
}

/** All questions cost 1 coin except `github` which is always free. */
export const questionCosts: Record<QuestionKey, number> = {
  introduction: 1,
  motivation: 1,
  learning: 1,
  projects: 1,
  contact: 1,
  hobbies: 1,
  superpower: 1,
  location: 1,
  futureSelf: 1,
  spokenLanguages: 1,
  languageIdentity: 1,
  aiWork: 1,
  futureProjects: 1,
  teamwork: 1,
  workValues: 1,
  problemSolving: 1,
  dailyMotivation: 1,
  leastFavorite: 1,
  videogame: 1,
  advicePast: 1,
  github: 0,
  cv: 1,
}

/** Reverse-lookup: QuestionKey → QuestionGroupKey, built once at module load. */
export const questionToGroupMap = Object.entries(questionGroupConfig).reduce(
  (acc, [groupKey, value]) => {
    value.questions.forEach((questionKey) => {
      acc[questionKey] = groupKey as QuestionGroupKey
    })
    return acc
  },
  {} as Record<QuestionKey, QuestionGroupKey>,
)

export const GITHUB_URL = 'https://github.com/luigikings'

/** Contact email (spec 003, RF-3). Shown as a `mailto:` link with the address visible. */
export const CONTACT_EMAIL = 'luigidasilv@gmail.com'

export interface ProjectLink {
  name: string
  url: string
  kind: 'code' | 'demo'
}

/** Verifiable project links (spec 003, RF-2). Magnar WarGames has a demo only, no code link. */
export const PROJECT_LINKS: ProjectLink[] = [
  { name: 'AgencyMac', url: 'https://github.com/luigikings/AgencyMac', kind: 'code' },
  { name: 'MetalRenova', url: 'https://github.com/luigikings/ChatarreroMetalRenova', kind: 'code' },
  { name: 'Magnar WarGames', url: 'https://www.magnarwargames.com/', kind: 'demo' },
]

/** CV per language (spec 003, RF-4). The ES file is still pending, so it falls back to EN. */
export const CV_EN_URL = '/cv-luis-dasilva-en.pdf'
export const CV_EN_DOWNLOAD_NAME = 'cv-luis-dasilva-en.pdf'
export const CV_ES_URL = '/cv-luis-dasilva-es.pdf'
export const CV_ES_DOWNLOAD_NAME = 'cv-luis-dasilva-es.pdf'
/** Whether the ES CV file exists in public/. Flip to true once it is provided. */
export const CV_ES_AVAILABLE = false

export interface ResolvedCv {
  url: string
  downloadName: string
  showFallbackNotice: boolean
}

/** Pure resolver: which CV to serve for the active language (spec 003, RF-4 + caso límite).
 * An indeterminable language (undefined/null/anything other than es/en) serves EN
 * with the EN fallback notice (spec.md caso límite). Explicit 'en' serves EN
 * without notice; explicit 'es' follows esAvailable. */
export function resolveCv(lang: unknown, esAvailable: boolean = CV_ES_AVAILABLE): ResolvedCv {
  if (lang === 'es' && esAvailable) {
    return { url: CV_ES_URL, downloadName: CV_ES_DOWNLOAD_NAME, showFallbackNotice: false }
  }
  if (lang === 'es') {
    return { url: CV_EN_URL, downloadName: CV_EN_DOWNLOAD_NAME, showFallbackNotice: true }
  }
  if (lang === 'en') {
    return { url: CV_EN_URL, downloadName: CV_EN_DOWNLOAD_NAME, showFallbackNotice: false }
  }
  return { url: CV_EN_URL, downloadName: CV_EN_DOWNLOAD_NAME, showFallbackNotice: true }
}

/** Starting coin budget per group — limits how many new questions a visitor can ask per category. */
export const initialCoinsByGroup: Record<QuestionGroupKey, number> = {
  aboutYou: 3,
  motivations: 4,
  experience: 2,
  workStyle: 2,
  contactPortfolio: 2,
}

/** Neon color identity for each question group ("world") */
export const groupTheme: Record<QuestionGroupKey, { color: string; glow: string; gradient: string }> = {
  aboutYou: {
    color: '#22e4ff',
    glow: 'rgba(34,228,255,0.55)',
    gradient: 'linear-gradient(135deg, rgba(34,228,255,0.35), rgba(155,92,255,0.15))',
  },
  motivations: {
    color: '#ff3ea5',
    glow: 'rgba(255,62,165,0.55)',
    gradient: 'linear-gradient(135deg, rgba(255,62,165,0.35), rgba(255,138,61,0.15))',
  },
  experience: {
    color: '#7cff6b',
    glow: 'rgba(124,255,107,0.5)',
    gradient: 'linear-gradient(135deg, rgba(124,255,107,0.3), rgba(34,228,255,0.12))',
  },
  workStyle: {
    color: '#b38bff',
    glow: 'rgba(155,92,255,0.6)',
    gradient: 'linear-gradient(135deg, rgba(155,92,255,0.4), rgba(255,62,165,0.12))',
  },
  contactPortfolio: {
    color: '#ffd23f',
    glow: 'rgba(255,210,63,0.55)',
    gradient: 'linear-gradient(135deg, rgba(255,210,63,0.35), rgba(255,138,61,0.15))',
  },
}
