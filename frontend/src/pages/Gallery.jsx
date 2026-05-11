import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ALLOWED_IMAGE_TYPES } from '../services/gallery'
import { useGallery, useMyUploads } from '../hooks/useGallery'
import { WEDDING } from '../config/wedding'

const EVENT_FILTERS = WEDDING.events.map(e => ({ label: e.name, tag: e.slug }))
// My Photos first, then All, then per-event
const FILTERS = [
  { label: 'My Photos', tag: '__mine__' },
  { label: 'All Photos', tag: null },
  ...EVENT_FILTERS,
]

export default function Gallery() {
  const { authUser, guest } = useAuth()
  const [activeFilter, setActiveFilter] = useState('__mine__') // default: My Photos
  const [uploadingLocal, setUploadingLocal] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const fileRef = useRef(null)

  const isMyPhotos  = activeFilter === '__mine__'
  const isAllPhotos = activeFilter === null
  const isEventTab  = !isMyPhotos && !isAllPhotos  // e.g. 'mehndi', 'haldi' …

  // eventTag passed to community query (null when My Photos or All Photos)
  const communityEventTag = isEventTab ? activeFilter : (isAllPhotos ? null : null)

  const { photos: communityPhotos, loading: communityLoading } = useGallery(communityEventTag)
  const { photos: myPhotos, upload, remove } = useMyUploads(authUser?.id, guest?.id, guest?.name)

  // When on an event tab, filter my photos to that event
  const myEventPhotos = isEventTab
    ? myPhotos.filter(p => p.event_tag === activeFilter)
    : myPhotos

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file || !authUser) return
    // Tag the photo with the current event filter (if on an event tab)
    const tag = isEventTab ? activeFilter : 'general'
    try {
      setUploadingLocal(true)
      await upload(file, tag)
      setNotice("Photo uploaded! Visible here while pending — it'll join the community gallery once approved.")
      // Stay on current tab so the user sees their upload immediately
      if (!isMyPhotos && !isEventTab) setActiveFilter('__mine__')
    } catch (err) {
      alert(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploadingLocal(false)
      e.target.value = ''
    }
  }

  async function handleRemovePhoto(photo) {
    const approvedNote =
      photo.moderation_status === 'approved'
        ? ' It will disappear from the shared gallery for everyone.'
        : ''
    if (!window.confirm(`Remove this photo?${approvedNote}`)) return
    try {
      setDeletingPhotoId(photo.id)
      await remove(photo)
      setNotice('Photo removed.')
    } catch (err) {
      alert(err.message || 'Could not remove this photo. Please try again.')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  // Reusable photo card
  function PhotoCard({ photo, showControls = false }) {
    return (
      <div
        key={photo.id}
        className={`masonry-item group relative rounded-xl overflow-hidden bg-surface-container-low cursor-pointer ${
          photo.moderation_status === 'pending' ? 'opacity-60' : ''
        }`}
        onClick={() => photo.moderation_status !== 'pending' && setLightbox(photo.public_url)}
      >
        <img src={photo.public_url} alt="" className="w-full h-auto" loading="lazy" />

        {(photo.guests?.name || photo.event_tag) && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white/90 font-label">
              {[photo.guests?.name, photo.event_tag?.charAt(0).toUpperCase() + photo.event_tag?.slice(1)]
                .filter(Boolean).join(' • ')}
            </p>
          </div>
        )}

        {showControls && (
          <>
            {photo.moderation_status === 'pending' && (
              <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full text-[10px] text-on-tertiary-container font-semibold flex items-center gap-1 shadow-sm bg-tertiary-container/95 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[11px]">schedule</span>
                Pending review
              </div>
            )}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleRemovePhoto(photo) }}
              disabled={deletingPhotoId === photo.id}
              className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-[10px] text-error font-semibold flex items-center gap-1 border border-error/15 bg-surface-container-low/90 backdrop-blur-sm shadow-sm hover:bg-error/10 disabled:opacity-60 transition-colors z-10"
              aria-label="Delete my photo"
            >
              <span className="material-symbols-outlined text-[12px]">
                {deletingPhotoId === photo.id ? 'progress_activity' : 'delete'}
              </span>
              {deletingPhotoId === photo.id ? 'Removing' : 'Delete'}
            </button>
          </>
        )}
      </div>
    )
  }

  function SectionLabel({ icon, title, subtitle }) {
    return (
      <div className="flex items-center gap-2 px-4 mb-3 mt-6">
        <span className="material-symbols-outlined text-primary text-base">{icon}</span>
        <div>
          <p className="font-headline text-sm text-on-surface leading-none">{title}</p>
          {subtitle && <p className="text-[10px] text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Header */}
      <div className="pt-8 pb-4 text-center px-6">
        <p className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase mb-1">The Journal</p>
        <h2 className="text-4xl font-headline text-on-surface">Guest Gallery</h2>
        <p className="text-on-surface-variant text-sm mt-1">Capturing moments together</p>
      </div>

      {/* Filter chips */}
      <div className="flex overflow-x-auto pb-3 mb-2 gap-2 no-scrollbar px-4">
        {FILTERS.map(f => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.tag)}
            className={`px-5 py-2 rounded-full font-label text-xs font-semibold whitespace-nowrap shadow-sm transition-colors ${
              activeFilter === f.tag
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Pending banner — My Photos tab */}
      {isMyPhotos && myPhotos.some(p => p.moderation_status === 'pending') && (
        <div className="mx-4 mb-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant shadow-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-tertiary text-base mt-0.5">schedule</span>
          <span className="leading-relaxed">Photos pending review are only visible to you. They'll appear in the community gallery once approved.</span>
        </div>
      )}

      {notice && (
        <div className="mx-4 mb-4 rounded-2xl border border-primary/10 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant shadow-sm flex items-start justify-between gap-3">
          <span className="leading-relaxed">{notice}</span>
          <button onClick={() => setNotice(null)} className="material-symbols-outlined text-base leading-none text-primary/70 hover:text-primary" aria-label="Dismiss">close</button>
        </div>
      )}

      {/* ── MY PHOTOS tab ─────────────────────────────────────────── */}
      {isMyPhotos && (
        <div className="px-4 pb-28 max-w-7xl mx-auto">
          {myPhotos.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 block text-outline">add_a_photo</span>
              <p className="text-sm font-semibold mb-1">No photos yet</p>
              <p className="text-xs">Tap the camera button to share your first moment</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {myPhotos.map(photo => <PhotoCard key={photo.id} photo={photo} showControls />)}
            </div>
          )}
        </div>
      )}

      {/* ── ALL PHOTOS tab ────────────────────────────────────────── */}
      {isAllPhotos && (
        <div className="px-4 pb-28 max-w-7xl mx-auto">
          {communityLoading && communityPhotos.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined animate-spin text-2xl mr-2">progress_activity</span>Loading…
            </div>
          ) : communityPhotos.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 block text-outline">photo_library</span>
              <p className="text-sm font-semibold mb-1">Album is empty</p>
              <p className="text-xs">Be the first to share a moment!</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {communityPhotos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
            </div>
          )}
        </div>
      )}

      {/* ── EVENT tab — two sections ──────────────────────────────── */}
      {isEventTab && (
        <div className="pb-28 max-w-7xl mx-auto">
          {/* Your Uploads for this event */}
          <SectionLabel
            icon="person"
            title="Your Uploads"
            subtitle={myEventPhotos.some(p => p.moderation_status === 'pending') ? 'Pending photos visible only to you' : undefined}
          />
          <div className="px-4">
            {myEventPhotos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low/40 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 block text-outline/60">add_a_photo</span>
                <p className="text-xs">You haven't shared any moments for this event yet</p>
                <p className="text-[10px] mt-1 text-outline">Tap the camera button below to upload</p>
              </div>
            ) : (
              <div className="masonry-grid">
                {myEventPhotos.map(photo => <PhotoCard key={photo.id} photo={photo} showControls />)}
              </div>
            )}
          </div>

          {/* Community photos for this event */}
          <SectionLabel
            icon="groups"
            title="Community"
            subtitle="Approved photos from all guests"
          />
          <div className="px-4">
            {communityLoading ? (
              <div className="flex items-center justify-center h-32 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined animate-spin text-2xl mr-2">progress_activity</span>Loading…
              </div>
            ) : communityPhotos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low/40 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 block text-outline/60">photo_library</span>
                <p className="text-xs font-semibold mb-1">Photos are being reviewed</p>
                <p className="text-[10px]">Check back soon — approved photos will appear here</p>
              </div>
            ) : (
              <div className="masonry-grid">
                {communityPhotos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={[...ALLOWED_IMAGE_TYPES].join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload FAB */}
      <button
        onClick={() => fileRef.current?.click()}
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg active:scale-95 transition-all duration-300 hover:opacity-90"
        title="Share a moment"
      >
        <span className="material-symbols-outlined text-2xl">
          {uploadingLocal ? 'hourglass_top' : 'add_a_photo'}
        </span>
      </button>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
