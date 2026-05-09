import { supabase } from './supabase'

const BUCKET = 'gallery'
const SIGNED_URL_TTL_SECONDS = 60 * 60
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const EXTENSION_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Please upload a JPG, PNG, WebP, or GIF image.')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Please upload an image smaller than 10 MB.')
  }
}

async function attachSignedUrls(photos) {
  return Promise.all((photos ?? []).map(async photo => {
    if (!photo.storage_path) return photo

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(photo.storage_path, SIGNED_URL_TTL_SECONDS)

    if (error) throw error
    return { ...photo, public_url: data.signedUrl }
  }))
}

export async function fetchApprovedPhotos(eventTag = null) {
  let query = supabase
    .from('gallery_photos')
    .select('*, guests(name)')
    .eq('moderation_status', 'approved')
    .order('uploaded_at', { ascending: false })

  if (eventTag) query = query.eq('event_tag', eventTag)

  const { data, error } = await query
  if (error) throw error
  return attachSignedUrls(data)
}

export async function fetchGuestPhotos(guestId) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('guest_id', guestId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return attachSignedUrls(data)
}

export async function uploadPhoto(file, guestId, eventTag) {
  validateImageFile(file)

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Please sign in again before uploading.')

  const ext = EXTENSION_BY_MIME[file.type]
  const path = `${guestId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })

  if (uploadError) {
    if (uploadError.statusCode === '400' || uploadError.message?.includes('Bucket not found')) {
      throw new Error('Gallery storage not set up yet. Please create a public bucket named "gallery" in Supabase → Storage.')
    }
    throw uploadError
  }

  const { data, error } = await supabase
    .from('gallery_photos')
    .insert({
      guest_id: guestId,
      event_tag: eventTag,
      storage_path: path,
      public_url: null,
      moderation_status: 'pending',
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw error
  }
  return (await attachSignedUrls([data]))[0]
}

export async function deletePhoto(photo) {
  const { error } = await supabase
    .from('gallery_photos')
    .delete()
    .eq('id', photo.id)

  if (error) throw error

  if (photo.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([photo.storage_path])

    if (storageError) {
      console.warn('Gallery object cleanup failed:', storageError.message)
    }
  }
}

export async function approvePhoto(photoId) {
  const { error } = await supabase
    .from('gallery_photos')
    .update({ moderation_status: 'approved' })
    .eq('id', photoId)
  if (error) throw error
}
