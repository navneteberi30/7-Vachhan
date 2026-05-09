import { supabase } from './supabase'

export async function fetchGuests() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function fetchGuest(id) {
  const { data, error } = await supabase
    .from('guests')
    .select('*, rsvp_responses(*), room_assignments(*, rooms(*))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateGuestRsvpStatus(id, status) {
  const { data, error } = await supabase
    .from('guests')
    .update({ rsvp_status: status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
