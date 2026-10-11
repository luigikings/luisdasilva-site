/**
 * Pure entry-mode resolution (plan 004, RF-1/RF-2).
 *
 * Decides whether the visitor arrives via the silent recruiter deep-link
 * (`go` exactly equal to `interview`) or as a normal visitor. The match is
 * case-sensitive with no trimming and no percent-decoding, so uppercase,
 * spaced or encoded values stay normal. A repeated or mixed `go` param is
 * also normal. Any other query params and the `#fragment` are ignored.
 *
 * Pure: no DOM, network or date in here — the query string is injected as
 * a parameter. The UI only renders according to the returned mode.
 */
export type EntryMode = 'deeplink' | 'normal'

const DEEP_LINK_VALUE = 'interview'
const DEEP_LINK_KEY = 'go'

/**
 * Resolves the entry mode from a query string (with or without the
 * leading `?`; a `#fragment` suffix is ignored).
 */
export function resolveEntryMode(queryString: string): EntryMode {
  let query = queryString
  // A full URL still works: keep only what follows the first `?`.
  const questionMark = query.indexOf('?')
  if (questionMark >= 0) {
    query = query.slice(questionMark + 1)
  }
  // The fragment never validates nor invalidates (RF-2).
  const hashMark = query.indexOf('#')
  if (hashMark >= 0) {
    query = query.slice(0, hashMark)
  }
  if (query === '') {
    return 'normal'
  }

  // Raw split on purpose: URLSearchParams would percent-decode values, so
  // e.g. `go=%69nterview` would wrongly resolve to `interview`.
  const goValues: string[] = []
  for (const part of query.split('&')) {
    if (part === '') {
      continue
    }
    const equals = part.indexOf('=')
    const key = equals < 0 ? part : part.slice(0, equals)
    if (key !== DEEP_LINK_KEY) {
      continue
    }
    goValues.push(equals < 0 ? '' : part.slice(equals + 1))
  }

  return goValues.length === 1 && goValues[0] === DEEP_LINK_VALUE ? 'deeplink' : 'normal'
}
