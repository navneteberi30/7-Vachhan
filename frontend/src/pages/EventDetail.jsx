import { useParams, Link } from 'react-router-dom'
import { useEvent } from '../hooks/useEvents'
import { WEDDING } from '../config/wedding'

function mapsUrl(venue, address) {
  return `https://maps.google.com/?q=${encodeURIComponent(venue + ', ' + address)}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function EventDetail() {
  const { slug } = useParams()
  const { event, loading } = useEvent(slug)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
    </div>
  )

  if (!event) return (
    <div className="text-center py-24 px-6">
      <p className="text-on-surface-variant">Event not found.</p>
      <Link to="/events" className="text-primary font-bold mt-4 inline-block hover:underline">← Back to Events</Link>
    </div>
  )

  return (
    <div className="bg-background text-on-surface">
      {/* Hero image */}
      <div className="relative w-full overflow-hidden" style={{ height: '45vh', minHeight: 280 }}>
        <img src={WEDDING.eventImages[slug]} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="font-label text-tertiary uppercase tracking-[0.2em] text-xs font-semibold">
            {event.theme_label}
          </span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight mt-1">{event.name}</h2>
          <p className="font-headline italic text-on-surface/50 text-2xl mt-1">{event.ceremony_label || slug.charAt(0).toUpperCase() + slug.slice(1)}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-10 pb-12 pt-8">
        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 text-tertiary mb-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span className="font-label text-[11px] uppercase tracking-widest font-bold">Date</span>
            </div>
            <p className="font-headline text-lg text-on-surface leading-snug">{formatDate(event.event_date)}</p>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 text-tertiary mb-2">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-label text-[11px] uppercase tracking-widest font-bold">Time</span>
            </div>
            <p className="font-headline text-lg text-on-surface leading-snug">{event.event_time}</p>
          </div>
        </div>

        {/* Venue */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="p-6 space-y-2">
            <h3 className="font-headline text-2xl text-primary">{event.venue_name}</h3>
            <p className="font-body text-on-surface-variant leading-relaxed">{event.venue_address}</p>
          </div>
          <a
            href={mapsUrl(event.venue_name, event.venue_address)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 cta-gradient text-on-primary font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">near_me</span>
            Navigate to Venue
          </a>
        </div>

        {/* Dress code */}
        <div className="flex items-center gap-4 bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-secondary text-2xl">checkroom</span>
          <div>
            <p className="font-label text-[11px] uppercase tracking-widest text-secondary font-bold mb-0.5">Dress Code</p>
            <p className="font-headline text-lg text-on-surface">{event.dress_code}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 mandala-bg">
          <p className="font-body text-on-surface-variant leading-relaxed text-base">{event.description}</p>
        </div>

        {/* Wedding day timeline */}
        {slug === 'wedding' && (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 space-y-6">
            <h3 className="font-headline text-xl text-center">The Itinerary</h3>
            <div className="space-y-8">
              {WEDDING.weddingTimeline.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="pt-1 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ring-4 ${i === 0 ? 'bg-primary ring-primary-container/30' : 'bg-outline-variant ring-outline-variant/20'}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-label text-xs text-tertiary font-bold uppercase tracking-widest">{item.time} — {item.label}</p>
                    <p className="font-headline text-lg">{item.title}</p>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP CTA */}
        <div className="text-center space-y-3">
          <Link to="/rsvp" className="cta-gradient text-on-primary font-bold py-4 px-12 rounded-full shadow-xl shadow-primary/10 hover:scale-[0.98] transition-transform duration-150 inline-block">
            RSVP for this Event
          </Link>
          <p className="text-xs font-label text-outline uppercase tracking-widest">
            Please confirm your attendance
          </p>
        </div>

        <Link to="/events" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span> All Events
        </Link>
      </div>
    </div>
  )
}
