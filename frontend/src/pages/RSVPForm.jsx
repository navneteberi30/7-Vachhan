import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../hooks/useEvents'
import { submitRSVP, fetchGuestRSVPs } from '../services/events'
import { getAuthProviderLabel } from '../services/auth'
import { WEDDING } from '../config/wedding'

// Decorative assets — same family as GuestLogin for visual continuity inside the app shell.
const GATE_DECOR = {
  mandalaL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKxx7B0Fft-Qu3iFBE1UyqHc-pFuw7LOcnXJN8CjCSldgsSix27646DSwVV6SJv8bhli_NL9bD9bYipuTKLxAghxUUI5s51zSuV-bBk_lS9ETeaE3pGDUV9dIshS4F2L4zUewLca-yZ1_ga6US_MJG5vMk72uC1uBOxbgzOwfBnf6lpIqWX-2Z-oXbibL33LeRpxkoG68RbK_SygYPQ-dNC7kob_iofypROtqVNOKQ9HSMrdXSA437rDBUQRo7PngJ1oOCzQvTH2c',
  mandalaR: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCliyWEJvG07bgd7yo0dTj7ggJFXmu4adk9XTus1foyUFnj-o9u7v4oY3XgZY2JvtOHEdKUBN10Y2pM3Y0atb5Ms0RuUkFLoiRhnJIHgX0kaXMnH4mJt549liDi0StFPks5lMFLoxZQxwZtdKQOIYOg2CQ0MLFd_knL9tK4zzMLmcJmcJb99TFHreNKkWUqBkQgr820u9irGD64r0lkMFcMWZMxTk7T3d1W6mOflPuk2gKhQBBDAH0f5DCLN-AiEnHKPihaCUPC2J8',
}

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
  const rsvpByEventId = Object.fromEntries(existingRSVPs.map(r => [r.event_id, r]))

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
        {events.map(event => {
          const rsvp = rsvpByEventId[event.id]
          if (!rsvp) return null
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

// ── Invite-code gate (signed in, but no guest record yet) ───────────────────────
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
    <div className="relative bg-background text-on-surface min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Soft mandala accents — matches GuestLogin / heirloom theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -left-[12%] h-64 w-64 opacity-[0.045]">
          <img src={GATE_DECOR.mandalaL} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="absolute bottom-[15%] -right-[10%] h-64 w-64 rotate-180 opacity-[0.045]">
          <img src={GATE_DECOR.mandalaR} alt="" className="h-full w-full object-contain" />
        </div>
      </div>

      <div className="relative z-10">
        <section className="mx-auto max-w-lg px-6 pb-2 pt-10 text-center">
          <p className="font-label mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">
            Your invitation
          </p>
          <div className="mx-auto mb-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-gradient-to-br from-tertiary/12 to-primary/8 ring-1 ring-tertiary/15">
            <span
              className="material-symbols-outlined text-[2.25rem] text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mark_email_read
            </span>
          </div>
          <h2 className="font-headline mb-3 text-3xl italic tracking-tight text-primary md:text-4xl">
            RSVP is Invite-Only
          </h2>
          <p className="font-body mx-auto max-w-md text-sm leading-relaxed text-on-surface-variant md:text-base">
            Enter the code from your wedding card to unlock RSVP. We&apos;ll save it to this account so you won&apos;t need it again.
          </p>
          <div className="mt-7 flex justify-center">
            <div className="h-px w-20 bg-tertiary/25" />
          </div>
        </section>

        <div className="mx-auto max-w-md px-6 pb-16 pt-4">
          <div className="glass-panel mandala-bg relative overflow-hidden rounded-2xl border border-white/40 p-6 shadow-[0_32px_64px_-12px_rgba(56,56,51,0.08)] md:p-8">
            <div className="pointer-events-none absolute -right-2 -top-2 opacity-[0.07]">
              <span className="material-symbols-outlined text-7xl text-tertiary">filter_vintage</span>
            </div>

            <div className="relative mb-8 flex items-center gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm">
              {authUser?.user_metadata?.avatar_url ? (
                <img
                  src={authUser.user_metadata.avatar_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border-2 border-primary/15 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-on-secondary-container">
                  {(authUser?.user_metadata?.full_name || authUser?.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="truncate font-headline text-lg text-on-surface">
                  {authUser?.user_metadata?.full_name || authUser?.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 font-label text-[11px] uppercase tracking-wider text-outline">
                  <span className="material-symbols-outlined text-[14px] text-secondary">account_circle</span>
                  {getAuthProviderLabel(authUser)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div>
                <label className="font-label mb-2 block text-[11px] font-bold uppercase tracking-widest text-secondary" htmlFor="invite_code">
                  Invite code
                </label>
                <div className="rounded-xl border-2 border-outline-variant/25 bg-surface-container-high/90 transition-colors focus-within:border-tertiary/70 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(123,97,0,0.08)]">
                  <input
                    id="invite_code"
                    type="text"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NS-A7X2"
                    required
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="w-full rounded-xl border-0 bg-transparent px-4 py-3.5 font-mono text-lg tracking-[0.18em] text-on-surface placeholder:text-outline-variant/45 focus:ring-0"
                  />
                </div>
              </div>

              {error && (
                <div
                  className={`rounded-xl p-4 text-sm ${
                    error.includes('already linked')
                      ? 'border border-amber-200 bg-amber-50 text-amber-800'
                      : 'bg-error/10 text-error'
                  }`}
                >
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[18px]">
                      {error.includes('already linked') ? 'link_off' : 'error'}
                    </span>
                    {error.includes('already linked') ? 'Code already linked' : 'Invalid code'}
                  </p>
                  <p className="pl-[26px] text-xs opacity-90">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cta-gradient flex h-14 w-full items-center justify-center gap-2 rounded-full font-body font-semibold text-on-primary shadow-xl shadow-primary/15 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Linking…
                  </>
                ) : (
                  <>
                    Unlock RSVP
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 border-t border-outline-variant/15 pt-6 text-center font-body text-xs leading-relaxed text-on-surface-variant">
              Don&apos;t have a code? Message {WEDDING.groomName} &amp; {WEDDING.brideName} — you can still enjoy Home, Events &amp; Gallery anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main RSVP page ────────────────────────────────────────────────────────────
export default function RSVPForm() {
  const { authUser, guest } = useAuth()
  const { events } = useEvents()

  // Signed in but invite not yet claimed → show the gate.
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
