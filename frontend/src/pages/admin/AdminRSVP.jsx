import { useEffect, useState, useMemo } from 'react'
import { fetchAllRsvpResponses } from '../../services/admin'
import { WEDDING } from '../../config/wedding'

export default function AdminRSVP() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventSlug, setEventSlug] = useState('__all__')

  useEffect(() => {
    fetchAllRsvpResponses()
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (eventSlug === '__all__') return rows
    return rows.filter(r => r.events?.slug === eventSlug)
  }, [rows, eventSlug])

  const eventOptions = useMemo(
    () => [{ slug: '__all__', name: 'All events' }, ...WEDDING.events.map(e => ({ slug: e.slug, name: e.name }))],
    []
  )

  return (
    <div>
      <h1 className="font-headline text-3xl text-on-surface mb-2">RSVP responses</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Per-event attendance from linked guests. Export or follow up from here.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {eventOptions.map(opt => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => setEventSlug(opt.slug)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
              eventSlug === opt.slug ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 p-3 text-error text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-on-surface-variant text-sm">No RSVP rows yet for this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-left text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Attending</th>
                <th className="px-4 py-3">Headcount</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-outline-variant/10">
                  <td className="px-4 py-3 font-medium">{r.guests?.name ?? '—'}</td>
                  <td className="px-4 py-3">{r.events?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {r.attending ? (
                      <span className="text-tertiary font-semibold">Yes</span>
                    ) : (
                      <span className="text-on-surface-variant">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.guest_count ?? 1}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[200px] truncate" title={r.dietary_notes}>
                    {r.dietary_notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
