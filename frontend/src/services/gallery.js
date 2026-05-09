import { supabase } from './supabase'

const BUCKET = 'gallery'

export async function fetchApprovedPhotos(eventTag = null) {
  let query = supabase
    .from('gallery_photos')
    .select('*, guests(name)')
    .eq('moderation_status', 'approved')
    .order('uploaded_at', { ascending: false })

  if (eventTag) query = query.eq('event_tag', eventTag)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchGuestPhotos(guestId) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('guest_id', guestId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function uploadPhoto(file, guestId, eventTag) {
  const ext = file.name.split('.').pop()
  const path = `${guestId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    if (uploadError.statusCode === '400' || uploadError.message?.includes('Bucket not found')) {
      throw new Error('Gallery storage not set up yet. Please create a public bucket named "gallery" in Supabase → Storage.')
    }
    throw uploadError
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  const { data, error } = await supabase
    .from('gallery_photos')
    .insert({ guest_id: guestId, event_tag: eventTag, storage_path: path, public_url: publicUrl })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function approvePhoto(photoId) {
  const { error } = await supabase
    .from('gallery_photos')
    .update({ moderation_status: 'approved' })
    .eq('id', photoId)
  if (error) throw error
}
