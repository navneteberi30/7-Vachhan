import { supabase } from './supabase'

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

export async function fetchEvent(slug) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function submitRSVP({ guestId, eventId, attending, guestCount, notes }) {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .upsert(
      { guest_id: guestId, event_id: eventId, attending, guest_count: guestCount ?? 1, dietary_notes: notes },
      { onConflict: 'guest_id,event_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchGuestRSVPs(guestId) {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .select('*, events(slug, name)')
    .eq('guest_id', guestId)
  if (error) throw error
  return data ?? []
}
