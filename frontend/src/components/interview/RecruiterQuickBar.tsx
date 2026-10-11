import { CONTACT_EMAIL, GITHUB_URL } from '../../data/interview'

type RecruiterQuickBarProps = {
  /** Accessible name of the bar, in the active language. */
  label: string
  /** CV file served for the active language (spec 003, RF-4 fallback included). */
  cvUrl: string
  cvDownloadName: string
  /** Same visible labels as the essential answers (spec 003), in the active language. */
  copy: {
    cvButton: string
    githubButton: string
    emailButton: string
  }
}

/**
 * Persistent quick-access bar, mounted ONLY in an interview reached through
 * the silent recruiter deep-link (spec 004, RF-5). It does not exist in the
 * normal flow.
 *
 * Every resource is 1 interaction away from its destination (click, Enter or
 * tap), reusing the spec-003 destinations and behaviors: CV downloads via a
 * hidden `<a>`, GitHub opens in a new tab, and contact is a `mailto:` link
 * with the address visible and selectable. Unlike the answer buttons, these
 * never touch the conversation state, so the bar stays put for the whole
 * interview without opening worlds or questions.
 */
export function RecruiterQuickBar({ label, cvUrl, cvDownloadName, copy }: RecruiterQuickBarProps) {
  /** Same CV download as the essential `cv` answer (spec 003, RF-4). */
  const handleCvDownload = () => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('a')
      link.href = cvUrl
      link.download = cvDownloadName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  /** Same GitHub redirect as the essential `github` answer (spec 003, RF-2). */
  const handleGithubRedirect = () => {
    if (typeof window !== 'undefined') {
      window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-30 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-line bg-panel/95 px-3 py-2 shadow-neon backdrop-blur-md sm:gap-3 sm:px-4"
    >
      <button type="button" onClick={handleCvDownload} className="btn-arcade bg-coin">
        📄 {copy.cvButton}
      </button>
      <button type="button" onClick={handleGithubRedirect} className="btn-arcade bg-neonPurple text-ink">
        🐙 {copy.githubButton}
      </button>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label={copy.emailButton}
        className="btn-arcade bg-neonCyan text-ink [user-select:text]"
      >
        ✉️ {CONTACT_EMAIL}
      </a>
    </nav>
  )
}
