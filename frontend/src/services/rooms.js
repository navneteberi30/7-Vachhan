import { supabase } from './supabase'

export async function fetchRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_assignments(*, guests(id, name))')
    .order('room_number')
  if (error) throw error
  return data
}

export async function assignGuestToRoom(guestId, roomId) {
  const { data, error } = await supabase
    .from('room_assignments')
    .upsert({ guest_id: guestId, room_id: roomId }, { onConflict: 'guest_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeRoomAssignment(guestId) {
  const { error } = await supabase
    .from('room_assignments')
    .delete()
    .eq('guest_id', guestId)
  if (error) throw error
}
