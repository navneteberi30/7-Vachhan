import { useAuth } from '../contexts/AuthContext'
import { WEDDING } from '../config/wedding'
import { useEvents } from '../hooks/useEvents'

function formatEventWhen(event) {
  const d = new Date(event.event_date + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  // Extract time + AM/PM from event_time (e.g. "11:00 AM onwards" → "11:00 AM")
  const timeMatch = event.event_time.match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i)
  const time = timeMatch ? (timeMatch[1] + (timeMatch[2] ? ' ' + timeMatch[2].toUpperCase() : '')) : ''
  return `${month} ${day}${time ? ', ' + time : ''}`
}

function shortVenue(event) {
  // Use first segment of venue_address (city part)
  return (event.venue_address || '').split(',')[0].trim() || event.venue_name
}

export default function StayInfo() {
  const { guest } = useAuth()
  const { events } = useEvents()
  // Try to get room assignment from Supabase; fall back to a friendly message
  const roomNumber = null // Will be populated from room_assignments table

  const mapsUrl = `https://maps.google.com/?q=${WEDDING.hotel.mapsQuery}`

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
      {/* Hero header */}
      <section className="pt-12 px-6 text-center space-y-3 max-w-2xl mx-auto">
        <span className="font-label text-tertiary uppercase tracking-[0.2em] text-xs font-semibold">Your Stay Experience</span>
        <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight">Welcome Aboard</h2>
        <div className="w-16 h-[2px] bg-tertiary/30 mx-auto" />
        <p className="font-body text-on-surface-variant max-w-md mx-auto">
          We've arranged a luxurious stay to ensure your comfort throughout the wedding festivities.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-6 space-y-10 pt-10">
        {/* Hotel card */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-tertiary/10 to-transparent rounded-xl blur opacity-25" />
          <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm mandala-bg border border-outline-variant/10">
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src={WEDDING.hotel.image}
                alt={WEDDING.hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="font-headline text-2xl text-primary">{WEDDING.hotel.name}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                  {WEDDING.hotel.address}
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl cta-gradient text-on-primary font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-sm">near_me</span>
                Navigate to Venue
              </a>
            </div>
          </div>
        </section>

        {/* Room assignment */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="font-headline text-xl text-on-surface shrink-0">Your Room Assignment</h3>
            <div className="h-px w-full bg-outline-variant/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room number */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-3 border border-outline-variant/10">
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined">hotel</span>
                <span className="font-label text-xs uppercase tracking-widest font-bold">Reservation</span>
              </div>
              {roomNumber ? (
                <>
                  <p className="text-3xl font-headline text-on-surface">{roomNumber}</p>
                  <p className="text-sm text-on-surface-variant font-medium">Grand Luxury Collection</p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-headline text-on-surface/40">TBA</p>
                  <p className="text-sm text-on-surface-variant">Room assignment will be updated soon.</p>
                </div>
              )}
            </div>
            {/* Check-in/out */}
            <div className="bg-surface-container-high p-6 rounded-xl space-y-3 border border-outline-variant/10">
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined">schedule</span>
                <span className="font-label text-xs uppercase tracking-widest font-bold">Timings</span>
              </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wide">Check-In</p>
                  <p className="font-headline text-xl">{WEDDING.hotel.checkIn}</p>
                  <p className="text-xs text-on-surface-variant">{WEDDING.hotel.checkInDate}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wide">Check-Out</p>
                  <p className="font-headline text-xl">{WEDDING.hotel.checkOut}</p>
                  <p className="text-xs text-on-surface-variant">{WEDDING.hotel.checkOutDate}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting here */}
        <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-tertiary">flight</span>
            <h3 className="font-headline text-xl">Getting Here</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-sm">flight_land</span>
              </div>
              <div className="space-y-0.5">
                <p className="font-headline text-base text-on-surface">Nearest International Airport</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  New Delhi (Indira Gandhi International Airport) is the closest international gateway to arrive in India.
                </p>
              </div>
            </div>
            <div className="h-px bg-outline-variant/15" />
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-sm">connecting_airports</span>
              </div>
              <div className="space-y-0.5">
                <p className="font-headline text-base text-on-surface">Onward to the Venue</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  From Delhi, take a domestic flight to Chandigarh — or hop in a taxi straight to the venue.
                </p>
              </div>
            </div>
            <div className="h-px bg-outline-variant/15" />
            <a
              href="tel:+14377775369"
              className="flex gap-4 items-center group"
            >
              <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-sm">call</span>
              </div>
              <div>
                <p className="font-headline text-base text-on-surface group-hover:text-primary transition-colors">Any questions? Message us</p>
                <p className="text-sm text-secondary font-medium tracking-wide">+1-437-777-5369</p>
              </div>
            </a>
          </div>
        </section>

        {/* Itinerary snapshot */}
        <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <h3 className="font-headline text-xl text-center">Upcoming at Venue</h3>
          <div className="space-y-8">
            {events.map((event, i) => {
              const isFirst = i === 0
              return (
                <div key={event.slug} className={`flex gap-6 items-start ${!isFirst ? 'opacity-50' : ''}`}>
                  <div className="pt-1 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${isFirst ? 'bg-primary ring-4 ring-primary-container/30' : 'bg-outline-variant'}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-label text-xs text-tertiary font-bold uppercase tracking-widest">{formatEventWhen(event)}</p>
                    <p className="font-headline text-lg">{event.name}</p>
                    <p className="text-sm text-on-surface-variant">{shortVenue(event)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
