import { supabase } from './supabase'

/** Dashboard counts */
export async function fetchAdminStats() {
  const [guestsRes, pendingRes, approvedRes, assignmentsRes, rsvpRes] = await Promise.all([
    supabase.from('guests').select('id', { count: 'exact', head: true }),
    supabase.from('gallery_photos').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('gallery_photos').select('id', { count: 'exact', head: true }).eq('moderation_status', 'approved'),
    supabase.from('room_assignments').select('id', { count: 'exact', head: true }),
    supabase.from('rsvp_responses').select('guest_id', { count: 'exact', head: true }).eq('attending', true),
  ])

  if (guestsRes.error) throw guestsRes.error
  if (pendingRes.error) throw pendingRes.error
  if (approvedRes.error) throw approvedRes.error
  if (assignmentsRes.error) throw assignmentsRes.error
  if (rsvpRes.error) throw rsvpRes.error

  return {
    guestCount: guestsRes.count ?? 0,
    pendingPhotos: pendingRes.count ?? 0,
    approvedPhotos: approvedRes.count ?? 0,
    roomAssignments: assignmentsRes.count ?? 0,
    attendingRsvpRows: rsvpRes.count ?? 0,
  }
}

export async function fetchAllGuests() {
  const { data, error } = await supabase
    .from('guests')
    .select('id, name, email, invite_code, supabase_user_id, is_admin, created_at')
    .order('name')
  if (error) throw error
  return data ?? []
}

function randomInviteSegment(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/** Generate a unique-looking invite code (retry if collision). */
export function generateInviteCode(prefix = 'GUEST') {
  return `${prefix}-${randomInviteSegment(4)}`
}

/** Placeholder email when DB requires uniqueness — admin can edit later. */
function placeholderEmail(code) {
  const slug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${slug}@guests.invite`
}

export async function createGuest({ name, invite_code: inviteCode }) {
  const code = (inviteCode || generateInviteCode()).trim().toUpperCase()
  const email = placeholderEmail(code)
  const { data, error } = await supabase
    .from('guests')
    .insert({
      name: name.trim(),
      invite_code: code,
      email,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGuest(id, patch) {
  const { data, error } = await supabase
    .from('guests')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** All RSVP rows with guest + event metadata */
export async function fetchAllRsvpResponses() {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .select(`
      id,
      attending,
      guest_count,
      dietary_notes,
      submitted_at,
      guest_id,
      event_id,
      guests ( id, name ),
      events ( id, slug, name )
    `)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
