export default function RoomCard({ room, onUnassign }) {
  const assigned = room.room_assignments ?? []
  const isFull = assigned.length >= room.capacity

  return (
    <div style={{ padding: '1rem', border: `1px solid ${isFull ? '#f87171' : '#e5e7eb'}`, borderRadius: 10, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600 }}>Room {room.room_number}</span>
        <span style={{ fontSize: '0.78rem', color: isFull ? '#dc2626' : '#059669', fontWeight: 600 }}>
          {assigned.length}/{room.capacity}
        </span>
      </div>
      {assigned.length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {assigned.map(a => (
            <li key={a.guest_id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              {a.guests?.name}
              <button onClick={() => onUnassign(a.guest_id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>No guests assigned</p>
      )}
    </div>
  )
}
