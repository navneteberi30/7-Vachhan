import { useState, useEffect, useCallback } from 'react'
import { deletePhoto, fetchApprovedPhotos, fetchGuestPhotos, uploadPhoto } from '../services/gallery'

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

export function useMyUploads(guestId) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    // Skip if guestId is missing or not a valid UUID (e.g. stale demo session)
    if (!guestId || !UUID_RE.test(guestId)) { setLoading(false); return }
    fetchGuestPhotos(guestId)
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [guestId])

  async function upload(file, eventTag) {
    try {
      setUploading(true)
      setUploadError(null)
      const photo = await uploadPhoto(file, guestId, eventTag)
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
