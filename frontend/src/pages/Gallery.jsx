import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ALLOWED_IMAGE_TYPES } from '../services/gallery'
import { useGallery, useMyUploads } from '../hooks/useGallery'
import { WEDDING } from '../config/wedding'

// Build filter chips from event slugs defined in config
const EVENT_FILTERS = WEDDING.events.map(e => ({ label: e.name, tag: e.slug }))
const FILTERS = [{ label: 'All Photos', tag: null }, ...EVENT_FILTERS, { label: 'My Photos', tag: '__mine__' }]

export default function Gallery() {
  const { guest } = useAuth()
  const [activeFilter, setActiveFilter] = useState(null) // null = all
  const [uploadingLocal, setUploadingLocal] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [lightbox, setLightbox] = useState(null) // photo url for full-screen view
  const fileRef = useRef(null)

  const isMyPhotos = activeFilter === '__mine__'
  const eventTag = isMyPhotos ? null : activeFilter

  const { photos: communityPhotos, loading } = useGallery(eventTag)
  const { photos: myPhotos, upload, remove } = useMyUploads(guest?.id)

  // When "My Photos" is active, show the guest's own uploads (including pending)
  // Otherwise show all approved community photos
  const photos = isMyPhotos ? myPhotos : communityPhotos

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file || !guest) return
    try {
      setUploadingLocal(true)
      await upload(file, eventTag ?? 'general')
      setActiveFilter('__mine__')
      setNotice('Photo uploaded. It is waiting for review and only you can see it for now.')
    } catch (err) {
      alert(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploadingLocal(false)
      e.target.value = ''
    }
  }

  async function handleRemovePhoto(photo) {
    if (photo.moderation_status !== 'pending') return
    if (!window.confirm('Remove this uploaded photo?')) return

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

      {notice && (
        <div className="mx-4 mb-4 rounded-2xl border border-primary/10 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant shadow-sm flex items-start justify-between gap-3">
          <span className="leading-relaxed">{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="material-symbols-outlined text-base leading-none text-primary/70 hover:text-primary"
            aria-label="Dismiss notice"
          >
            close
          </button>
        </div>
      )}

      {isMyPhotos && photos.some(photo => photo.moderation_status === 'pending') && (
        <div className="mx-4 mb-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant shadow-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-tertiary text-base mt-0.5">schedule</span>
          <span className="leading-relaxed">Pending photos are visible only to you until they are approved. You can remove one if it was added by mistake.</span>
        </div>
      )}

      {/* Grid */}
      <div className="px-4 pb-28 max-w-7xl mx-auto">
        <div className="masonry-grid">
          {/* Upload tile — always first, not shown when browsing My Photos with no uploads */}
          {!isMyPhotos && (
            <button
              onClick={() => fileRef.current?.click()}
              className="masonry-item rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center p-6 text-center h-48 cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {uploadingLocal ? 'hourglass_top' : 'add_a_photo'}
                </span>
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                {uploadingLocal ? 'Uploading…' : 'Share a Moment'}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-1">Add your photo to the album</p>
            </button>
          )}

          {/* Photos */}
          {loading && photos.length === 0 && (
            <div className="masonry-item flex items-center justify-center h-48 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined animate-spin text-2xl mr-2">progress_activity</span>
              Loading…
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div className="masonry-item col-span-2 text-center py-16 text-on-surface-variant">
              {isMyPhotos ? (
                <>
                  <span className="material-symbols-outlined text-4xl mb-3 block text-outline">add_a_photo</span>
                  <p className="text-sm font-semibold mb-1">No photos yet</p>
                  <p className="text-xs">Upload your first moment from the button below</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl mb-3 block text-outline">photo_library</span>
                  <p className="text-sm font-semibold mb-1">Album is empty</p>
                  <p className="text-xs">Be the first to share a moment!</p>
                </>
              )}
            </div>
          )}

          {photos.map(photo => (
            <div
              key={photo.id}
              className={`masonry-item group relative rounded-xl overflow-hidden bg-surface-container-low cursor-pointer ${
                photo.moderation_status === 'pending' ? 'opacity-60' : ''
              }`}
              onClick={() => photo.moderation_status !== 'pending' && setLightbox(photo.public_url)}
            >
              <img src={photo.public_url} alt="" className="w-full h-auto" loading="lazy" />

              {/* Caption overlay */}
              {(photo.guests?.name || photo.event_tag) && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white/90 font-label">
                    {[photo.guests?.name, photo.event_tag?.charAt(0).toUpperCase() + photo.event_tag?.slice(1)]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              )}

              {/* Pending badge — only visible on My Photos */}
              {isMyPhotos && photo.moderation_status === 'pending' && (
                <>
                  <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full text-[10px] text-on-tertiary-container font-semibold flex items-center gap-1 shadow-sm bg-tertiary-container/95 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[11px]">schedule</span>
                    Pending review
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleRemovePhoto(photo)
                    }}
                    disabled={deletingPhotoId === photo.id}
                    className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-[10px] text-error font-semibold flex items-center gap-1 border border-error/15 bg-surface-container-low/90 backdrop-blur-sm shadow-sm hover:bg-error/10 disabled:opacity-60 transition-colors"
                    aria-label="Remove uploaded photo"
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {deletingPhotoId === photo.id ? 'progress_activity' : 'delete'}
                    </span>
                    {deletingPhotoId === photo.id ? 'Removing' : 'Remove'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

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
        <span className="material-symbols-outlined text-2xl">add_a_photo</span>
      </button>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
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
