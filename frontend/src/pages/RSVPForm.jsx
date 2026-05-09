import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../hooks/useEvents'
import { submitRSVP, fetchGuestRSVPs } from '../services/events'
import { WEDDING } from '../config/wedding'

const EVENT_ICONS = { haldi: 'spa', cocktail: 'celebration', mehndi: 'local_florist', wedding: 'favorite' }
const NEEDS_COUNT = ['haldi', 'cocktail', 'mehndi', 'wedding']
const UUID_RE     = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Lock edits 2 weeks before the wedding date
const LOCK_DATE = new Date(WEDDING.weddingDate)
LOCK_DATE.setDate(LOCK_DATE.getDate() - 14)
const IS_LOCKED = new Date() >= LOCK_DATE

function GuestCounter({ value, onChange, min = 1 }) {
  return (
    <div className="flex items-center gap-4 bg-surface-container-high rounded-full px-4 py-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="text-secondary hover:text-primary transition-colors">
        <span className="material-symbols-outlined">remove</span>
      </button>
      <span className="font-bold text-lg w-5 text-center">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} className="text-secondary hover:text-primary transition-colors">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}

function formatEventDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

// ── Confirmed summary view ────────────────────────────────────────────────────
function RSVPSummary({ existingRSVPs, events, onEdit }) {
  const eventMap = Object.fromEntries(events.map(e => [e.id, e]))

  return (
    <div className="bg-background text-on-surface">
      <section className="pt-12 pb-8 text-center px-6 max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-5xl text-tertiary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <h2 className="font-headline text-4xl text-primary mb-2">You're All Set!</h2>
        <p className="font-body text-on-surface-variant">
          Here's a summary of your responses. We can't wait to celebrate with you!
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-px w-24 bg-tertiary/20" />
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-12 space-y-4">
        {existingRSVPs.map(rsvp => {
          const event = eventMap[rsvp.event_id]
          if (!event) return null
          return (
            <div key={rsvp.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rsvp.attending ? 'bg-tertiary/10' : 'bg-outline-variant/10'}`}>
                  <span
                    className={`material-symbols-outlined text-xl ${rsvp.attending ? 'text-tertiary' : 'text-outline'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {rsvp.attending ? (EVENT_ICONS[event.slug] ?? 'event') : 'cancel'}
                  </span>
                </div>
                <div>
                  <p className="font-headline text-lg text-on-surface">{event.name}</p>
                  <p className="font-label text-xs text-outline uppercase tracking-widest">
                    {formatEventDate(event.event_date)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {rsvp.attending ? (
                  <>
                    <p className="text-sm font-semibold text-primary">Attending</p>
                    {rsvp.guest_count > 1 && (
                      <p className="text-xs text-on-surface-variant">{rsvp.guest_count} guests</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-semibold text-outline">Not Attending</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Locked notice or edit button */}
        {IS_LOCKED ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
            <span className="material-symbols-outlined text-amber-500 text-2xl mb-2 block">lock</span>
            <p className="font-semibold text-amber-800 text-sm">Responses are now locked</p>
            <p className="text-amber-700 text-xs mt-1">
              RSVP changes are closed 2 weeks before the wedding.
              Contact Nav &amp; Sanju directly if you need to update.
            </p>
          </div>
        ) : (
          <div className="text-center pt-2">
            <button
              onClick={onEdit}
              className="cta-gradient text-on-primary font-bold py-4 px-12 rounded-full shadow-xl shadow-primary/10 hover:scale-[0.98] active:scale-[0.96] transition-transform duration-150 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit my response
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Invite-code gate (Google signed in, but no guest record yet) ──────────────
function InviteCodeGate() {
  const { authUser, linkCode } = useAuth()

  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await linkCode(inviteCode)
      // AuthContext updates `guest` on success — RSVPForm re-renders into the form.
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-surface">
      <section className="pt-12 pb-6 text-center px-6 max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-5xl text-tertiary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
          mail
        </span>
        <h2 className="font-headline text-4xl text-primary mb-2">RSVP is Invite-Only</h2>
        <p className="font-body text-on-surface-variant">
          Enter the invite code from your wedding card to unlock RSVP. We'll remember it for next time.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-px w-24 bg-tertiary/20" />
        </div>
      </section>

      <div className="max-w-md mx-auto px-6 pb-12">
        <div className="glass-panel p-8 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            {authUser?.user_metadata?.avatar_url
              ? (
                <img
                  src={authUser.user_metadata.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-primary/20"
                />
              )
              : (
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
                  {(authUser?.user_metadata?.full_name || authUser?.email || '?').charAt(0).toUpperCase()}
                </div>
              )
            }
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {authUser?.user_metadata?.full_name || authUser?.email}
              </p>
              <p className="text-xs text-on-surface-variant">Signed in with Google</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <label
                className="font-label text-[11px] uppercase tracking-widest text-secondary font-bold absolute -top-2 left-0 z-10"
                htmlFor="invite_code"
              >
                Invite Code
              </label>
              <input
                id="invite_code"
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. NS-A7X2"
                required
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-tertiary focus:ring-0 rounded-none pt-4 pb-2 px-0 text-on-surface placeholder:text-outline-variant/50 transition-all duration-300 font-mono tracking-widest text-base"
              />
            </div>

            {error && (
              <div className={`rounded-xl p-4 text-sm ${
                error.includes('already linked')
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-error/10 text-error'
              }`}>
                <p className="font-medium mb-1">
                  {error.includes('already linked') ? 'Code already linked' : 'Invalid code'}
                </p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 cta-gradient text-on-primary font-body font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
            >
              <span>{loading ? 'Linking…' : 'Unlock RSVP'}</span>
              {!loading && <span className="material-symbols-outlined text-xl">arrow_right_alt</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-on-surface-variant font-body text-xs">
            Don't have a code? Reach out to {WEDDING.groomName} &amp; {WEDDING.brideName} —
            you can still browse the rest of the app in the meantime.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main RSVP page ────────────────────────────────────────────────────────────
export default function RSVPForm() {
  const { authUser, guest } = useAuth()
  const { events } = useEvents()

  // Google signed in but invite not yet claimed → show the gate.
  // Hooks below run unconditionally so React state stays consistent across renders.
  const showInviteGate = !!authUser && !guest

  const [existingRSVPs, setExistingRSVPs] = useState(null) // null = loading
  const [isEditing, setIsEditing]         = useState(false)
  const [responses, setResponses]         = useState({})
  const [notes, setNotes]                 = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState(null)

  // Load existing RSVPs on mount
  useEffect(() => {
    if (!guest?.id || !UUID_RE.test(guest.id)) { setExistingRSVPs([]); return }
    fetchGuestRSVPs(guest.id)
      .then(data => {
        setExistingRSVPs(data)
        // Pre-fill form with existing answers
        const prefilled = {}
        data.forEach(r => {
          const event = events.find(e => e.id === r.event_id)
          if (event) prefilled[event.slug] = { attending: r.attending, guestCount: r.guest_count ?? 1 }
        })
        // Default any event not yet answered
        events.forEach(e => {
          if (!prefilled[e.slug]) prefilled[e.slug] = { attending: true, guestCount: 1 }
        })
        setResponses(prefilled)
        if (data[0]?.dietary_notes) setNotes(data[0].dietary_notes)
      })
      .catch(() => setExistingRSVPs([]))
  }, [guest?.id, events])

  function setAttending(slug, val) {
    setResponses(prev => ({ ...prev, [slug]: { ...prev[slug], attending: val } }))
  }
  function setCount(slug, val) {
    setResponses(prev => ({ ...prev, [slug]: { ...prev[slug], guestCount: val } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!guest || !UUID_RE.test(guest.id)) {
      setError('Session expired — please sign in again.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const updated = await Promise.all(events.map(ev =>
        submitRSVP({
          guestId:    guest.id,
          eventId:    ev.id,
          attending:  responses[ev.slug]?.attending ?? true,
          guestCount: responses[ev.slug]?.guestCount ?? 1,
          notes,
        })
      ))
      setExistingRSVPs(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Invite gate takes precedence over the form once auth has resolved.
  if (showInviteGate) {
    return <InviteCodeGate />
  }

  // Loading state
  if (existingRSVPs === null) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
      </div>
    )
  }

  // Show summary if RSVPs exist and not in edit mode
  if (existingRSVPs.length > 0 && !isEditing) {
    return (
      <RSVPSummary
        existingRSVPs={existingRSVPs}
        events={events}
        onEdit={() => setIsEditing(true)}
      />
    )
  }

  return (
    <div className="bg-background text-on-surface">
      <section className="pt-12 pb-8 text-center px-6 max-w-2xl mx-auto">
        <h2 className="font-headline text-5xl md:text-6xl text-primary mb-4 tracking-tight">
          {isEditing ? 'Edit Your Response' : 'Kindly Respond'}
        </h2>
        <p className="font-body text-on-surface-variant text-lg">
          {isEditing ? 'Update your plans below.' : 'We look forward to celebrating with you.'}
        </p>
        <div className="mt-8 flex justify-center">
          <div className="h-px w-24 bg-tertiary/20" />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 pb-12 space-y-6">
        {events.map(event => {
          const r = responses[event.slug] ?? { attending: true, guestCount: 1 }
          const needsCount = NEEDS_COUNT.includes(event.slug)
          return (
            <div key={event.id} className="bg-surface-container-lowest rounded-xl p-6 mandala-bg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-2xl text-secondary mb-1">{event.name}</h3>
                  <p className="font-label text-sm text-outline uppercase tracking-widest">
                    {formatEventDate(event.event_date)} • {event.event_time.split(' ')[0]} {event.event_time.split(' ')[1]}
                  </p>
                </div>
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {EVENT_ICONS[event.slug] ?? 'event'}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex bg-surface-container-low p-1 rounded-full w-full">
                  <button type="button"
                    onClick={() => setAttending(event.slug, true)}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${r.attending ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Attending
                  </button>
                  <button type="button"
                    onClick={() => setAttending(event.slug, false)}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${!r.attending ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Not Attending
                  </button>
                </div>

                {r.attending && needsCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface font-medium text-sm">Number of Guests</span>
                    <GuestCounter value={r.guestCount} onChange={v => setCount(event.slug, v)} />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className="mt-4">
          <label className="block font-headline text-xl text-secondary mb-4">Additional Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Dietary restrictions, accessibility needs, special requests…"
            className="w-full bg-surface-container-high border-0 border-b-2 border-tertiary-fixed-dim focus:ring-0 focus:border-primary placeholder-outline-variant rounded-t-xl font-body p-4 transition-all resize-none text-sm"
          />
        </div>

        {error && <p className="text-error text-sm font-medium">{error}</p>}

        <div className="text-center pt-4 space-y-3">
          <button
            type="submit"
            disabled={submitting}
            className="cta-gradient w-full md:w-auto md:min-w-[300px] text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-primary/10 hover:scale-[0.98] active:scale-[0.96] transition-transform duration-150 disabled:opacity-60 disabled:cursor-wait"
          >
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Send Response'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="block w-full text-center text-on-surface-variant text-sm underline decoration-on-surface-variant/30 hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          )}

          {!isEditing && (
            <p className="text-xs font-label text-outline uppercase tracking-widest">
              Responses needed by November 15th
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
