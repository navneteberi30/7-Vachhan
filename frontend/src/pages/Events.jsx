import { Link } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { WEDDING } from '../config/wedding'

const ACCENT_ICONS = { haldi: 'brightness_7', cocktail: 'wine_bar', mehndi: 'draw', wedding: 'favorite' }
const ACCENT_COLORS = {
  haldi:    'bg-tertiary-container/20 text-tertiary',
  cocktail: 'bg-secondary-container/20 text-secondary',
  mehndi:   'bg-primary-container/20 text-primary',
  wedding:  'bg-primary-container/20 text-primary',
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Events() {
  const { events, loading } = useEvents()

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
    </div>
  )

  return (
    <div className="bg-background text-on-surface">
      <div className="pt-12 pb-8 px-6 max-w-5xl mx-auto text-center">
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary font-bold mb-2 block">The Journey</span>
        <h2 className="text-4xl md:text-5xl font-headline text-primary mb-4">Celebration Itinerary</h2>
        <p className="text-on-surface-variant max-w-lg mx-auto font-body">
          Join us as we weave together stories, traditions, and joy across three magical days of celebration.
        </p>
      </div>

      <div className="relative space-y-8 px-6 max-w-5xl mx-auto pb-12">
        {events.map((event, index) => {
          const isReverse = index % 2 !== 0
          return (
            <div key={event.id} className={`flex flex-col ${isReverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 items-center group`}>
              {/* Image */}
              <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden shadow-sm relative flex-shrink-0">
                <img
                  src={WEDDING.eventImages[event.slug]}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className={`absolute ${isReverse ? 'top-4 right-4' : 'top-4 left-4'} bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full border border-tertiary/20`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
                    {formatDate(event.event_date)}
                  </span>
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm relative overflow-hidden mandala-bg">
                <div className={`absolute -bottom-10 ${isReverse ? '-left-10' : '-right-10'} opacity-[0.03] text-tertiary pointer-events-none`}>
                  <span className="material-symbols-outlined text-[160px]">{ACCENT_ICONS[event.slug]}</span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-headline text-on-surface mb-1">{event.name}</h3>
                    <div className="flex items-center gap-2 text-secondary font-label text-sm font-medium">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{event.event_time} — {event.theme_label}</span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${ACCENT_COLORS[event.slug]}`}>
                    <span className="material-symbols-outlined">{ACCENT_ICONS[event.slug]}</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body mb-6 leading-relaxed">{event.description}</p>
                <Link
                  to={`/events/${event.slug}`}
                  className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                  Event Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
