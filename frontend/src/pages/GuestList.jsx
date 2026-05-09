import { useState } from 'react'
import { useGuests } from '../hooks/useGuests'

const STATUS_LABELS = { confirmed: 'Confirmed', declined: 'Declined', pending: 'Pending' }
const STATUS_COLORS = { confirmed: '#059669', declined: '#dc2626', pending: '#d97706' }

export default function GuestList() {
  const { guests, loading, error } = useGuests()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = guests.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (g.rsvp_status ?? 'pending') === filter
    return matchesSearch && matchesFilter
  })

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Guest List</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          placeholder="Search guests..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {loading ? (
        <p>Loading guests...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              {['Name', 'Email', 'Phone', 'RSVP Status', 'Dietary'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(guest => (
              <tr key={guest.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{guest.name}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{guest.email}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{guest.phone}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, color: '#fff', background: STATUS_COLORS[guest.rsvp_status ?? 'pending'] }}>
                    {STATUS_LABELS[guest.rsvp_status ?? 'pending']}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{guest.dietary_restrictions ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
