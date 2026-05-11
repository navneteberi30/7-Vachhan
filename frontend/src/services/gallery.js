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

function isStorageObjectMissing(error) {
  if (!error) return false
  const msg = (error.message || '').toLowerCase()
  return msg.includes('not found') || msg.includes('does not exist') || error.statusCode === '404'
}

async function attachSignedUrls(photos) {
  return Promise.all((photos ?? []).map(async photo => {
    if (!photo.storage_path) return photo

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(photo.storage_path, SIGNED_URL_TTL_SECONDS)

    if (error) {
      const missing = isStorageObjectMissing(error)
      if (!missing) {
        console.warn('Gallery signed URL failed:', photo.storage_path, error.message)
      }
      return {
        ...photo,
        public_url: null,
        missing_in_storage: missing,
      }
    }
    return { ...photo, public_url: data.signedUrl, missing_in_storage: false }
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

export async function fetchMyPhotos(authUid) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('uploader_auth_uid', authUid)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return attachSignedUrls(data)
}

function sanitizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30) || 'guest'
}

export async function uploadPhoto(file, guestId, eventTag, uploaderName = null) {
  validateImageFile(file)

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Please sign in again before uploading.')

  const ext  = EXTENSION_BY_MIME[file.type]
  const tag  = eventTag || 'general'
  // Resolve a human-readable folder name: guest name > Google display name > email prefix > uid
  const rawName = uploaderName
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || user.id
  const name = sanitizeName(rawName)
  // Structure: event_name / user_name / uuid.ext  — easy to navigate in Supabase dashboard
  const path = `${tag}/${name}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })

  if (uploadError) {
    if (uploadError.statusCode === '400' || uploadError.message?.includes('Bucket not found')) {
      throw new Error('Gallery storage not set up yet. Please create a bucket named "gallery" in Supabase → Storage.')
    }
    throw uploadError
  }

  const { data, error } = await supabase
    .from('gallery_photos')
    .insert({
      guest_id: guestId || null,        // null for unlinked users
      uploader_auth_uid: user.id,       // always set — enables "My Photos" for anyone
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

/** Admin moderation — pending / approved / rejected */
export async function fetchPhotosByModerationStatus(status) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*, guests(name)')
    .eq('moderation_status', status)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return attachSignedUrls(data ?? [])
}

export async function rejectPhoto(photoId) {
  const { error } = await supabase
    .from('gallery_photos')
    .update({ moderation_status: 'rejected' })
    .eq('id', photoId)
  if (error) throw error
}
