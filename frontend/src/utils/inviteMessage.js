import { WEDDING } from '../config/wedding'

/** Effective base URL for links (env → current origin in browser). */
export function getAppUrl() {
  const fromEnv = (WEDDING.appUrl || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/**
 * WhatsApp / SMS–friendly invite text with code + /login link.
 */
export function buildInviteMessage({ guestName, inviteCode }) {
  const base = getAppUrl()
  const couple = WEDDING.coupleShort
  const loginUrl = `${base}/login`
  return [
    `Hi ${guestName}!`,
    '',
    `You're invited to ${couple}'s wedding — RSVP, events, gallery, and more on our site.`,
    '',
    `Your invite code: ${inviteCode}`,
    '',
    `Open the app: ${loginUrl}`,
    '',
    'Sign in with Google or request an email link on that page, then enter your invite code when prompted.',
    '',
    `— ${couple}`,
  ].join('\n')
}
