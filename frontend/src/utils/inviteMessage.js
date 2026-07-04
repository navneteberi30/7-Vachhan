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
    `Dear ${guestName}`,
    '',
    'With joyful hearts, we are excited to share that we are getting married! As we begin this beautiful journey together, it would mean the world to celebrate these special moments with you and create memories to cherish forever✨ ✨',
    '',
    'To make celebrating with us easy and memorable, we\'ve created our Wedding App "Saat Vachan", bringing together all the details- from event schedules and venue information to guest responses, photos, and much more.',
    '',
    `📱 Open the app: ${loginUrl}`,
    '',
    `🔑 Invite Code: ${inviteCode}`,
    '',
    'Simply sign in with Google or request an email link, and enter the invite code when prompted.',
    '',
    'We can\'t wait to celebrate with all our loved ones!  Your presence will make these moments even more special❤️',
    '',
    'With love,',
    `${couple} 💍✨`,
  ].join('\n')
}


