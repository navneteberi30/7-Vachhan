import Badge from '../common/Badge'

const STATUS_COLOR = { confirmed: 'green', declined: 'red', pending: 'yellow' }

export default function GuestCard({ guest }) {
  const status = guest.rsvp_status ?? 'pending'
  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600 }}>{guest.name}</span>
        <Badge label={status.charAt(0).toUpperCase() + status.slice(1)} color={STATUS_COLOR[status]} />
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{guest.email}</p>
      {guest.dietary_restrictions && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Diet: {guest.dietary_restrictions}</p>
      )}
    </div>
  )
}
