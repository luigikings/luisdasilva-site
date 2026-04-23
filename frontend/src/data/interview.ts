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
export const CV_URL = '/CV%20Luis%20Angel%20Da%20Silva%20English.pdf'
export const CV_DOWNLOAD_NAME = 'CV Luis Angel Da Silva English.pdf'

/** Starting coin budget per group — limits how many new questions a visitor can ask per category. */
export const initialCoinsByGroup: Record<QuestionGroupKey, number> = {
  aboutYou: 3,
  motivations: 4,
  experience: 2,
  workStyle: 2,
  contactPortfolio: 2,
}
