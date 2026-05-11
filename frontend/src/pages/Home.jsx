import { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../hooks/useEvents'
import useCountdown from '../hooks/useCountdown'
import { WEDDING } from '../config/wedding'
import InstallAppHint from '../components/InstallAppHint'

function pad(n) { return String(n).padStart(2, '0') }

const photos = WEDDING.heroPhotos?.length ? WEDDING.heroPhotos : [WEDDING.heroImage]

function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % photos.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${WEDDING.groomName} & ${WEDDING.brideName}`}
          className="absolute inset-0 w-full h-full scale-125 object-cover object-[center_70%] transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
      {/* Dot indicators — only shown when more than one photo */}
      {photos.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function Home() {
  const { guest } = useAuth()
  const { days, hours, minutes } = useCountdown(WEDDING.weddingDate)
  const { events } = useEvents()
  const nextEvent = events[0]

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ height: '80vh', minHeight: 480 }}>
        <HeroCarousel />
        <div className="absolute inset-0 hero-gradient flex flex-col justify-end px-6 pb-20">
          <div className="max-w-4xl mx-auto w-full">
            <span className="text-tertiary font-label tracking-[0.2em] uppercase text-xs mb-2 block">
              Our Forever Begins
            </span>
            <h2 className="text-5xl md:text-7xl text-primary font-headline italic mb-4 leading-tight">
              {WEDDING.groomName} &amp; {WEDDING.brideName}
            </h2>
            <p className="text-on-surface/80 max-w-md text-lg leading-relaxed font-body">
              {WEDDING.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="px-6 -mt-12 relative z-10">
        <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-xl shadow-sm p-8 flex justify-around items-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-tertiary">
            <span className="material-symbols-outlined text-8xl">filter_vintage</span>
          </div>
          {[
            { value: pad(days),    label: 'Days'    },
            { value: pad(hours),   label: 'Hours'   },
            { value: pad(minutes), label: 'Mins'    },
          ].map(({ value, label }, i) => (
            <Fragment key={label}>
              {i > 0 && <div className="h-8 w-px bg-outline-variant/30" />}
              <div className="flex flex-col">
                <span className="text-3xl font-headline text-primary font-bold">{value}</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">{label}</span>
              </div>
            </Fragment>
          ))}
        </div>
        <InstallAppHint />
      </section>

      {/* Message */}
      <section className="px-6 pt-16 pb-10 max-w-3xl mx-auto text-center">
        <span className="material-symbols-outlined text-tertiary text-4xl mb-6">auto_awesome</span>
        <h3 className="text-3xl font-headline text-on-surface mb-6 italic">A message from Us</h3>
        <p className="text-on-surface-variant text-lg leading-relaxed font-body italic">
          {WEDDING.coupleQuote}
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link to="/rsvp" className="cta-gradient text-on-primary px-8 py-3 rounded-full font-label font-bold text-sm tracking-wide shadow-lg hover:opacity-90 transition-opacity">
            RSVP NOW
          </Link>
          <Link to="/events" className="border border-tertiary/20 text-secondary px-8 py-3 rounded-full font-label font-bold text-sm tracking-wide hover:bg-surface-container-low transition-colors">
            VIEW ITINERARY
          </Link>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 pt-8 pb-12 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">

          {/* Header row */}
          <div className="mb-8">
            <span className="text-tertiary font-label tracking-widest uppercase text-xs">How It All Began</span>
            <h3 className="text-4xl md:text-5xl font-headline italic text-primary mt-1">Our Story</h3>
          </div>

          {/* Photo + text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Photo — fades into background */}
            <img
              src={WEDDING.ourStory.photo}
              alt={`${WEDDING.groomName} & ${WEDDING.brideName}`}
              className="w-full h-72 md:h-[420px] object-cover rounded-xl"
              style={{ maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)' }}
            />

            {/* Story text */}
            <div className="flex flex-col justify-center space-y-5">
              {WEDDING.ourStory.text.split('\n\n').map((para, i) => (
                <p key={i} className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed italic">
                  {para}
                </p>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Quick links */}
      <section className="px-6 pt-8 pb-2 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link to="/gallery" className="bg-surface-container-highest p-8 rounded-xl flex flex-col justify-between h-56 hover:shadow-md transition-shadow group">
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-4">photo_library</span>
              <h4 className="text-xl font-headline">Gallery</h4>
              <p className="text-on-surface-variant text-sm mt-2">Relive our pre-wedding moments and share your own memories.</p>
            </div>
            <span className="text-primary material-symbols-outlined self-end group-hover:translate-x-1 transition-transform">north_east</span>
          </Link>
          <Link to="/stay" className="bg-surface-container p-8 rounded-xl flex flex-col justify-between h-56 hover:shadow-md transition-shadow group cursor-pointer">
            <div>
              <span className="material-symbols-outlined text-tertiary text-3xl mb-4">hotel</span>
              <h4 className="text-xl font-headline">Stay Info</h4>
              <p className="text-on-surface-variant text-sm mt-2">Details about travel, room bookings, and check-in times.</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-tertiary font-label text-xs font-bold tracking-widest uppercase">View Details</span>
              <span className="text-tertiary material-symbols-outlined group-hover:translate-x-1 transition-transform">north_east</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
