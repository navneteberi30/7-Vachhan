import { useEffect, useState, useCallback } from 'react'
import {
  fetchPhotosByModerationStatus,
  approvePhoto,
  rejectPhoto,
  deletePhoto,
} from '../../services/gallery'

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

export default function AdminGallery() {
  const [tab, setTab] = useState('pending')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPhotosByModerationStatus(tab)
      setPhotos(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  async function handleApprove(id) {
    try {
      setBusyId(id)
      await approvePhoto(id)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id) {
    if (!window.confirm('Reject this photo? It will be hidden from the gallery.')) return
    try {
      setBusyId(id)
      await rejectPhoto(id)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemoveRecord(photo) {
    const msg = photo.missing_in_storage
      ? 'Delete this row? The file is not in Storage (orphan metadata).'
      : 'Delete this gallery row? Preview could not be loaded.'
    if (!window.confirm(msg)) return
    try {
      setBusyId(photo.id)
      await deletePhoto(photo)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="font-headline text-3xl text-on-surface mb-2">Photo moderation</h1>
      <p className="text-sm text-on-surface-variant mb-6">Approve guest uploads for the public gallery.</p>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              tab === id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 p-3 text-error text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </p>
      ) : photos.length === 0 ? (
        <p className="text-on-surface-variant text-sm">No photos in this queue.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest overflow-hidden shadow-sm"
            >
              <div className="aspect-square bg-surface-container-low flex items-center justify-center">
                {photo.public_url ? (
                  <img src={photo.public_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-xs text-on-surface-variant space-y-2">
                    <span className="material-symbols-outlined text-3xl block text-outline">broken_image</span>
                    {photo.missing_in_storage ? (
                      <>
                        <p className="font-medium text-on-surface">File not in bucket</p>
                        <p className="text-[10px] leading-snug">
                          This row points at a path that no longer exists in Storage (often after cleanup or a failed upload). Remove the record or ignore.
                        </p>
                      </>
                    ) : (
                      <p>Preview unavailable — check storage permissions (RLS).</p>
                    )}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {photo.guests?.name || 'Guest'}
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                  {photo.event_tag || 'general'}
                </p>
                {tab === 'pending' && (
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === photo.id || photo.missing_in_storage}
                        title={photo.missing_in_storage ? 'Cannot approve — file missing from storage' : ''}
                        onClick={() => handleApprove(photo.id)}
                        className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
                      >
                        {busyId === photo.id ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === photo.id}
                        onClick={() => handleReject(photo.id)}
                        className="flex-1 py-2 rounded-xl border border-outline-variant text-error text-xs font-bold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                    {!photo.public_url && (
                      <button
                        type="button"
                        disabled={busyId === photo.id}
                        onClick={() => handleRemoveRecord(photo)}
                        className="w-full py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant text-[10px] font-semibold hover:bg-surface-container-high"
                      >
                        {photo.missing_in_storage ? 'Remove orphan record' : 'Remove record'}
                      </button>
                    )}
                  </div>
                )}
                {tab !== 'pending' && !photo.public_url && (
                  <button
                    type="button"
                    disabled={busyId === photo.id}
                    onClick={() => handleRemoveRecord(photo)}
                    className="w-full mt-2 py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant text-[10px] font-semibold hover:bg-surface-container-high"
                  >
                    Remove broken record
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
