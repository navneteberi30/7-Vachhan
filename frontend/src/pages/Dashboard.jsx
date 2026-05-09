import { useGuests } from '../hooks/useGuests'

export default function Dashboard() {
  const { guests, loading } = useGuests()

  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
  const declined = guests.filter(g => g.rsvp_status === 'declined').length
  const pending = guests.filter(g => !g.rsvp_status || g.rsvp_status === 'pending').length

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Guests', value: total, color: '#7c3aed' },
            { label: 'Confirmed', value: confirmed, color: '#059669' },
            { label: 'Declined', value: declined, color: '#dc2626' },
            { label: 'Pending RSVP', value: pending, color: '#d97706' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '1.5rem', background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}` }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{label}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
