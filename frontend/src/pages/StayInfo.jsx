import { useAuth } from '../contexts/AuthContext'
import { WEDDING } from '../config/wedding'

export default function StayInfo() {
  const { guest } = useAuth()
  // Try to get room assignment from Supabase; fall back to a friendly message
  const roomNumber = null // Will be populated from room_assignments table

  const mapsUrl = `https://maps.google.com/?q=${WEDDING.hotel.mapsQuery}`

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
      {/* Hero header */}
      <section className="pt-12 px-6 text-center space-y-3 max-w-2xl mx-auto">
        <span className="font-label text-tertiary uppercase tracking-[0.2em] text-xs font-semibold">Your Stay Experience</span>
        <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight">Welcome Home</h2>
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
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wide">Check-Out</p>
                  <p className="font-headline text-xl">{WEDDING.hotel.checkOut}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Itinerary snapshot */}
        <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <h3 className="font-headline text-xl text-center">Upcoming at Venue</h3>
          <div className="space-y-8">
            {WEDDING.stayItinerary.map((item, i) => (
              <div key={i} className={`flex gap-6 items-start ${!item.active ? 'opacity-50' : ''}`}>
                <div className="pt-1 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-primary ring-4 ring-primary-container/30' : 'bg-outline-variant'}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-label text-xs text-tertiary font-bold uppercase tracking-widest">{item.when}</p>
                  <p className="font-headline text-lg">{item.title}</p>
                  <p className="text-sm text-on-surface-variant">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
