// Tags that own their Enter activation (buttons, links, form controls).
const SELF_ACTIVATING = new Set(['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'])

/**
 * Whether a global Enter shortcut may act for an event whose origin has this tag.
 * Controls with their own activation (e.g. the skip link, language buttons) must not
 * also trigger the shortcut.
 */
export function canEnterShortcutAct(tagName: string | undefined | null): boolean {
  return !tagName || !SELF_ACTIVATING.has(tagName.toUpperCase())
}
