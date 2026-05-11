import { useState, useEffect, useCallback } from 'react'
import { deletePhoto, fetchApprovedPhotos, fetchMyPhotos, uploadPhoto } from '../services/gallery'

export function useGallery(eventTag = null) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchApprovedPhotos(eventTag)
      setPhotos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [eventTag])

  useEffect(() => { load() }, [load])

  return { photos, loading, error, reload: load }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// authUid    = supabase auth user id (always available after Google sign-in)
// guestId    = linked guest record id (only set if invite code was claimed; can be null)
// guestName  = display name used as the storage folder (guest name or Google name)
export function useMyUploads(authUid, guestId, guestName) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (!authUid || !UUID_RE.test(authUid)) { setLoading(false); return }
    fetchMyPhotos(authUid)
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authUid])

  async function upload(file, eventTag) {
    try {
      setUploading(true)
      setUploadError(null)
      // guestId / guestName may be null for unlinked family members — that's fine
      const photo = await uploadPhoto(file, guestId ?? null, eventTag, guestName ?? null)
      setPhotos(prev => [photo, ...prev])
      return photo
    } catch (err) {
      setUploadError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  async function remove(photo) {
    await deletePhoto(photo)
    setPhotos(prev => prev.filter(item => item.id !== photo.id))
  }

  return { photos, loading, upload, remove, uploading, uploadError }
}
