import { useEffect, useState } from 'react'
import { fetchAdminStats } from '../../services/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(e => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-error text-sm">
        {error}
      </div>
    )
  }

  const cards = stats
    ? [
        { label: 'Guests', value: stats.guestCount, icon: 'group', hint: 'Invite records' },
        { label: 'Photos pending', value: stats.pendingPhotos, icon: 'schedule', hint: 'Awaiting review' },
        { label: 'Photos live', value: stats.approvedPhotos, icon: 'photo_library', hint: 'In gallery' },
        { label: 'Room assignments', value: stats.roomAssignments, icon: 'hotel', hint: 'Guests with a room' },
        { label: 'RSVP “yes” rows', value: stats.attendingRsvpRows, icon: 'how_to_reg', hint: 'Per-event responses' },
      ]
    : []

  return (
    <div>
      <h1 className="font-headline text-3xl text-on-surface mb-2">Overview</h1>
      <p className="text-sm text-on-surface-variant mb-8">Quick counts across your wedding app.</p>

      {!stats ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon, hint }) => (
            <div
              key={label}
              className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{label}</p>
                  <p className="font-headline text-4xl text-primary mt-1 tabular-nums">{value}</p>
                  <p className="text-[11px] text-on-surface-variant mt-2">{hint}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/40">{icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
